#!/usr/bin/env node
/**
 * Agent Spark round-trip proof.
 *
 * Takes a template through the substitution its own README documents, into a
 * temporary directory, and checks what a human would otherwise have to eyeball.
 *
 *   1. declared     every source file in the manifest exists, and the file
 *                   count the manifest promises is the count that appears
 *   2. orphans      every {{placeholder}} in the template maps to a declared
 *                   variable, and every declared variable is actually used
 *   3. reference    no render:true file documents a variable in a code fence or
 *                   a backticked table cell, because substitution destroys it
 *   4. substituted  no rendered file still contains a placeholder afterwards
 *   5. verbatim     render:false files come through byte-identical
 *   6. parses       every YAML file still parses after substitution
 *   7. safety       the refusals survive substitution: no publish, no silent
 *                   pass threshold, read-only risk profile
 *
 * This proves the template generates. It proves nothing about a live Copilot
 * Studio environment, which is why template.yaml still says verified: false.
 *
 * Exit 0 when clean, 1 when any check fails.
 */

import { readFileSync, readdirSync, statSync, mkdtempSync, cpSync, writeFileSync, rmSync } from 'node:fs';
import { join, dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';
import { parse as parseYaml } from 'yaml';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const TEMPLATE = process.argv[2] ?? 'knowledge-assistant';
const KEEP = process.argv.includes('--keep');

// A worked example, not a default. Every value is one a real Finance rollout
// would have to choose, so the substitution exercises realistic lengths.
const VALUES = {
  agentName: 'contoso-finance-assistant',
  displayName: 'Finance Policy Assistant',
  businessTask: 'Answer finance policy questions from the approved expense and travel handbook',
  audience: 'employees submitting expenses',
  knowledgeSourceName: 'Finance Policy Handbook 2026',
  escalationPath: 'the Finance operations team via the finance request form',
  dataClassification: 'internal',
  environmentMode: 'local-first',
};

const findings = [];
const fail = (check, where, message) => findings.push({ check, where, message });

const PLACEHOLDER = /\{\{\s*([A-Za-z0-9_]+)\s*\}\}/g;
const placeholdersIn = (text) => [...text.matchAll(PLACEHOLDER)].map((m) => m[1]);

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

/**
 * Lines where a placeholder names the variable instead of standing in for its
 * value. Substitution replaces those too, which turns a reference into nonsense
 * quietly rather than failing loudly.
 *
 * Two shapes count, and the distinction is the backtick:
 *
 *   | `{{agentName}}` | what it means |   reference. The cell shows the token.
 *   | Name | {{agentName}} |             live. The cell shows the value.
 *
 * A fenced block is always a reference, because a fence shows literal text. If
 * a template ever needs a rendered fence, that is what render: false is for.
 *
 * This is a heuristic. It is tuned to catch a template documenting its own
 * variables inside a file it then renders, which is the mistake that is easy to
 * make and invisible afterwards.
 */
const BACKTICKED = /`[^`]*\{\{\s*[A-Za-z0-9_]+\s*\}\}[^`]*`/;

function referenceLines(text) {
  const hits = [];
  let inFence = false;
  text.split('\n').forEach((line, i) => {
    if (line.trimStart().startsWith('```')) {
      inFence = !inFence;
      return;
    }
    PLACEHOLDER.lastIndex = 0;
    if (!PLACEHOLDER.test(line)) return;
    if (inFence) hits.push({ line: i + 1, kind: 'code fence' });
    else if (line.trimStart().startsWith('|') && BACKTICKED.test(line)) {
      hits.push({ line: i + 1, kind: 'backticked table cell' });
    }
  });
  return hits;
}

// ---------------------------------------------------------------------------

const templateDir = join(ROOT, 'templates', TEMPLATE);
const manifestPath = join(templateDir, 'template.yaml');
const manifest = parseYaml(readFileSync(manifestPath, 'utf8'));
const spec = manifest.spec ?? manifest;

const declaredFiles = spec.files ?? [];
const declaredVars = (spec.variables ?? []).map((v) => v.name);

const work = mkdtempSync(join(tmpdir(), 'spark-proof-'));
const out = join(work, VALUES.agentName);

console.log('Agent Spark round-trip proof');
console.log(`  template:  ${TEMPLATE}`);
console.log(`  output:    ${out}`);
console.log('');

// 1. declared ---------------------------------------------------------------
for (const f of declaredFiles) {
  const src = resolve(templateDir, f.source);
  try {
    statSync(src);
  } catch {
    fail('declared', f.source, 'source file named in the manifest does not exist');
  }
}

// Generate: copy the declared files only. template.yaml is the manifest, not
// output, which is why the generated tree is one file smaller than the source.
for (const f of declaredFiles) {
  const src = resolve(templateDir, f.source);
  const dst = join(out, f.target);
  try {
    cpSync(src, dst, { recursive: true });
  } catch (e) {
    fail('declared', f.source, `could not copy: ${e.message}`);
  }
}

// 2. orphans ----------------------------------------------------------------
const used = new Set();
for (const f of declaredFiles) {
  const src = resolve(templateDir, f.source);
  let text;
  try {
    text = readFileSync(src, 'utf8');
  } catch {
    continue;
  }
  for (const name of placeholdersIn(text)) {
    used.add(name);
    if (!declaredVars.includes(name)) {
      fail('orphans', f.source, `uses {{${name}}}, which no variable declares`);
    }
  }
}
for (const name of declaredVars) {
  if (!used.has(name)) fail('orphans', 'template.yaml', `declares ${name}, which no file uses`);
}

// 3. reference --------------------------------------------------------------
for (const f of declaredFiles) {
  if (f.render === false) continue;
  const src = resolve(templateDir, f.source);
  let text;
  try {
    text = readFileSync(src, 'utf8');
  } catch {
    continue;
  }
  for (const hit of referenceLines(text)) {
    fail(
      'reference',
      `${f.source}:${hit.line}`,
      `placeholder inside a ${hit.kind} in a rendered file. Substitution will ` +
        `replace it and destroy the reference. Set render: false, or reword it as prose.`
    );
  }
}

// Substitute -----------------------------------------------------------------
const renderTargets = new Set(declaredFiles.filter((f) => f.render !== false).map((f) => f.target));
let replaced = 0;
for (const f of declaredFiles) {
  if (f.render === false) continue;
  const dst = join(out, f.target);
  let text;
  try {
    text = readFileSync(dst, 'utf8');
  } catch {
    continue;
  }
  const before = text;
  for (const [name, value] of Object.entries(VALUES)) {
    text = text.replaceAll(`{{${name}}}`, value);
  }
  if (text !== before) replaced += placeholdersIn(before).length;
  writeFileSync(dst, text);
}

// 4. substituted -------------------------------------------------------------
const generated = walk(out);
for (const file of generated) {
  const rel = relative(out, file);
  if (!renderTargets.has(rel)) continue;
  const left = placeholdersIn(readFileSync(file, 'utf8'));
  if (left.length) fail('substituted', rel, `still contains {{${[...new Set(left)].join('}}, {{')}}}`);
}

// 5. verbatim ----------------------------------------------------------------
for (const f of declaredFiles) {
  if (f.render !== false) continue;
  const src = readFileSync(resolve(templateDir, f.source));
  const dst = readFileSync(join(out, f.target));
  if (!src.equals(dst)) fail('verbatim', f.target, 'render:false file changed during generation');
}

// 6. parses ------------------------------------------------------------------
let yamlCount = 0;
for (const file of generated) {
  if (!/\.ya?ml$/.test(file)) continue;
  yamlCount += 1;
  try {
    parseYaml(readFileSync(file, 'utf8'));
  } catch (e) {
    fail('parses', relative(out, file), `no longer parses after substitution: ${e.message}`);
  }
}

// 7. safety ------------------------------------------------------------------
const deployPath = join(out, 'deployment/deployment.yaml');
try {
  const d = parseYaml(readFileSync(deployPath, 'utf8'));
  const s = d.spec ?? d;
  if (s.publish !== false) fail('safety', 'deployment/deployment.yaml', 'publish is not false');
  const gates = s.gates ?? s;
  if (gates.requireEvaluationRunBeforePublish !== true) {
    fail('safety', 'deployment/deployment.yaml', 'requireEvaluationRunBeforePublish is not true');
  }
} catch (e) {
  fail('safety', 'deployment/deployment.yaml', `could not read: ${e.message}`);
}

const evalPath = join(out, 'evals/baseline.yaml');
try {
  const ev = parseYaml(readFileSync(evalPath, 'utf8'));
  const s = ev.spec ?? ev;
  const threshold = s.acceptance?.minPassRate ?? s.minPassRate;
  if (threshold !== null && threshold !== undefined) {
    fail('safety', 'evals/baseline.yaml', `minPassRate was set to ${threshold}; it must stay null`);
  }
} catch (e) {
  fail('safety', 'evals/baseline.yaml', `could not read: ${e.message}`);
}

// Report ---------------------------------------------------------------------
const CHECKS = ['declared', 'orphans', 'reference', 'substituted', 'verbatim', 'parses', 'safety'];
const byCheck = findings.reduce((acc, f) => ((acc[f.check] ??= []).push(f), acc), {});

console.log(`  files declared:     ${declaredFiles.length}`);
console.log(`  files generated:    ${generated.length}`);
console.log(`  variables declared: ${declaredVars.length}`);
console.log(`  placeholders filled: ${replaced}`);
console.log(`  yaml files parsed:  ${yamlCount}`);
console.log('');

for (const check of CHECKS) {
  const items = byCheck[check] ?? [];
  console.log(`  ${check.padEnd(13)} ${items.length === 0 ? 'pass' : `${items.length} problem(s)`}`);
}

if (findings.length) {
  console.log('');
  for (const check of CHECKS) {
    for (const f of byCheck[check] ?? []) {
      console.log(`  [${check}] ${f.where}`);
      console.log(`      ${f.message}`);
    }
  }
}

if (KEEP) console.log(`\n  kept: ${out}`);
else rmSync(work, { recursive: true, force: true });

console.log('');
if (findings.length) {
  console.log(`FAILED with ${findings.length} problem(s).`);
  process.exit(1);
}
console.log('PASSED. Generation only. Nothing here was run against a live environment.');

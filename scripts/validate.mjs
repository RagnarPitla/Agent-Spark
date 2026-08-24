#!/usr/bin/env node
/**
 * Agent Spark repository validator.
 *
 * Four checks that prose cannot make:
 *   1. schema      every manifest validates against its JSON Schema
 *   2. references  every file path named inside a manifest exists on disk
 *   3. secrets     no tracked file contains a likely credential
 *   4. ascii       no Markdown contains non-ASCII typographic characters
 *
 * Exit 0 when clean, 1 when any check fails. This is what CI runs.
 */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, dirname, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import { parse as parseYaml } from 'yaml';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SKIP_DIRS = new Set(['.git', 'node_modules', '.github/workflows/cache']);

const findings = [];
let checked = 0;

function fail(file, check, message) {
  findings.push({ file: relative(ROOT, file) || file, check, message });
}

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    if (SKIP_DIRS.has(entry)) continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

function exists(path) {
  try {
    statSync(path);
    return true;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Schema setup
// ---------------------------------------------------------------------------

const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);

const schemas = {};
for (const name of ['agent-project', 'template', 'skill', 'evaluation']) {
  schemas[name] = ajv.compile(JSON.parse(readFileSync(join(ROOT, 'schemas', `${name}.schema.json`), 'utf8')));
}

function validateAgainst(schemaName, data, file) {
  checked += 1;
  const validate = schemas[schemaName];
  if (validate(data)) return true;
  for (const err of validate.errors) {
    const at = err.instancePath || '(root)';
    fail(file, 'schema', `${at} ${err.message}${err.params?.allowedValues ? ` [${err.params.allowedValues}]` : ''}`);
  }
  return false;
}

// ---------------------------------------------------------------------------
// Check 1 and 2: schema conformance and reference resolution
// ---------------------------------------------------------------------------

/** Confirms a ./relative path named inside a manifest resolves on disk. */
function checkRef(baseDir, refPath, file, label) {
  if (typeof refPath !== 'string' || !refPath.startsWith('./')) return;
  const target = resolve(baseDir, refPath);
  if (!target.startsWith(ROOT + sep)) {
    fail(file, 'references', `${label} escapes the repository: ${refPath}`);
    return;
  }
  if (!exists(target)) fail(file, 'references', `${label} does not exist: ${refPath}`);
}

/** Splits YAML front matter from a Markdown body. */
function splitFrontMatter(raw) {
  if (!raw.startsWith('---\n')) return null;
  const end = raw.indexOf('\n---', 4);
  if (end === -1) return null;
  return { front: raw.slice(4, end), body: raw.slice(end + 4) };
}

function readYaml(file) {
  try {
    return parseYaml(readFileSync(file, 'utf8'));
  } catch (err) {
    fail(file, 'schema', `YAML parse error: ${err.message}`);
    return null;
  }
}

function validateTemplates() {
  const dir = join(ROOT, 'templates');
  if (!exists(dir)) return;
  for (const name of readdirSync(dir)) {
    const templateDir = join(dir, name);
    if (!statSync(templateDir).isDirectory()) continue;
    const manifestPath = join(templateDir, 'template.yaml');
    if (!exists(manifestPath)) {
      fail(templateDir, 'schema', 'template directory has no template.yaml');
      continue;
    }
    const doc = readYaml(manifestPath);
    if (!doc) continue;
    if (!validateAgainst('template', doc, manifestPath)) continue;

    if (doc.metadata.name !== name) {
      fail(manifestPath, 'schema', `metadata.name "${doc.metadata.name}" does not match directory "${name}"`);
    }
    for (const entry of doc.spec.files ?? []) {
      checkRef(templateDir, entry.source, manifestPath, `spec.files source`);
    }
    checkRef(templateDir, doc.spec.evaluations?.suite, manifestPath, 'spec.evaluations.suite');

    // Every variable referenced in a rendered file must be declared in spec.variables.
    const declared = new Set((doc.spec.variables ?? []).map((v) => v.name));
    for (const entry of doc.spec.files ?? []) {
      if (entry.render === false) continue;
      const source = resolve(templateDir, entry.source);
      if (!exists(source)) continue;
      const used = readFileSync(source, 'utf8').matchAll(/\{\{\s*([a-zA-Z][a-zA-Z0-9_]*)\s*\}\}/g);
      for (const match of used) {
        if (!declared.has(match[1])) {
          fail(source, 'references', `uses {{${match[1]}}} which is not declared in spec.variables`);
        }
      }
    }

    // Every pinned skill must exist in the catalog at that exact version.
    for (const pin of doc.spec.skills ?? []) {
      const [skillName, version] = pin.split('@');
      const skillFile = join(ROOT, 'skills', skillName, 'SKILL.md');
      if (!exists(skillFile)) {
        fail(manifestPath, 'references', `pinned skill not in catalog: ${pin}`);
        continue;
      }
      const parts = splitFrontMatter(readFileSync(skillFile, 'utf8'));
      const front = parts ? parseYaml(parts.front) : null;
      if (front && front.version !== version) {
        fail(manifestPath, 'references', `pin ${pin} but catalog has ${skillName}@${front.version}`);
      }
    }
  }
}

function validateSkills() {
  const dir = join(ROOT, 'skills');
  if (!exists(dir)) return;
  for (const name of readdirSync(dir)) {
    const skillDir = join(dir, name);
    if (!statSync(skillDir).isDirectory()) continue;
    const skillFile = join(skillDir, 'SKILL.md');
    if (!exists(skillFile)) {
      fail(skillDir, 'schema', 'skill directory has no SKILL.md');
      continue;
    }
    const parts = splitFrontMatter(readFileSync(skillFile, 'utf8'));
    if (!parts) {
      fail(skillFile, 'schema', 'SKILL.md has no YAML front matter delimited by ---');
      continue;
    }
    let front;
    try {
      front = parseYaml(parts.front);
    } catch (err) {
      fail(skillFile, 'schema', `front matter parse error: ${err.message}`);
      continue;
    }
    if (!validateAgainst('skill', front, skillFile)) continue;

    if (front.name !== name) {
      fail(skillFile, 'schema', `name "${front.name}" does not match directory "${name}"`);
    }
    checkRef(skillDir, front.evaluations, skillFile, 'evaluations');
    for (const ex of front.examples ?? []) checkRef(skillDir, ex.path, skillFile, `examples.${ex.kind}`);

    // A skill with a deprecated maturity and no replacement leaves adopters stranded.
    if (front.maturity === 'deprecated' && !front.deprecatedBy) {
      fail(skillFile, 'schema', 'maturity is deprecated but deprecatedBy names no replacement');
    }
  }
}

function validateEvaluationSuites() {
  for (const file of walk(ROOT)) {
    if (!/\.eval\.yaml$|evals[/\\][^/\\]+\.yaml$/.test(file)) continue;
    const doc = readYaml(file);
    if (!doc) continue;
    if (doc?.kind !== 'EvaluationSuite') continue;
    if (!validateAgainst('evaluation', doc, file)) continue;

    const ids = new Set();
    for (const c of doc.spec.cases) {
      if (ids.has(c.id)) fail(file, 'schema', `duplicate case id: ${c.id}`);
      ids.add(c.id);
    }
    // A shipped threshold nobody agreed to looks authoritative and is not.
    const acceptance = doc.spec.acceptance ?? {};
    if (acceptance.minPassRate !== null && acceptance.minPassRate !== undefined && !acceptance.setBy) {
      fail(file, 'schema', 'acceptance.minPassRate is set but acceptance.setBy names nobody');
    }
  }
}

function validateProjects() {
  for (const file of walk(ROOT)) {
    if (!file.endsWith('agentspark.yaml')) continue;
    const doc = readYaml(file);
    if (!doc) continue;
    if (!validateAgainst('agent-project', doc, file)) continue;

    const projectDir = dirname(file);
    checkRef(projectDir, doc.spec.instructions, file, 'spec.instructions');
    checkRef(projectDir, doc.spec.evaluations?.suite, file, 'spec.evaluations.suite');
    for (const s of doc.spec.skills ?? []) checkRef(projectDir, s, file, 'spec.skills entry');

    // A generated project that still contains template variables was never finished.
    for (const f of walk(projectDir)) {
      const text = readFileSync(f, 'utf8');
      const left = [...text.matchAll(/\{\{\s*([a-zA-Z][a-zA-Z0-9_]*)\s*\}\}/g)];
      if (left.length) {
        fail(f, 'references', `unreplaced template variables: ${[...new Set(left.map((m) => m[1]))].join(', ')}`);
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Check 3: secrets
// ---------------------------------------------------------------------------

const SECRET_PATTERNS = [
  [/AccountKey\s*=\s*[A-Za-z0-9+/]{40,}={0,2}/, 'Azure storage account key'],
  [/SharedAccessKey\s*=\s*[A-Za-z0-9+/]{20,}={0,2}/, 'Shared access key'],
  [/\bgh[pousr]_[A-Za-z0-9]{36,}/, 'GitHub token'],
  [/\bsk-[A-Za-z0-9]{32,}/, 'API secret key'],
  [/\bxox[baprs]-[A-Za-z0-9-]{10,}/, 'Slack token'],
  [/-----BEGIN (?:RSA |EC |OPENSSH |PGP )?PRIVATE KEY-----/, 'Private key block'],
  [/\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/, 'JSON Web Token'],
  [/\b(?:client_secret|clientsecret|password|passwd|api_key|apikey|secret)\s*[:=]\s*["']?(?!\$\{|<|REPLACE|CHANGE|your-|example|placeholder|null\b|""|'')[^\s"',}]{12,}/i, 'Hardcoded credential'],
];

function checkSecrets(files) {
  for (const file of files) {
    if (file.includes(`scripts${sep}validate.mjs`)) continue; // the patterns themselves live here
    let text;
    try {
      text = readFileSync(file, 'utf8');
    } catch {
      continue;
    }
    if (text.includes('\u0000')) continue; // binary
    for (const [pattern, label] of SECRET_PATTERNS) {
      const match = text.match(pattern);
      if (match) {
        const line = text.slice(0, match.index).split('\n').length;
        fail(file, 'secrets', `line ${line}: possible ${label}`);
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Check 4: ASCII-only Markdown
// ---------------------------------------------------------------------------

// Typographic characters that render as mojibake in terminals and in some GitHub views.
// Emoji are allowed; only these monochrome substitutes are rejected.
const BANNED_CHARS = new Map([
  ['\u00A7', 'section sign. Write the word "Section".'],
  ['\u2014', 'em dash. Use "-".'],
  ['\u2013', 'en dash. Use "-".'],
  ['\u2018', 'left single quote. Use \'.'],
  ['\u2019', 'right single quote. Use \'.'],
  ['\u201C', 'left double quote. Use ".'],
  ['\u201D', 'right double quote. Use ".'],
  ['\u2026', 'ellipsis. Use "...".'],
  ['\u2192', 'right arrow. Use "->".'],
  ['\u2190', 'left arrow. Use "<-".'],
  ['\u2194', 'left-right arrow. Use "<->".'],
  ['\u21D2', 'double arrow. Use "=>".'],
  ['\u2265', 'greater-or-equal. Use ">=".'],
  ['\u2264', 'less-or-equal. Use "<=".'],
  ['\u2260', 'not-equal. Use "!=".'],
  ['\u2248', 'approximately. Use "~=".'],
  ['\u2713', 'check mark. Use "[x]".'],
  ['\u2717', 'ballot x. Use "x".'],
  ['\u2022', 'bullet. Use "-".'],
  ['\u00A0', 'non-breaking space. Use a normal space.'],
  ['\u200B', 'zero-width space. Delete it.'],
  ['\uFEFF', 'byte order mark. Delete it.'],
]);

function checkAscii(files) {
  for (const file of files) {
    if (!/\.(md|ya?ml|json)$/.test(file)) continue;
    if (file.includes(`scripts${sep}validate.mjs`)) continue;
    const lines = readFileSync(file, 'utf8').split('\n');
    lines.forEach((line, i) => {
      for (const [char, advice] of BANNED_CHARS) {
        const col = line.indexOf(char);
        if (col !== -1) fail(file, 'ascii', `line ${i + 1} col ${col + 1}: ${advice}`);
      }
    });
  }
}

// ---------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------

/**
 * The repository's own files, which means the tracked ones. Walking the disk
 * counts build output and editor leftovers too, so the same commit reports a
 * different number on a developer's machine than in CI. That matters because
 * the landing page quotes this count back, and a number that moves depending
 * on who ran it is not evidence of anything.
 */
function repositoryFiles() {
  try {
    return execFileSync('git', ['ls-files', '-z'], { cwd: ROOT, encoding: 'utf8' })
      .split('\0')
      .filter(Boolean)
      .map((p) => join(ROOT, p))
      .filter(exists);
  } catch {
    return walk(ROOT);
  }
}

const allFiles = repositoryFiles();

validateTemplates();
validateSkills();
validateEvaluationSuites();
validateProjects();
checkSecrets(allFiles);
checkAscii(allFiles);

const byCheck = findings.reduce((acc, f) => {
  (acc[f.check] ??= []).push(f);
  return acc;
}, {});

console.log(`Agent Spark validator`);
console.log(`  files scanned:      ${allFiles.length}`);
console.log(`  manifests validated: ${checked}`);

for (const check of ['schema', 'references', 'secrets', 'ascii']) {
  const items = byCheck[check] ?? [];
  console.log(`  ${check.padEnd(18)} ${items.length === 0 ? 'pass' : `${items.length} problem(s)`}`);
}

if (findings.length) {
  console.log('');
  for (const check of ['schema', 'references', 'secrets', 'ascii']) {
    for (const f of byCheck[check] ?? []) {
      console.log(`  [${check}] ${f.file}`);
      console.log(`      ${f.message}`);
    }
  }
  console.log('');
  console.log(`FAILED with ${findings.length} problem(s).`);
  process.exit(1);
}

console.log('');
console.log('PASSED.');

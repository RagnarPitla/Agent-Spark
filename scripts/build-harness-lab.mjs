#!/usr/bin/env node
/**
 * Dependency-free build of the local-only, scripted harness teaching fixture.
 * The tested engine is embedded verbatim except for its named export keywords.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { Script } from 'node:vm';
import { CONDITIONS, DEFAULT_CONFIG, MODES, SIMULATION_NOTICE } from '../labs/computer-use/engine.mjs';

const ROOT = fileURLToPath(new URL('../', import.meta.url));
const SOURCE = resolve(ROOT, 'labs/computer-use');
const OUTPUT = resolve(ROOT, 'site/research/lab.html');

function escapeHtml(value) {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;').replaceAll("'", '&#39;');
}

function options(choices, selected) {
  return choices.map((choice) => `<option value="${escapeHtml(choice.id)}"${choice.id === selected ? ' selected' : ''}>${escapeHtml(choice.label)}</option>`).join('\n');
}

function replaceOne(source, marker, replacement) {
  if (source.split(marker).length !== 2) throw new Error(`Expected exactly one build marker: ${marker}`);
  return source.replace(marker, () => replacement);
}

export function renderHarnessLab() {
  if (Number(process.versions.node.split('.')[0]) < 20) throw new Error('The harness lab builder requires Node >=20.');
  const engineSource = readFileSync(resolve(SOURCE, 'engine.mjs'), 'utf8');
  const browserSource = readFileSync(resolve(SOURCE, 'browser.mjs'), 'utf8');
  const styles = readFileSync(resolve(SOURCE, 'lab.css'), 'utf8');
  const template = readFileSync(resolve(SOURCE, 'lab.template.html'), 'utf8');
  const browserImport = /^import\s+\{[^}]+\}\s+from '\.\/engine\.mjs';\r?\n/gm;
  if ([...browserSource.matchAll(browserImport)].length !== 1) throw new Error('Expected one named browser import from the local engine.');
  const engine = engineSource.replace(/^export (?=(?:const|class|function)\s)/gm, '');
  const browser = browserSource.replace(browserImport, '');
  if (/^\s*(?:import|export)\s/m.test(engine) || /^\s*(?:import|export)\s/m.test(browser)) {
    throw new Error('The self-contained lab cannot contain unresolved module imports or exports.');
  }
  const script = `(() => {\n'use strict';\n${engine}\n${browser}\n})();`;
  new Script(script, { filename: 'embedded-harness-lab.js' });
  let html = replaceOne(template, '/* __LAB_STYLES__ */', styles);
  html = replaceOne(html, '/* __LAB_SCRIPT__ */', script.replace(/<\/script/gi, '<\\/script'));
  html = replaceOne(html, '{{MODE_OPTIONS}}', options(MODES, DEFAULT_CONFIG.mode));
  html = replaceOne(html, '{{CONDITION_OPTIONS}}', options(CONDITIONS, DEFAULT_CONFIG.condition));
  if (html.split('{{SIMULATION_NOTICE}}').length !== 3) throw new Error('The lab must show the simulation notice in both its header and footer.');
  html = html.replaceAll('{{SIMULATION_NOTICE}}', escapeHtml(SIMULATION_NOTICE));
  if (/\{\{[A-Z_]+\}\}|\/\* __LAB_[A-Z_]+__ \*\//.test(html)) throw new Error('An unresolved lab build marker remains.');
  return html;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const args = process.argv.slice(2);
  if (args.length > 1 || (args.length === 1 && args[0] !== '--check')) {
    throw new Error('Usage: node scripts/build-harness-lab.mjs [--check]');
  }
  const html = renderHarnessLab();
  if (args[0] === '--check') {
    if (!existsSync(OUTPUT) || readFileSync(OUTPUT, 'utf8') !== html) {
      throw new Error('site/research/lab.html is missing or stale. Run node scripts/build-harness-lab.mjs.');
    }
    console.log('Harness lab output is current and self-contained.');
  } else {
    mkdirSync(dirname(OUTPUT), { recursive: true });
    writeFileSync(OUTPUT, html, 'utf8');
    console.log('Built site/research/lab.html (self-contained scripted simulation).');
  }
}

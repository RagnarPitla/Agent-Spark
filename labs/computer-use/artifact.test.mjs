import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { Script } from 'node:vm';
import { renderHarnessLab } from '../../scripts/build-harness-lab.mjs';
import { CONDITIONS, HarnessSimulation, MODES, SIMULATION_NOTICE } from './engine.mjs';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');
const engineSource = read('./engine.mjs');
const browserSource = read('./browser.mjs');
const styles = read('./lab.css');
const html = read('../../site/research/lab.html');
const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((match) => match[1]);
const markup = html.replace(/<script>[\s\S]*?<\/script>/g, '').replace(/<style>[\s\S]*?<\/style>/g, '');

test('generated HTML is current and deterministic, with the tested engine embedded unchanged', () => {
  assert.equal(html, renderHarnessLab());
  assert.equal(renderHarnessLab(), renderHarnessLab());
  assert.equal(scripts.length, 2);
  assert.ok(scripts[1].includes(engineSource.replace(/^export (?=(?:const|class|function)\s)/gm, '')));
  assert.ok(html.includes(styles));
  assert.doesNotMatch(html, /\{\{[A-Z_]+\}\}|\/\* __LAB_[A-Z_]+__ \*\//);
  assert.doesNotMatch(scripts[1], /^\s*(?:import|export)\s/m);
  for (const script of scripts) assert.doesNotThrow(() => new Script(script));
});

test('the embedded engine has the same behavior as the tested ES module in all 15 fixtures', () => {
  const normalizedEngine = engineSource.replace(/^export (?=(?:const|class|function)\s)/gm, '');
  const start = scripts[1].indexOf(normalizedEngine);
  assert.ok(start >= 0);
  const embeddedEngine = scripts[1].slice(start, start + normalizedEngine.length);
  for (const mode of MODES) {
    for (const condition of CONDITIONS) {
      const config = { mode: mode.id, condition: condition.id };
      const moduleSimulation = new HarnessSimulation(config);
      for (let pause = 0; pause < 80; pause += 1) {
        const view = moduleSimulation.runUntilPause();
        if (view.status !== 'running') break;
        moduleSimulation.approve(view.pendingApproval.id);
      }
      const context = { structuredClone, configuration: config };
      const exercise = new Script(`${embeddedEngine}
const fixture = new HarnessSimulation(configuration);
for (let pause = 0; pause < 80; pause += 1) {
  const view = fixture.runUntilPause();
  if (view.status !== 'running') break;
  fixture.approve(view.pendingApproval.id);
}
JSON.stringify(fixture.exportTrace());`);
      assert.equal(exercise.runInNewContext(context, { timeout: 1000 }), JSON.stringify(moduleSimulation.exportTrace()));
    }
  }
});

test('the artifact has no remote or runtime-module dependencies and no executable user-input path', () => {
  assert.doesNotMatch(markup, /<(?:script|link|iframe|img)\b[^>]*(?:src|href)=/i);
  assert.doesNotMatch(styles, /@import\b|url\s*\(/i);
  assert.doesNotMatch(scripts.join('\n'), /\b(?:fetch|XMLHttpRequest|WebSocket|EventSource|eval|import)\s*\(|new\s+Function\b|sendBeacon\s*\(/);
  assert.doesNotMatch(browserSource, /innerHTML|outerHTML|insertAdjacentHTML|localStorage|sessionStorage/);
  assert.match(markup, /connect-src 'none'/);
  assert.match(markup, /form-action 'none'/);
  assert.match(browserSource, /new Blob\(/);
  assert.match(browserSource, /URL\.revokeObjectURL/);
  const links = [...markup.matchAll(/href="([^"]+)"/g)].map((match) => match[1]);
  assert.ok(links.every((link) => link.startsWith('#') || ['./index.html', './whitepaper.html', './article.html'].includes(link)));
  assert.doesNotMatch(markup, /type="(?:file|url)"/);
});

test('every browser element reference and in-page anchor has one matching accessible template target', () => {
  const ids = [...markup.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
  assert.equal(new Set(ids).size, ids.length, 'HTML IDs must be unique');
  for (const match of browserSource.matchAll(/\b(?:element|text|updateBadge)\('([^']+)'/g)) {
    assert.ok(ids.includes(match[1]), `Missing template element: ${match[1]}`);
  }
  for (const match of markup.matchAll(/href="#([^"]+)"/g)) assert.ok(ids.includes(match[1]));
  assert.match(markup, /<html lang="en">/);
  assert.match(markup, /class="skip-link"/);
  assert.match(markup, /<main id="main"/);
  for (const match of markup.matchAll(/<section\b[^>]*>/g)) {
    assert.match(match[0], /aria-label(?:ledby)?=/);
  }
  for (const match of markup.matchAll(/<(?:select|input)\b[^>]*id="([^"]+)"/g)) {
    assert.ok(markup.includes(`for="${match[1]}"`), `Unlabelled control: ${match[1]}`);
  }
  assert.match(markup, /id="trace"[^>]+role="log"[^>]+aria-live="polite"/);
  assert.match(markup, /id="run-status"[^>]+aria-live="polite"/);
  assert.match(styles, /:focus-visible/);
  assert.match(styles, /prefers-reduced-motion/);
  assert.match(styles, /@media print/);
  assert.doesNotMatch(styles, /outline:\s*(?:none|0)\s*;/);
});

test('every owned page, README, and exported trace states the simulation limits prominently', () => {
  assert.equal(markup.split(SIMULATION_NOTICE).length - 1, 2);
  assert.match(markup, /not a prompt-injection benchmark/);
  for (const path of ['./README.md', '../../docs/research/lab.md']) {
    const document = read(path);
    assert.ok(document.slice(0, 550).includes(SIMULATION_NOTICE), `${path} needs the complete leading notice`);
  }
  assert.equal(new HarnessSimulation().exportTrace().notice, SIMULATION_NOTICE);
});

test('the print heading preserves word boundaries when its line break is hidden', () => {
  const heading = markup.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)?.[1];
  assert.ok(heading);
  assert.equal(heading.replace(/<br\s*\/?>/g, '').replace(/\s+/g, ' ').trim(),
    'A click is not a completed task.');
});

test('Clawpilot detection, exact palette values, font stacks, and color-variable usage are preserved', () => {
  assert.match(scripts[0], /new URLSearchParams\(window\.location\.search\)\.get\("scoutTheme"\)/);
  assert.match(scripts[0], /document\.documentElement\.setAttribute\("data-theme", theme\)/);
  assert.match(styles, /--cp-bg: #f7f4ef;/);
  assert.match(styles, /--cp-accent: #b11f4b;/);
  assert.match(styles, /--cp-bg: #3d3b3a;/);
  assert.match(styles, /--cp-accent: #fd8ea1;/);
  assert.match(styles, /"Segoe UI", Aptos, Calibri, -apple-system, BlinkMacSystemFont, sans-serif/);
  assert.match(styles, /Consolas, "Courier New", Courier, monospace/);
  const componentStyles = styles.replace(/--cp-[a-z-]+:\s*[^;]+;/g, '');
  assert.doesNotMatch(componentStyles, /#[0-9a-f]{3,8}\b|\b(?:rgba?|hsla?)\(/i);
});

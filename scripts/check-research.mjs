import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, resolve, sep } from 'node:path';
import { ROOT, researchArtifacts } from './build-research.mjs';
import { figureArtifacts, figures } from './research-figures.mjs';

const read = (path) => readFileSync(join(ROOT, path), 'utf8');
const registry = JSON.parse(read('docs/research/sources.json'));
const ids = new Set();
const urls = new Set();
for (const source of registry.sources) {
  assert.match(source.id, /^S\d{2}$/);
  assert.ok(!ids.has(source.id), `Duplicate source: ${source.id}`);
  assert.ok(!urls.has(source.url), `Duplicate source URL: ${source.url}`);
  assert.equal(new URL(source.url).protocol, 'https:');
  for (const key of ['title', 'publisher', 'date', 'kind', 'supports', 'limits']) {
    assert.ok(typeof source[key] === 'string' && source[key].length > 0, `${source.id}: missing ${key}`);
  }
  ids.add(source.id);
  urls.add(source.url);
}
assert.ok(ids.size >= 12, 'The literature register is incomplete.');

for (const name of ['whitepaper', 'article']) {
  const markdown = read(`docs/research/${name}.md`);
  const references = [...markdown.matchAll(/\[(S\d{2})\]\(sources\.md#(s\d{2})\)/g)];
  assert.ok(references.length >= 5, `${name} needs traceable source citations.`);
  for (const [, id, anchor] of references) {
    assert.ok(ids.has(id), `${name}: unknown source ${id}`);
    assert.equal(anchor, id.toLowerCase(), `${name}: source anchor mismatch`);
  }
  assert.ok(!/\b(TODO|TBD|FIXME)\b/.test(markdown), `${name}: unfinished text`);
}

for (const [path, expected] of researchArtifacts()) {
  assert.equal(read(path), expected, `${path} is stale. Run npm run research:build.`);
}
for (const [name, expected] of figureArtifacts()) {
  assert.equal(read(`site/research/assets/${name}`), expected, `${name} is stale.`);
}

const htmlDirectory = join(ROOT, 'site/research');
const htmlFiles = readdirSync(htmlDirectory).filter((name) => name.endsWith('.html'));
assert.ok(htmlFiles.includes('lab.html'), 'The local lab has not been built.');
for (const name of htmlFiles) {
  const path = join(htmlDirectory, name);
  const html = readFileSync(path, 'utf8');
  const elementIds = [...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
  assert.equal(new Set(elementIds).size, elementIds.length, `${name}: duplicate element ids`);
  assert.ok(html.includes('--cp-bg:') || html.includes('--cp-bg :'), `${name}: missing theme`);
  assert.ok(!/<(?:script|link)[^>]+(?:src|href)="https?:/i.test(html), `${name}: external code or styles`);
  assert.ok(!/\b(?:fetch|eval)\s*\(|XMLHttpRequest|new WebSocket/.test(html), `${name}: unexpected live execution surface`);
  for (const [, ref] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    if (/^(?:https?:|data:|mailto:)/.test(ref)) continue;
    const [relativePath, fragment] = ref.split('#');
    const target = relativePath ? resolve(dirname(path), decodeURIComponent(relativePath.split('?')[0])) : path;
    assert.ok(target.startsWith(ROOT + sep), `${name}: reference escapes repository: ${ref}`);
    assert.ok(existsSync(target), `${name}: missing ${ref}`);
    if (fragment && target.endsWith('.html')) {
      const targetHtml = readFileSync(target, 'utf8');
      const targetIds = new Set([...targetHtml.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]));
      assert.ok(targetIds.has(fragment), `${name}: missing anchor ${ref}`);
    }
  }
}

for (const figure of figures) {
  const scene = JSON.parse(read(`site/research/assets/${figure.id}.excalidraw`));
  assert.equal(scene.type, 'excalidraw');
  assert.equal(scene.version, 2);
  const elementIds = new Set(scene.elements.map((element) => element.id));
  assert.equal(elementIds.size, scene.elements.length, `${figure.id}: duplicate drawing ids`);
  for (const element of scene.elements) {
    if (element.type !== 'text') continue;
    assert.ok(element.width > 0 && element.height > 0, `${element.id}: invisible text`);
    assert.equal(element.strokeColor, '#000000', `${element.id}: unreadable text color`);
    if (element.containerId) assert.ok(elementIds.has(element.containerId), `${element.id}: missing container`);
  }
}
for (const name of [...figures.map((figure) => figure.id), 'research-cover']) {
  const path = join(htmlDirectory, 'assets', `${name}.png`);
  assert.ok(existsSync(path) && statSync(path).size > 1000, `${name}: missing rendered PNG`);
  const image = readFileSync(path);
  assert.equal(image.subarray(0, 8).toString('hex'), '89504e470d0a1a0a', `${name}: invalid PNG`);
  const dimensions = name === 'research-cover' ? { width: 1200, height: 630 }
    : figures.find((figure) => figure.id === name);
  assert.equal(image.readUInt32BE(16), dimensions.width, `${name}: incorrect PNG width`);
  assert.equal(image.readUInt32BE(20), dimensions.height, `${name}: incorrect PNG height`);
}

const protocol = JSON.parse(read('docs/research/hypotheses.json'));
assert.equal(protocol.status, 'proposed-not-run');
assert.equal(protocol.results, null, 'Do not mix unrun hypotheses with asserted results.');
assert.equal(new Set(protocol.hypotheses.map((hypothesis) => hypothesis.id)).size, 4);
console.log(`Research artifacts agree with their sources; ${ids.size} sources, ${htmlFiles.length} pages, ${figures.length} editable figures.`);

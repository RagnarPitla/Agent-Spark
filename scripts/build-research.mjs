import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Marked } from 'marked';
import { buildFigures, figures } from './research-figures.mjs';
import { pageScript, researchCss, themeScript } from './research-theme.mjs';

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const escapeHtml = (text) => String(text).replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');

function nav(current) {
  return [['index.html', 'Research'], ['whitepaper.html', 'Paper'], ['article.html', 'Article'],
    ['lab.html', 'Lab'], ['sources.html', 'Sources'], ['visuals.html', 'Visuals']]
    .map(([href, title]) => `<a href="./${href}"${current === href ? ' aria-current="page"' : ''}>${title}</a>`).join('');
}

function shell(title, description, current, content) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<script>${themeScript}</script>
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)} | Agent Spark research</title>
<meta name="description" content="${escapeHtml(description)}">
<meta property="og:type" content="article">
<meta property="og:title" content="${escapeHtml(title)}">
<meta property="og:description" content="${escapeHtml(description)}">
<meta property="og:image" content="https://ragnarpitla.github.io/Agent-Spark/research/assets/research-cover.png">
<meta property="og:url" content="https://ragnarpitla.github.io/Agent-Spark/research/${current}">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="../assets/favicon.svg" type="image/svg+xml">
<style>${researchCss}</style>
</head>
<body>
<a class="skip-link" href="#main">Skip to content</a>
<header class="topbar"><div class="wrap">
<a class="brand" href="../index.html">Agent Spark<span>Independent research notebook</span></a>
<nav class="nav" aria-label="Research navigation">${nav(current)}</nav>
<label class="theme-label">Theme<select id="theme-picker"><option value="light">Light</option><option value="dark">Dark</option></select></label>
</div></header>
<main id="main" class="wrap">${content}</main>
<footer class="footer"><div class="wrap">Ragnar Pitla. Original community research, not a Microsoft or OpenAI product.
<a href="https://github.com/RagnarPitla/Agent-Spark">GitHub repository</a>
<a href="./sources.json" download>Evidence register (JSON)</a>
<p>Evidence reviewed 7 September 2026, America/New_York (8 September UTC). Research draft; no claim of peer review or institutional affiliation.</p>
</div></footer>
<script>${pageScript}</script>
</body>
</html>\n`;
}

function renderMarkdown(markdown, root) {
  const headings = [];
  const usedIds = new Set();
  const renderer = {
    heading({ tokens, depth }) {
      const text = this.parser.parseInline(tokens);
      const plain = text.replace(/<[^>]+>/g, '');
      const base = plain.toLowerCase().replace(/&[^;]+;/g, '-')
        .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      let id = base || 'section';
      let suffix = 2;
      while (usedIds.has(id)) id = `${base}-${suffix++}`;
      usedIds.add(id);
      if (depth === 2) headings.push({ id, text: plain });
      return `<h${depth} id="${id}">${text}</h${depth}>\n`;
    },
    image({ href, text }) {
      const path = resolve(root, 'docs/research', href);
      const assetRoot = join(root, 'site/research/assets') + sep;
      if (!path.startsWith(assetRoot) || !path.endsWith('.svg')) {
        throw new Error(`Research images must be local SVG assets: ${href}`);
      }
      const data = readFileSync(path).toString('base64');
      return `<img src="data:image/svg+xml;base64,${data}" alt="${escapeHtml(text)}">`;
    },
  };
  const parser = new Marked({ gfm: true, renderer });
  const html = parser.parse(markdown).replace(/href="(whitepaper|article|sources|lab)\.md(#[^"]*)?"/g,
    (_, page, hash = '') => `href="./${page}.html${hash}"`)
    .replaceAll('<table>', '<div class="table-scroll" role="region" aria-label="Data table" tabindex="0"><table>')
    .replaceAll('</table>', '</table></div>');
  return { html, headings };
}

function documentPage(name, markdown, root) {
  const paper = name === 'whitepaper';
  const title = paper ? 'The missing product is the execution loop' : 'An agent should finish the work, not narrate it';
  const description = paper
    ? 'Computer-use harnesses, enterprise outcomes, and the limits of the AGI claim. An evidence-led position paper and proposed experiment.'
    : 'Why useful enterprise agents need a controlled execution loop, when computer use matters, and why APIs still belong in the design.';
  const { html, headings } = renderMarkdown(markdown, root);
  const words = markdown.split(/\s+/).filter(Boolean).length;
  const toc = headings.map(({ id, text }) => `<li><a href="#${id}">${escapeHtml(text)}</a></li>`).join('');
  const content = `<header class="hero">
<p class="eyebrow">${paper ? 'Technical position paper' : 'Long-form article draft'}</p>
<h1>${title}</h1><p class="lede">${description}</p>
<p class="byline">Ragnar Pitla / 7 September 2026 / ${Math.ceil(words / 220)} minute read / Research draft</p>
<div class="actions"><a class="button primary" href="./${name}.md" download>Download Markdown</a>
<button data-print>Print / save as PDF</button>
${paper ? '<a class="button" href="./lab.html">Explore the local lab</a>' : '<button id="copy-article">Copy article text</button>'}</div>
${paper ? '' : '<p id="copy-status" class="status" aria-live="polite"></p>'}
</header>
<div class="reading-layout"><article id="article-body" class="prose">${html}</article>
<aside class="toc" aria-label="Table of contents"><h2>In this ${paper ? 'paper' : 'article'}</h2><ol>${toc}</ol></aside></div>`;
  return shell(title, description, `${name}.html`, content);
}

function sourceMarkdown(registry) {
  return `# Source register\n\nPublic evidence reviewed ${registry.reviewedOn} (${registry.timeZone}). ` +
    'Search results were discovery aids, not evidence. Sources below were read directly during this research pass. ' +
    'Vendor measurements, public documentation, academic benchmarks and repository observations are kept separate.\n\n' +
    registry.sources.map((source) => `## ${source.id}\n\n**${source.title}**\n\n` +
      `${source.publisher}. ${source.date}. Evidence type: ${source.kind}.\n\n` +
      `[Read the original source](${source.url})\n\n` +
      `Supports: ${source.supports}\n\nLimit: ${source.limits}\n`).join('\n');
}

function withBibliography(markdown, registry) {
  const ids = new Set([...markdown.split('<!-- bibliography:start -->')[0]
    .matchAll(/\[(S\d{2})\]\(sources\.md#s\d{2}\)/g)].map((match) => match[1]));
  const entries = registry.sources.filter((source) => ids.has(source.id));
  if (entries.length !== ids.size) throw new Error('A document cites an unknown source.');
  const body = entries.map((source) => `### ${source.id}\n\n` +
    `**${source.title}.** ${source.publisher}. ${source.date}. ${source.kind}.\n\n<${source.url}>\n`).join('\n');
  const marker = /<!-- bibliography:start -->[\s\S]*?<!-- bibliography:end -->/;
  if (!marker.test(markdown)) throw new Error('Missing generated bibliography markers.');
  return markdown.replace(marker, `<!-- bibliography:start -->\n\n${body}\n<!-- bibliography:end -->`);
}

function sourcesPage(registry) {
  const types = [...new Set(registry.sources.map((s) => s.kind))];
  const cards = registry.sources.map((source) => `<article class="source-card" id="${source.id.toLowerCase()}" data-source-kind="${escapeHtml(source.kind)}">
<span class="tag">${escapeHtml(source.id)} / ${escapeHtml(source.kind)}</span>
<h2><a href="${escapeHtml(source.url)}">${escapeHtml(source.title)}</a></h2>
<p class="muted">${escapeHtml(source.publisher)} / ${escapeHtml(source.date)}</p>
<p>${escapeHtml(source.supports)}</p><p class="limit"><strong>What this does not establish:</strong> ${escapeHtml(source.limits)}</p>
</article>`).join('\n');
  return shell('The evidence, with its limits', 'An annotated primary-source register for the computer-use harness thesis.',
    'sources.html', `<header class="hero"><p class="eyebrow">Annotated source register</p><h1>The evidence,<br>with its limits.</h1>
<p class="lede">A product manual describes capabilities and constraints. A benchmark measures a bounded setup. Neither establishes a customer outcome.</p>
<p class="byline">${registry.sources.length} public sources / Reviewed 7 September 2026</p></header>
<div class="filter"><label for="source-filter">Evidence type</label><select id="source-filter"><option value="all">All sources</option>
${types.map((type) => `<option value="${escapeHtml(type)}">${escapeHtml(type)}</option>`).join('')}</select>
<span id="source-count" class="muted" aria-live="polite">${registry.sources.length} sources shown</span></div>${cards}`);
}

function imageData(root, id) {
  return `data:image/svg+xml;base64,${readFileSync(join(root, 'site/research/assets', `${id}.svg`)).toString('base64')}`;
}

function visualsPage(root) {
  const gallery = figures.map((figure) => `<figure class="figure" id="${figure.id}">
<img src="${imageData(root, figure.id)}" alt="${escapeHtml(figure.description)}">
<figcaption>${escapeHtml(figure.description)}</figcaption>
<div class="actions"><a class="button" href="./assets/${figure.id}.svg" download>Download SVG</a>
<a class="button" href="./assets/${figure.id}.excalidraw" download>Edit in Excalidraw</a>
<a class="button" href="./assets/${figure.id}.png" download>Download PNG</a></div></figure>`).join('');
  return shell('Four diagrams for a better argument', 'Original explanatory diagrams with editable Excalidraw source, SVG and PNG exports.',
    'visuals.html', `<header class="hero"><p class="eyebrow">Original figures / reusable source</p>
<h1>Make the mechanism visible.</h1><p class="lede">Conceptual diagrams, not measured results. Each figure names the claim it helps explain and the boundary it cannot cross.</p></header>
<figure class="figure"><div id="cover-art" class="cover"><p class="eyebrow">Agent Spark / Research note 01</p>
<strong>The missing product<br>is the execution loop.</strong><div class="cover-loop"><span>Observe</span><span>Propose</span><span>Gate</span><span>Act</span><span>Verify</span></div>
<p class="muted">Computer-use harnesses, enterprise outcomes, and the limits of the AGI claim.<br>Ragnar Pitla / September 2026</p></div>
<figcaption>An original cover for the article and paper.</figcaption>
<div class="actions"><a class="button" href="./assets/research-cover.png" download>Download cover PNG</a></div></figure>${gallery}`);
}

function homePage(root, count) {
  return shell('The missing product is the execution loop', 'A research paper, article, source register, diagrams and local harness simulator.',
    'index.html', `<header class="hero"><p class="eyebrow">Agent Spark research / Notebook 01</p>
<h1>The missing product<br>is the execution loop.</h1>
<p class="lede">Computer use lets an agent reach software that integrations leave out. A harness must still decide what it may change, verify the result, and stop when the evidence is wrong.</p>
<p class="byline">Ragnar Pitla / 7 September 2026 / ${count} public sources / Original research draft</p>
<div class="actions"><a class="button primary" href="./whitepaper.html">Read the paper</a><a class="button" href="./article.html">Read the article</a><a class="button" href="./lab.html">Run the local simulation</a></div>
<div class="notice"><p><strong>Research, not a product launch.</strong> The lab is a scripted local simulation with synthetic data, no model calls and no real computer control. Agent Spark's production CLI and runtime adapters remain unimplemented.</p></div></header>
<section class="section" aria-labelledby="thesis"><h2 id="thesis">Three claims. Different evidence.</h2><div class="grid">
<article class="card"><span class="tag">Supported direction</span><h3>Interface reach matters.</h3><p>GUI access can make an otherwise inaccessible workflow actionable. Current product documentation and enterprise browser benchmarks support studying that gap.</p><a href="./whitepaper.html#4-what-the-evidence-actually-says">Follow the evidence</a></article>
<article class="card"><span class="tag">Testable hypothesis</span><h3>The best route is often hybrid.</h3><p>Use structured tools where they fit, visual interaction where necessary, and one authority boundary across both. The economic advantage still needs a controlled study.</p><a href="./whitepaper.html#10-a-study-that-could-prove-this-wrong">Inspect the study design</a></article>
<article class="card"><span class="tag">Not established</span><h3>GUI use is required for AGI.</h3><p>Acting in an environment and clicking a desktop interface are different claims. None of the cited results makes graphical interaction necessary or sufficient for general intelligence.</p><a href="./whitepaper.html#8-the-agi-claim-needs-a-narrower-definition">Examine the counterargument</a></article>
</div></section>
<figure class="figure"><img src="${imageData(root, '01-execution-loop')}" alt="${escapeHtml(figures[0].description)}"><figcaption>Figure 1. A proposed execution loop. Authorization and verification are separate responsibilities.</figcaption></figure>
<section class="section" aria-labelledby="model-note"><h2 id="model-note">Start by naming the model correctly.</h2>
<div class="notice"><p>The public OpenAI announcement names <strong>GPT-6 Astra</strong>, and compares it with <strong>GPT-5.6 Sol</strong>. It also describes a Codex harness update. That is evidence of a changing model-plus-system stack, not an ablation proving which part caused the gain. <a href="./sources.html#s01">Read source S01</a>.</p></div></section>
<section class="section" aria-labelledby="calculator-title"><h2 id="calculator-title">Why long workflows deserve their own measurement</h2>
<div class="calculator"><div><label for="step-probability">Hypothetical success per step: <strong id="probability-label">95%</strong><input id="step-probability" type="range" min="80" max="100" step="1" value="95"></label>
<label for="step-count">Required steps: <strong id="count-label">20</strong><input id="step-count" type="range" min="1" max="60" step="1" value="20"></label></div>
<div><span class="tag">Illustration, not a benchmark</span><output id="compound-result" aria-live="polite">35.8%</output><p id="compound-formula" class="muted">0.95 raised to 20, assuming identical independent steps and no recovery.</p></div></div>
<p class="muted">Real steps are not identically distributed or independent. Errors can be correlated; retries and verification change the process. This calculator explains why step accuracy is not workflow reliability. It does not estimate any product's performance.</p></section>
<section class="section" aria-labelledby="start"><h2 id="start">Read, inspect, and challenge it</h2><div class="grid">
<article class="card"><span class="number">01</span><h3>The paper</h3><p>Definitions, current evidence, enterprise examples, a proposed architecture, counterarguments, and falsifiable hypotheses.</p><a href="./whitepaper.html">Read the full argument</a></article>
<article class="card"><span class="number">02</span><h3>The mechanism</h3><p>Step through an invoice exception. Deny an approval. Change the state. Watch an apparently successful save fail its postcondition.</p><a href="./lab.html">Explore the scripted simulator</a></article>
<article class="card"><span class="number">03</span><h3>The sources and figures</h3><p>Separate vendor reports from benchmark papers. Download original diagrams and edit the source rather than screenshotting a slide.</p><a href="./sources.html">Read the source register</a> / <a href="./visuals.html">Get the figures</a></article>
</div></section>`);
}

export function researchArtifacts(root = ROOT) {
  const registry = JSON.parse(readFileSync(join(root, 'docs/research/sources.json'), 'utf8'));
  const paper = withBibliography(readFileSync(join(root, 'docs/research/whitepaper.md'), 'utf8'), registry);
  const article = withBibliography(readFileSync(join(root, 'docs/research/article.md'), 'utf8'), registry);
  const sources = sourceMarkdown(registry);
  return new Map([
    ['site/research/index.html', homePage(root, registry.sources.length)],
    ['site/research/whitepaper.html', documentPage('whitepaper', paper, root)],
    ['site/research/article.html', documentPage('article', article, root)],
    ['site/research/sources.html', sourcesPage(registry)],
    ['site/research/visuals.html', visualsPage(root)],
    ['site/research/whitepaper.md', paper],
    ['site/research/article.md', article],
    ['docs/research/whitepaper.md', paper],
    ['docs/research/article.md', article],
    ['site/research/sources.json', `${JSON.stringify(registry, null, 2)}\n`],
    ['site/research/hypotheses.json', readFileSync(join(root, 'docs/research/hypotheses.json'), 'utf8')],
    ['docs/research/sources.md', sources],
  ]);
}

export function buildResearch(root = ROOT) {
  buildFigures(root);
  const artifacts = researchArtifacts(root);
  for (const [path, content] of artifacts) {
    const target = join(root, path);
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, content);
  }
  console.log(`Built ${artifacts.size} research artifacts and ${figures.length} editable figures.`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) buildResearch();

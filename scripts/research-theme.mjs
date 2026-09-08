export const themeScript = `(() => {
  const param = new URLSearchParams(window.location.search).get("scoutTheme");
  const theme =
    param || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  document.documentElement.setAttribute("data-theme", theme);
})();`;

export const researchCss = `
:root {
  color-scheme: light;
  --cp-bg: #f7f4ef;
  --cp-bg-elevated: #fcfbf8;
  --cp-surface: #ffffff;
  --cp-surface-soft: #f5f5f5;
  --cp-border: #dedede;
  --cp-border-strong: #919191;
  --cp-text: #242424;
  --cp-text-muted: #5c5c5c;
  --cp-text-soft: #6f6f6f;
  --cp-accent: #b11f4b;
  --cp-accent-hover: #9a1a41;
  --cp-accent-soft: rgba(177, 31, 75, 0.08);
  --cp-accent-fg: #ffffff;
  --cp-success: #16a34a;
  --cp-danger: #dc2626;
  --cp-warning: #f59e0b;
  --cp-link: #0078d4;
  --cp-shadow: 0 18px 48px rgba(0, 0, 0, 0.12);
  --cp-overlay: rgba(255, 255, 255, 0.8);
  --cp-panel: rgba(255, 255, 255, 0.86);
  --cp-panel-strong: rgba(255, 255, 255, 0.96);
  --cp-sheen: rgba(255, 255, 255, 0.55);
  --cp-highlight: rgba(177, 31, 75, 0.12);
}
html[data-theme="dark"] {
  color-scheme: dark;
  --cp-bg: #3d3b3a;
  --cp-bg-elevated: #343231;
  --cp-surface: #292929;
  --cp-surface-soft: #2e2e2e;
  --cp-border: #474747;
  --cp-border-strong: #5f5f5f;
  --cp-text: #dedede;
  --cp-text-muted: #919191;
  --cp-text-soft: #b0b0b0;
  --cp-accent: #fd8ea1;
  --cp-accent-hover: #fb7b91;
  --cp-accent-soft: rgba(253, 142, 161, 0.14);
  --cp-accent-fg: #1a1a1a;
  --cp-success: #4ade80;
  --cp-danger: #f87171;
  --cp-warning: #fbbf24;
  --cp-link: #4da6ff;
  --cp-shadow: 0 18px 48px rgba(0, 0, 0, 0.32);
  --cp-overlay: rgba(41, 41, 41, 0.88);
  --cp-panel: rgba(41, 41, 41, 0.72);
  --cp-panel-strong: rgba(41, 41, 41, 0.96);
  --cp-sheen: rgba(255, 255, 255, 0.04);
  --cp-highlight: rgba(253, 142, 161, 0.12);
}
* { box-sizing: border-box; }
html { scroll-padding-top: 32px; }
body { margin: 0; background: var(--cp-bg); color: var(--cp-text); font-family: "Segoe UI", Aptos, Calibri, -apple-system, BlinkMacSystemFont, sans-serif; }
a { color: var(--cp-link); text-underline-offset: .2em; overflow-wrap: anywhere; }
a:hover { text-decoration-thickness: 2px; }
button, select, input { font: inherit; }
button, select { color: var(--cp-text); background: var(--cp-surface); border: 1px solid var(--cp-border-strong); border-radius: .625rem; padding: 10px 14px; }
button { cursor: pointer; }
button:hover { border-color: var(--cp-accent); }
:focus-visible { outline: 3px solid var(--cp-accent); outline-offset: 4px; }
.skip-link { position: absolute; left: 16px; top: -100px; padding: 12px; background: var(--cp-surface); z-index: 10; }
.skip-link:focus { top: 12px; }
.wrap { width: min(1240px, calc(100% - 64px)); margin-inline: auto; }
.topbar { border-bottom: 1px solid var(--cp-border); }
.topbar .wrap { display: flex; align-items: center; gap: 24px; flex-wrap: wrap; padding-block: 20px; }
.brand { color: var(--cp-text); font-weight: 750; text-decoration: none; margin-right: auto; letter-spacing: -.02em; }
.brand span { display: block; color: var(--cp-text-muted); font-size: 12px; font-weight: 400; letter-spacing: .08em; text-transform: uppercase; }
.nav { display: flex; flex-wrap: wrap; gap: 20px; align-items: center; }
.nav a { font-size: 14px; text-decoration: none; color: var(--cp-text-muted); }
.nav a[aria-current="page"] { color: var(--cp-accent); font-weight: 700; }
.theme-label { font-size: 12px; color: var(--cp-text-muted); display: flex; gap: 8px; align-items: center; }
.theme-label select { padding: 6px 8px; }
.hero { padding-block: 76px 48px; }
.eyebrow { color: var(--cp-accent); font-size: 12px; font-weight: 750; letter-spacing: .12em; text-transform: uppercase; }
.hero h1 { max-width: 980px; font-size: clamp(36px, 6vw, 76px); line-height: 1.04; letter-spacing: -.055em; margin: 24px 0; font-weight: 750; }
.hero .lede { max-width: 790px; font-size: clamp(18px, 2.1vw, 24px); line-height: 1.5; color: var(--cp-text-muted); }
.byline { font-size: 14px; color: var(--cp-text-muted); margin-top: 24px; }
.actions { display: flex; flex-wrap: wrap; gap: 12px; margin: 28px 0 16px; }
.button { display: inline-block; padding: 12px 18px; background: var(--cp-surface); color: var(--cp-text); border: 1px solid var(--cp-border-strong); border-radius: .625rem; text-decoration: none; font-weight: 600; }
.button.primary { color: var(--cp-accent-fg); background: var(--cp-accent); border-color: var(--cp-accent); }
.button.primary:hover { background: var(--cp-accent-hover); }
.notice { padding: 18px 22px; border-left: 3px solid var(--cp-accent); background: var(--cp-accent-soft); line-height: 1.6; font-size: 15px; }
.notice p { margin: 0; }
.section { margin-block: 56px; }
.section h2 { font-size: clamp(26px, 3.3vw, 38px); letter-spacing: -.035em; }
.grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 20px; }
.card { padding: 28px; background: var(--cp-surface); border: 1px solid var(--cp-border); border-radius: 16px; }
.card h3 { font-size: 23px; line-height: 1.25; letter-spacing: -.02em; margin: 16px 0; }
.card p { line-height: 1.65; color: var(--cp-text-muted); }
.tag { font-size: 11px; letter-spacing: .09em; text-transform: uppercase; font-weight: 700; color: var(--cp-accent); }
.card .number { color: var(--cp-accent); font-size: 34px; font-weight: 700; }
.reading-layout { display: grid; grid-template-columns: minmax(0, 840px) minmax(220px, 1fr); gap: 56px; align-items: start; margin-bottom: 64px; }
.prose { min-width: 0; font-size: 18px; line-height: 1.8; overflow-wrap: break-word; }
.prose > h1 { display: none; }
.prose h2 { font-size: 31px; letter-spacing: -.035em; line-height: 1.2; margin: 60px 0 20px; }
.prose h3 { font-size: 23px; line-height: 1.3; margin-top: 36px; }
.prose p { margin: 0 0 22px; }
.prose ul, .prose ol { padding-left: 24px; margin-bottom: 24px; }
.prose li { padding-left: 4px; margin-bottom: 10px; }
.prose li > p { margin-bottom: 8px; }
.prose blockquote { margin: 28px 0; padding: 20px 26px; border-left: 3px solid var(--cp-accent); background: var(--cp-accent-soft); }
.prose blockquote p:last-child { margin-bottom: 0; }
code, pre { font-family: Consolas, "Courier New", Courier, monospace; }
code { padding: 2px 5px; border-radius: 4px; background: var(--cp-surface-soft); font-size: .88em; overflow-wrap: anywhere; }
pre { background: var(--cp-surface); border: 1px solid var(--cp-border); border-radius: .625rem; padding: 20px; overflow: auto; line-height: 1.6; }
pre code { padding: 0; background: var(--cp-surface); overflow-wrap: normal; }
.table-scroll { overflow-x: auto; margin: 28px 0; }
table { width: 100%; border-collapse: collapse; font-size: 15px; line-height: 1.6; }
th, td { padding: 14px; border: 1px solid var(--cp-border); text-align: left; vertical-align: top; min-width: 120px; }
th { background: var(--cp-surface-soft); }
td { background: var(--cp-surface); }
.prose img, .figure img { width: 100%; height: auto; display: block; border: 1px solid var(--cp-border); border-radius: 16px; }
.figure { margin: 24px 0; }
figcaption { font-size: 14px; color: var(--cp-text-muted); line-height: 1.6; margin-top: 12px; }
.toc { position: sticky; top: 24px; max-height: calc(100vh - 48px); overflow-y: auto; font-size: 13px; padding: 24px; border: 1px solid var(--cp-border); border-radius: 16px; background: var(--cp-bg-elevated); }
.toc h2 { font-size: 15px; margin: 0 0 16px; }
.toc ol { padding-left: 18px; margin: 0; }
.toc li { margin-bottom: 12px; padding-left: 2px; }
.toc a { color: var(--cp-text-muted); text-decoration: none; }
.source-card { padding: 24px; margin-bottom: 16px; border: 1px solid var(--cp-border); border-radius: 16px; background: var(--cp-surface); scroll-margin-top: 24px; overflow-wrap: anywhere; }
.source-card h2 { margin-top: 12px; font-size: 23px; }
.source-card p { font-size: 16px; line-height: 1.7; }
.source-card .limit { border-top: 1px solid var(--cp-border); padding-top: 16px; color: var(--cp-text-muted); }
.source-card[hidden] { display: none; }
.filter { display: flex; gap: 16px; align-items: center; margin: 24px 0; flex-wrap: wrap; }
.calculator { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; background: var(--cp-surface); border: 1px solid var(--cp-border); border-radius: 16px; padding: 32px; }
.calculator label { display: block; margin-bottom: 24px; line-height: 1.6; }
.calculator input { display: block; width: 100%; accent-color: var(--cp-accent); margin-top: 12px; }
.calculator output { display: block; font-size: clamp(42px, 7vw, 80px); font-weight: 750; color: var(--cp-accent); letter-spacing: -.06em; }
.muted { color: var(--cp-text-muted); font-size: 15px; line-height: 1.7; }
.cover { aspect-ratio: 1200 / 630; background: var(--cp-surface); border: 1px solid var(--cp-border); border-radius: 16px; padding: 6%; display: flex; flex-direction: column; justify-content: space-between; }
.cover strong { display: block; max-width: 820px; font-size: clamp(24px, 5vw, 68px); line-height: 1.08; letter-spacing: -.05em; }
.cover .cover-loop { display: flex; gap: 16px; flex-wrap: wrap; font-size: clamp(12px, 1.6vw, 20px); font-weight: 600; color: var(--cp-accent); }
.footer { padding-block: 32px; border-top: 1px solid var(--cp-border); color: var(--cp-text-muted); font-size: 14px; line-height: 1.6; }
.footer a { margin-left: 16px; }
.status { min-height: 24px; color: var(--cp-text-muted); font-size: 14px; }
html[data-theme="dark"] :is(.byline, .muted, .theme-label, .status, .footer, figcaption, .brand span, .toc a, .nav a:not([aria-current])) { color: var(--cp-text-soft); }
@media (max-width: 960px) {
  .grid { grid-template-columns: 1fr; }
  .reading-layout { grid-template-columns: minmax(0, 1fr); gap: 24px; }
  .toc { position: static; max-height: none; grid-row: 1; }
  .toc ol { columns: 2; column-gap: 28px; }
  .calculator { grid-template-columns: 1fr; }
}
@media (max-width: 600px) {
  .wrap { width: calc(100% - 32px); }
  .topbar .wrap { gap: 16px; }
  .nav { gap: 14px; }
  .hero { padding-block: 44px 32px; }
  .hero h1 { font-size: 42px; }
  .prose { font-size: 17px; }
  .toc ol { columns: 1; }
  .card, .calculator { padding: 22px; }
  th, td { padding: 10px; }
}
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { scroll-behavior: auto !important; animation: none !important; transition: none !important; }
}
@media print {
  .topbar, .toc, .actions, .filter, .theme-label, .skip-link, .calculator, .footer, .status { display: none !important; }
  body { background: var(--cp-surface); }
  .wrap { width: 100%; }
  .hero { padding-block: 0 20px; }
  .hero h1 { font-size: 36px; }
  .reading-layout { display: block; }
  .prose { font-size: 11pt; line-height: 1.5; }
  .prose h2 { font-size: 19pt; margin-top: 28px; break-after: avoid; }
  .prose h3 { break-after: avoid; }
  figure, .source-card { break-inside: avoid; }
  .table-scroll { overflow: visible; }
  table { font-size: 9pt; }
  a { color: var(--cp-text); }
}
`;

export const pageScript = `
const themePicker = document.getElementById('theme-picker');
themePicker.value = document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
themePicker.addEventListener('change', () => {
  document.documentElement.dataset.theme = themePicker.value;
});
document.querySelectorAll('[data-print]').forEach((button) =>
  button.addEventListener('click', () => window.print()));
let themeBeforePrint = null;
window.addEventListener('beforeprint', () => {
  themeBeforePrint ??= document.documentElement.dataset.theme;
  document.documentElement.dataset.theme = 'light';
});
window.addEventListener('afterprint', () => {
  if (themeBeforePrint !== null) document.documentElement.dataset.theme = themeBeforePrint;
  themeBeforePrint = null;
});
const copyButton = document.getElementById('copy-article');
if (copyButton) {
  copyButton.addEventListener('click', async () => {
    const status = document.getElementById('copy-status');
    if (!navigator.clipboard) {
      status.textContent = 'Clipboard unavailable here. Download the Markdown file or select the article text.';
      return;
    }
    try {
      const title = document.querySelector('.hero h1').innerText;
      await navigator.clipboard.writeText(title + '\\n\\n' + document.getElementById('article-body').innerText);
      status.textContent = 'Article copied. Review references and formatting before publishing.';
    } catch (error) {
      if (!(error instanceof DOMException)) throw error;
      status.textContent = 'Copy failed (' + error.name + '). Download the Markdown file or select the article text.';
    }
  });
}
const sourceFilter = document.getElementById('source-filter');
if (sourceFilter) {
  sourceFilter.addEventListener('change', () => {
    let visible = 0;
    document.querySelectorAll('[data-source-kind]').forEach((card) => {
      card.hidden = sourceFilter.value !== 'all' && card.dataset.sourceKind !== sourceFilter.value;
      if (!card.hidden) visible += 1;
    });
    document.getElementById('source-count').textContent = visible + ' sources shown';
  });
}
const stepInput = document.getElementById('step-probability');
if (stepInput) {
  const countInput = document.getElementById('step-count');
  const update = () => {
    const probability = Number(stepInput.value) / 100;
    const count = Number(countInput.value);
    document.getElementById('probability-label').textContent = stepInput.value + '%';
    document.getElementById('count-label').textContent = countInput.value;
    document.getElementById('compound-result').textContent = (100 * probability ** count).toFixed(1) + '%';
    document.getElementById('compound-formula').textContent = probability.toFixed(2) + ' raised to ' + count + ', assuming identical independent steps and no recovery.';
  };
  stepInput.addEventListener('input', update);
  countInput.addEventListener('input', update);
  update();
}
`;

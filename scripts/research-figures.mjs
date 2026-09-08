import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const box = (id, x, y, width, height, lines, tone = 'neutral') =>
  ({ id, x, y, width, height, lines, tone });
const arrow = (id, points, tone = 'neutral') => ({ id, points, tone });

export const figures = [
  {
    id: '01-execution-loop',
    title: 'The product is the closed loop',
    subtitle: 'A proposed architecture. The model proposes; external controls authorize and observe.',
    width: 1280, height: 700,
    description: 'An outcome contract feeds an observe, propose, gate, act and verify loop. API, browser and desktop adapters operate within one authority boundary. A failed postcondition returns to observation, not blind replay.',
    boxes: [
      box('intent', 40, 115, 1200, 105, ['Outcome contract: target, permitted change, evidence, stop conditions'], 'accent'),
      box('observe', 40, 285, 208, 125, ['Observe', 'Fresh state + identity']),
      box('propose', 288, 285, 208, 125, ['Propose', 'Next bounded action']),
      box('gate', 536, 285, 208, 125, ['Gate', 'Policy + exact consent'], 'accent'),
      box('act', 784, 285, 208, 125, ['Act', 'One permitted effect']),
      box('verify', 1032, 285, 208, 125, ['Verify', 'Read postcondition'], 'accent'),
      box('adapters', 40, 510, 660, 125, ['Adapters, not interchangeable permissions', 'API / MCP   |   browser semantics   |   desktop GUI']),
      box('memory', 740, 510, 500, 125, ['Run state and evidence', 'Targets, receipts, budgets, recovery history']),
    ],
    arrows: [
      arrow('intent-observe', [[144, 220], [144, 285]]),
      arrow('observe-propose', [[248, 347], [288, 347]]),
      arrow('propose-gate', [[496, 347], [536, 347]]),
      arrow('gate-act', [[744, 347], [784, 347]], 'accent'),
      arrow('act-verify', [[992, 347], [1032, 347]]),
      arrow('recover', [[1136, 410], [1136, 458], [144, 458], [144, 410]], 'accent'),
    ],
    notes: [{ x: 390, y: 448, text: 'Mismatch: re-observe, re-plan, re-authorize. Stop when the budget expires.' }],
  },
  {
    id: '02-interface-routing',
    title: 'One workflow, three interface strategies',
    subtitle: 'Synthetic invoice exception: receipt attachment has no API. Every write needs approval.',
    width: 1280, height: 770,
    boxes: [
      box('api-label', 40, 130, 205, 130, ['API-only', 'Narrow action reach'], 'accent'),
      box('api-read', 285, 130, 255, 130, ['Read invoice context', 'Structured record']),
      box('api-stop', 580, 130, 660, 130, ['STOP: no attachment API', 'Keep the hold; report unsupported.']),
      box('gui-label', 40, 330, 205, 130, ['GUI-only', 'Screen-based route'], 'accent'),
      box('gui-read', 285, 330, 255, 130, ['Read invoice context', 'Through the screen']),
      box('gui-note', 580, 330, 290, 130, ['Attach accepted receipt', 'Approved GUI write']),
      box('gui-write', 910, 330, 330, 130, ['Clear review hold', 'Approved GUI write']),
      box('hybrid-label', 40, 530, 205, 130, ['Hybrid', 'Select per step'], 'accent'),
      box('hybrid-read', 285, 530, 255, 130, ['Read invoice context', 'API']),
      box('hybrid-note', 580, 530, 290, 130, ['Attach accepted receipt', 'Approved GUI write']),
      box('hybrid-write', 910, 530, 330, 130, ['Clear review hold', 'Approved API write']),
    ],
    arrows: [
      arrow('a1', [[245, 195], [285, 195]]), arrow('a2', [[540, 195], [580, 195]]),
      arrow('g1', [[245, 395], [285, 395]]), arrow('g2', [[540, 395], [580, 395]]),
      arrow('g3', [[870, 395], [910, 395]]),
      arrow('h1', [[245, 595], [285, 595]], 'accent'),
      arrow('h2', [[540, 595], [580, 595]], 'accent'),
      arrow('h3', [[870, 595], [910, 595]], 'accent'),
    ],
    notes: [
      { x: 40, y: 704, text: 'Verify every effect independently of the save message. This is a conceptual route map, not measured performance.' },
      { x: 40, y: 740, text: 'No API is a capability gap. No permission is a stop, not an invitation to try the GUI.' },
    ],
    description: 'API-only stops because receipt attachment has no API. GUI-only uses screens throughout. Hybrid attaches the receipt through the GUI and clears the review hold through the API. Each write needs approval and independent verification; this is a conceptual example, not a measured comparison.',
  },
  {
    id: '03-evidence-ladder',
    title: 'Five claims that need different evidence',
    subtitle: 'Passing one row never proves the rows below it.',
    width: 1280, height: 840,
    boxes: [
      box('structure', 40, 120, 310, 108, ['1. Artifact conformance'], 'accent'),
      box('structure-evidence', 390, 120, 850, 108, ['Schema, references, declared constraints', 'A valid manifest can still describe an unsafe or ineffective agent.']),
      box('generation', 40, 250, 310, 108, ['2. Generation correctness'], 'accent'),
      box('generation-evidence', 390, 250, 850, 108, ['Files, substitution, preserved content', 'Correct files are not proof of successful platform delivery.']),
      box('delivery', 40, 380, 310, 108, ['3. Platform delivery'], 'accent'),
      box('delivery-evidence', 390, 380, 850, 108, ['Target identity, version, server-side receipt', 'A delivered draft is not proof of correct conversations or actions.']),
      box('behavior', 40, 510, 310, 108, ['4. Behavioral performance'], 'accent'),
      box('behavior-evidence', 390, 510, 850, 108, ['Held-out tasks, repeated runs, policy compliance', 'A benchmark result is not proof of viable operational economics.']),
      box('operations', 40, 640, 310, 108, ['5. Operational value'], 'accent'),
      box('operations-evidence', 390, 640, 850, 108, ['Review time, incidents, drift, cost per accepted outcome', 'Measure in the actual workflow, with the actual authority boundary.']),
    ],
    arrows: [120, 250, 380, 510, 640].map((y, i) =>
      arrow(`evidence-${i}`, [[350, y + 54], [390, y + 54]])),
    notes: [{ x: 40, y: 800, text: 'The browser lab exercises deterministic mechanics only. It does not produce evidence of model or enterprise performance.' }],
    description: 'Five evidence levels: artifact conformance, generation correctness, platform delivery, behavioral performance and operational value. Each level requires its own measurements; none follows from the preceding level.',
  },
  {
    id: '04-factorial-study',
    title: 'Separate the model from the harness',
    subtitle: 'Proposed study design, not experimental results. Freeze tasks, authority and budgets.',
    width: 1280, height: 740,
    boxes: [
      box('models', 40, 125, 355, 155, ['Model snapshots', 'M1 and M2', 'Record exact versions'], 'accent'),
      box('harnesses', 462, 125, 355, 155, ['Harness variants', 'Baseline and recovery-aware', 'Same mandatory safety policy'], 'accent'),
      box('interfaces', 884, 125, 356, 155, ['Interface access', 'API / GUI / hybrid', 'Declare what each arm can see'], 'accent'),
      box('tasks', 40, 350, 570, 145, ['Paired task instances and perturbations', 'API-complete, UI-only, cross-app, stale-state', 'Separate reach from competence']),
      box('outcomes', 670, 350, 570, 145, ['Independent outcome assessment', 'Correct state + policy compliance + receipt', 'Count unsupported and stopped runs explicitly']),
      box('economics', 40, 560, 1200, 105, ['Report task-level uncertainty, review minutes, latency, execution cost and failure severity']),
    ],
    arrows: [
      arrow('model-task', [[218, 280], [218, 350]]),
      arrow('harness-task', [[640, 280], [640, 320], [430, 320], [430, 350]]),
      arrow('interface-outcome', [[1062, 280], [1062, 350]]),
      arrow('task-outcome', [[610, 422], [670, 422]], 'accent'),
      arrow('outcome-metric', [[954, 495], [954, 560]]),
    ],
    notes: [{ x: 40, y: 708, text: 'A simultaneous model-and-harness upgrade cannot tell you which change caused the gain. Test the factors separately.' }],
    description: 'A factorial study crosses model snapshots, harness variants and interface access. Paired task instances feed an independent outcome assessment, with uncertainty, human review time, cost and failures reported.',
  },
];

const escape = (value) => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;').replaceAll('"', '&quot;');

function svgFor(figure) {
  const nodes = figure.boxes.map((item) => {
    const firstY = item.y + item.height / 2 - ((item.lines.length - 1) * 28) / 2;
    return `<rect x="${item.x}" y="${item.y}" width="${item.width}" height="${item.height}" rx="14" fill="var(--cp-${item.tone === 'accent' ? 'accent-soft' : 'surface'})" stroke="var(--cp-${item.tone === 'accent' ? 'accent' : 'border-strong'})"/>
${item.lines.map((line, i) => `<text x="${item.x + item.width / 2}" y="${firstY + i * 28}" text-anchor="middle" dominant-baseline="middle" font-size="${i === 0 ? 21 : 18}" font-weight="${i === 0 ? 600 : 400}">${escape(line)}</text>`).join('\n')}`;
  }).join('\n');
  const edges = figure.arrows.map((item) =>
    `<polyline points="${item.points.map((p) => p.join(',')).join(' ')}" fill="none" stroke="var(--cp-${item.tone === 'accent' ? 'accent' : 'border-strong'})" stroke-width="2" marker-end="url(#${figure.id}-arrow)"/>`).join('\n');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${figure.width} ${figure.height}" role="img" aria-label="${escape(figure.description)}" style="--cp-bg:#f7f4ef;--cp-surface:#ffffff;--cp-text:#242424;--cp-text-muted:#5c5c5c;--cp-border-strong:#919191;--cp-accent:#b11f4b;--cp-accent-soft:rgba(177,31,75,0.08);font-family:'Segoe UI',Aptos,Calibri,sans-serif;fill:var(--cp-text)">
<title>${escape(figure.title)}</title><desc>${escape(figure.description)}</desc>
<defs><marker id="${figure.id}-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="var(--cp-border-strong)"/></marker></defs>
<rect width="${figure.width}" height="${figure.height}" fill="var(--cp-bg)" rx="16"/>
<text x="40" y="52" font-size="32" font-weight="700">${escape(figure.title)}</text>
<text x="40" y="86" font-size="18" fill="var(--cp-text-muted)">${escape(figure.subtitle)}</text>
${edges}
${nodes}
${figure.notes.map((note) => `<text x="${note.x}" y="${note.y}" font-size="17" fill="var(--cp-text-muted)">${escape(note.text)}</text>`).join('\n')}
</svg>\n`;
}

function excalidrawFor(figure) {
  let serial = 0;
  const base = (id, type, x, y, width, height) => ({
    id, type, x, y, width, height, angle: 0, strokeColor: '#495057',
    backgroundColor: 'transparent', fillStyle: 'solid', strokeWidth: 1,
    strokeStyle: 'solid', roughness: 0, opacity: 100, groupIds: [], frameId: null,
    roundness: null, seed: ++serial, version: 1, versionNonce: serial,
    isDeleted: false, boundElements: null, updated: 1788825600000, link: null, locked: false,
  });
  const text = (id, x, y, width, lines, fontSize = 18) => ({
    ...base(id, 'text', x, y, width, fontSize * 2.5 * lines.length),
    text: lines.join('\n'), originalText: lines.join('\n'), fontSize, fontFamily: 2,
    strokeColor: '#000000', textAlign: 'left', verticalAlign: 'top',
    containerId: null, lineHeight: 1.25, autoResize: false,
  });
  const elements = [
    text(`${figure.id}-title`, 40, 20, 1200, [figure.title], 30),
    text(`${figure.id}-subtitle`, 40, 75, 1200, [figure.subtitle], 17),
  ];
  for (const item of figure.boxes) {
    const boundId = `${figure.id}-${item.id}-text`;
    const shapeId = `${figure.id}-${item.id}`;
    elements.push({
      ...base(shapeId, 'rectangle', item.x, item.y, item.width, item.height),
      strokeColor: item.tone === 'accent' ? '#b11f4b' : '#495057',
      backgroundColor: item.tone === 'accent' ? '#f7e5ea' : '#ffffff',
      roundness: { type: 3 }, boundElements: [{ id: boundId, type: 'text' }],
    });
    const fontSize = 17;
    const height = fontSize * 2.5 * item.lines.length;
    elements.push({
      ...text(boundId, item.x + 10, item.y + (item.height - height) / 2,
        item.width - 20, item.lines, fontSize),
      containerId: shapeId, textAlign: 'center', verticalAlign: 'middle',
    });
  }
  for (const item of figure.arrows) {
    const [x, y] = item.points[0];
    const points = item.points.map(([px, py]) => [px - x, py - y]);
    const xs = points.map(([px]) => px);
    const ys = points.map(([, py]) => py);
    elements.push({
      ...base(`${figure.id}-${item.id}`, 'arrow', x, y,
        Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys)),
      strokeColor: item.tone === 'accent' ? '#b11f4b' : '#495057',
      points, startArrowhead: null, endArrowhead: 'arrow',
      startBinding: null, endBinding: null, elbowed: false,
    });
  }
  figure.notes.forEach((note, index) =>
    elements.push(text(`${figure.id}-note-${index}`, note.x, note.y - 17, 1200, [note.text], 16)));
  return { type: 'excalidraw', version: 2, source: 'https://github.com/RagnarPitla/Agent-Spark',
    elements, appState: { viewBackgroundColor: '#ffffff', gridSize: null }, files: {} };
}

export function figureArtifacts() {
  const artifacts = new Map();
  for (const figure of figures) {
    artifacts.set(`${figure.id}.svg`, svgFor(figure));
    artifacts.set(`${figure.id}.excalidraw`, `${JSON.stringify(excalidrawFor(figure), null, 2)}\n`);
  }
  return artifacts;
}

export function buildFigures(root) {
  const directory = join(root, 'site/research/assets');
  mkdirSync(directory, { recursive: true });
  for (const [name, content] of figureArtifacts()) {
    writeFileSync(join(directory, name), content);
  }
}

import { CONDITIONS, DEFAULT_CONFIG, HarnessSimulation, MODES } from './engine.mjs';

const simulation = new HarnessSimulation(DEFAULT_CONFIG);
let currentView = simulation.snapshot();
let renderedRunId = null;
let renderedTraceCount = 0;
let lastAuditSignature = null;
let downloadUrl = null;

const phaseLabels = {
  observe: 'observation',
  plan: 'read-only planning',
  gate: 'authorization and approval gate',
  act: 'one approved action attempt',
  verify: 'independent verification',
  recover: 'bounded recovery',
  complete: 'independent completion check',
};

function element(id) {
  const found = document.getElementById(id);
  if (found === null) throw new Error(`The lab template is missing required element #${id}.`);
  return found;
}

function text(id, value) {
  element(id).textContent = String(value);
}

function node(tag, content = '', className = '') {
  const created = document.createElement(tag);
  created.textContent = content;
  if (className) created.className = className;
  return created;
}

function choice(choices, id) {
  const found = choices.find((candidate) => candidate.id === id);
  if (found === undefined) throw new Error(`The template selected an unknown fixture choice: ${id}`);
  return found;
}

function draftSettings() {
  return {
    mode: element('route-mode').value,
    condition: element('condition').value,
    budget: Number(element('step-budget').value),
    maxRetries: Number(element('recovery-limit').value),
  };
}

function settingsChanged(view) {
  const draft = draftSettings();
  return Object.keys(DEFAULT_CONFIG).some((key) => draft[key] !== view.config[key]);
}

function describeSettings() {
  text('mode-description', choice(MODES, element('route-mode').value).description);
  text('condition-description', choice(CONDITIONS, element('condition').value).description);
}

function updateBadge(id, label, tone = '') {
  const badge = element(id);
  badge.textContent = label;
  badge.dataset.tone = tone;
}

function renderControls(view) {
  const dirty = settingsChanged(view);
  const waiting = view.phase === 'awaiting-approval';
  const mayAdvance = view.status === 'running' && !waiting && !dirty;
  element('step').disabled = !mayAdvance;
  element('run').disabled = !mayAdvance;
  element('approve').disabled = dirty || view.pendingApproval?.status !== 'requested';
  element('deny').disabled = dirty || !['requested', 'approved'].includes(view.pendingApproval?.status);
  element('download').disabled = false;
  text('settings-status', dirty
    ? 'Draft settings differ from the active run. Apply / reset to use them. Execution is paused.'
    : 'Reset starts a new run and discards its previous in-memory trace.');
  text('run-id', view.runId);
  text('active-settings', `${choice(MODES, view.config.mode).label} / ${choice(CONDITIONS, view.config.condition).label}`);
  text('step-count', `${view.counts.steps} / ${view.config.budget}`);
  text('attempt-count', view.counts.writeAttempts);
  text('commit-count', view.counts.committedWrites);
  text('verified-count', view.counts.verifiedWrites);
  text('recovery-count', `${view.counts.recoveries} / ${view.config.maxRetries}`);

  let message;
  if (dirty) {
    updateBadge('run-badge', 'Draft settings', 'warning');
    message = 'Draft settings changed. Apply / reset to use them; the active run cannot perform a new write while settings differ.';
  } else if (view.status === 'stopped') {
    updateBadge('run-badge', 'Stopped', 'danger');
    message = `Stopped. ${view.outcome.message}`;
  } else if (view.status === 'completed') {
    updateBadge('run-badge', 'Fixture verified', 'success');
    message = `Completed within the simulation. ${view.outcome.message}`;
  } else if (waiting) {
    updateBadge('run-badge', 'Approval required', 'warning');
    message = `${view.pendingApproval.scope.action} awaits approval for ${view.pendingApproval.scope.target} at revision ${view.pendingApproval.scope.stateRevision}. This request has not performed a write.`;
  } else if (view.phase === 'act') {
    updateBadge('run-badge', 'Approved, not executed', 'warning');
    message = 'Approval granted. Continue to recheck authority and the exact state revision before one write attempt.';
  } else if (view.counts.steps === 0) {
    updateBadge('run-badge', 'Ready');
    message = 'Ready. Nothing has run. Inspect the preview plan, then take a step.';
  } else {
    updateBadge('run-badge', 'In progress');
    message = `Next: ${phaseLabels[view.phase]}. ${view.trace.at(-1).message}`;
  }
  text('run-status', message);
  const activePhase = waiting ? 'gate'
    : view.phase === 'completed' ? 'complete'
      : view.phase === 'stopped' ? view.trace.at(-1).phase : view.phase;
  for (const item of document.querySelectorAll('.phase-rail [data-phase]')) {
    if (item.dataset.phase === activePhase) item.setAttribute('aria-current', 'step');
    else item.removeAttribute('aria-current');
  }
}

function renderPlan(view) {
  const plan = view.plan;
  text('plan-status', view.planIsPreview
    ? 'Preview of the fixed workflow only. No observation or action has run.'
    : `Plan based on observed revision ${plan.observedRevision}. Backing fixture is now revision ${view.fixture.revision}.`);
  text('plan-rule', plan.rule);
  const rows = plan.actions.map((action) => {
    const item = node('li', '', 'plan-item');
    item.append(node('h3', action.label), node('p', action.postcondition));
    const status = action.satisfied ? 'Observed condition satisfied' : action.supported ? 'Pending' : 'Unsupported: must stop';
    const badge = node('span', `${status} / ${action.adapter}`, 'badge');
    badge.dataset.tone = action.satisfied ? 'success' : action.supported ? '' : 'danger';
    item.append(badge, node('code', `Target: ${action.target}`));
    if (plan.nextIntent?.action === action.action) {
      item.append(node('p', `Next intent: ${JSON.stringify(action.payload)}`, 'small muted'));
    } else if (!action.satisfied) {
      item.append(node('p', 'Scope is not approved in advance. Re-observe after the preceding write.', 'small muted'));
    }
    return item;
  });
  element('plan-list').replaceChildren(...rows);
  text('attach-permission', view.fixture.permissions.attachReceipt ? 'Allowed' : 'DENIED');
  text('clear-permission', view.fixture.permissions.clearHold ? 'Allowed' : 'DENIED');
}

function displayValue(value) {
  if (value === null) return 'None';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  return String(value);
}

function renderFixture(view, isNewRun) {
  const { invoice, receipt, revision, portal, document: vendorDocument } = view.fixture;
  text('fixture-revision', `Revision ${revision}`);
  text('invoice-id', invoice.id);
  text('invoice-supplier', invoice.supplier);
  const amount = new Intl.NumberFormat('en-US', { style: 'currency', currency: invoice.currency }).format(invoice.amountCents / 100);
  text('invoice-amount', `${amount} ${invoice.currency}`);
  text('invoice-po', invoice.purchaseOrderId);
  text('accepted-receipt', receipt.id);
  text('attached-receipt', invoice.receiptId ?? 'None');
  text('invoice-hold', invoice.paymentHold ? 'ON' : 'OFF');
  text('invoice-status', invoice.status === 'held' ? 'Held' : invoice.status);
  text('invoice-paid', invoice.paid ? 'Yes' : 'No');
  text('portal-feedback', portal.lastConfirmation === null
    ? 'No screen save attempted yet.'
    : `${portal.lastConfirmation.message} This is an adapter claim, not an audit result.`);
  text('vendor-note', vendorDocument.text);
  if (isNewRun) element('document-details').open = view.config.condition === 'deceptive-document';

  const auditPanel = element('audit-summary').closest('.audit-panel');
  if (view.lastCheck === null) {
    text('audit-summary', 'Not run. A confirmation message alone cannot complete this task.');
    element('audit-rows').replaceChildren();
    element('audit-details').open = false;
    auditPanel.dataset.result = 'not-run';
    lastAuditSignature = null;
    return;
  }
  const check = view.lastCheck;
  const failed = check.checks.filter((item) => !item.passed);
  text('audit-summary', check.passed
    ? `PASSED at revision ${check.revision}: all ${check.checks.length} specified backing-state comparisons matched.`
    : `FAILED at revision ${check.revision}: ${failed.map((item) => item.label).join('; ')}. No completion claim.`);
  auditPanel.dataset.result = check.passed ? 'passed' : 'failed';
  element('audit-rows').replaceChildren(...check.checks.map((comparison) => {
    const row = node('tr');
    row.append(node('th', comparison.label), node('td', displayValue(comparison.expected)),
      node('td', displayValue(comparison.actual)), node('td', comparison.passed ? 'Passed' : 'FAILED'));
    row.firstElementChild.scope = 'row';
    return row;
  }));
  const signature = JSON.stringify(check);
  if (!check.passed && signature !== lastAuditSignature) element('audit-details').open = true;
  lastAuditSignature = signature;
}

function renderApproval(view) {
  const request = view.pendingApproval;
  const active = request !== null;
  element('approval-details').hidden = !active;
  element('approval-card').dataset.waiting = String(active);
  if (active) {
    const { scope } = request;
    updateBadge('approval-badge', request.status === 'requested' ? 'Decision required' : 'Approved / unused', 'warning');
    text('approval-status', request.status === 'requested'
      ? 'Approve or deny this one write. Run and Step are paused until you decide.'
      : 'Granted but not used. Continue the run to recheck state and attempt this write, or deny to revoke it.');
    text('approval-id', request.id);
    text('approval-run', scope.runId);
    text('approval-action', scope.action);
    text('approval-target', scope.target);
    text('approval-revision', scope.stateRevision);
    text('approval-adapter', scope.adapter);
    text('approval-payload', JSON.stringify(scope.payload, null, 2));
  } else {
    updateBadge('approval-badge', view.approvals.length === 0 ? 'Not requested' : 'No active grant');
    text('approval-status', view.status === 'stopped'
      ? 'Run stopped. No approval can authorize another write. Inspect the ledger or reset.'
      : view.status === 'completed'
        ? 'All fixture postconditions checked. No active approval remains.'
        : 'No approval is active. The engine must observe, plan, and pass the gate before another write.');
  }
  text('history-summary', `Approval ledger (${view.approvals.length})`);
  element('approval-history').replaceChildren(...view.approvals.map((approval) => {
    const scope = approval.scope;
    const reason = approval.reason ? ` / ${approval.reason}` : '';
    return node('li', `${approval.id}: ${approval.status.toUpperCase()}${reason}. ${scope.action} on ${scope.target}, revision ${scope.stateRevision}, via ${scope.adapter}.`);
  }));
}

function renderTrace(view, isNewRun) {
  if (isNewRun) {
    element('trace').replaceChildren();
    renderedTraceCount = 0;
    text('export-status', 'The JSON includes the simulation notice, settings, exact approvals, full trace, and initial/final fixture state.');
  }
  const entries = view.trace.slice(renderedTraceCount).map((event) => {
    const item = node('li', '', 'trace-entry');
    const number = node('span', String(event.step).padStart(2, '0'), 'trace-number');
    number.setAttribute('aria-label', `Step ${event.step}`);
    const body = node('div');
    const label = node('div', '', 'trace-label');
    label.append(node('strong', event.phase), node('code', event.event));
    const details = node('details');
    details.append(node('summary', 'Inspect evidence'), node('pre', JSON.stringify({
      fixtureRevision: event.fixtureRevision, ...event.details,
    }, null, 2)));
    body.append(label, node('p', event.message, 'trace-message'), details);
    item.append(number, body);
    return item;
  });
  element('trace').append(...entries);
  renderedTraceCount = view.trace.length;
  element('empty-trace').hidden = view.trace.length !== 0;
}

function render(view) {
  const isNewRun = renderedRunId !== view.runId;
  currentView = view;
  describeSettings();
  renderControls(view);
  renderPlan(view);
  renderFixture(view, isNewRun);
  renderApproval(view);
  renderTrace(view, isNewRun);
  renderedRunId = view.runId;
}

function advance(command) {
  const previousRequest = currentView.pendingApproval?.id;
  const next = command();
  render(next);
  if (next.pendingApproval?.status === 'requested' && next.pendingApproval.id !== previousRequest) {
    element('approval-title').focus();
  } else if (next.status !== 'running') {
    element('run-status').focus();
  }
}

element('configuration').addEventListener('submit', (event) => {
  event.preventDefault();
  if (!element('configuration').reportValidity()) return;
  render(simulation.reset(draftSettings()));
  element('run').focus();
});
element('configuration').addEventListener('input', () => render(currentView));
element('configuration').addEventListener('change', () => render(currentView));
element('step').addEventListener('click', () => advance(() => simulation.step()));
element('run').addEventListener('click', () => advance(() => simulation.runUntilPause()));
element('approve').addEventListener('click', () => {
  render(simulation.approve(currentView.pendingApproval.id));
  element(currentView.status === 'running' ? 'run' : 'run-status').focus();
});
element('deny').addEventListener('click', () => {
  render(simulation.deny(currentView.pendingApproval.id));
  element('run-status').focus();
});

element('download').addEventListener('click', () => {
  if (downloadUrl !== null) URL.revokeObjectURL(downloadUrl);
  const artifact = new Blob([`${JSON.stringify(simulation.exportTrace(), null, 2)}\n`], { type: 'application/json;charset=utf-8' });
  downloadUrl = URL.createObjectURL(artifact);
  const link = node('a');
  link.href = downloadUrl;
  link.download = `harness-simulation-${currentView.config.mode}-${currentView.config.condition}-${currentView.runId}.json`;
  link.hidden = true;
  document.body.append(link);
  link.click();
  link.remove();
  text('export-status', 'Simulation JSON download requested locally. It contains synthetic data and an explicit no-model, no-live-automation notice.');
});
window.addEventListener('pagehide', () => {
  if (downloadUrl !== null) URL.revokeObjectURL(downloadUrl);
  downloadUrl = null;
});

const colorPreference = window.matchMedia('(prefers-color-scheme: dark)');
const queryTheme = new URLSearchParams(window.location.search).get('scoutTheme');
element('theme').value = ['light', 'dark'].includes(queryTheme) ? queryTheme : 'system';
function applyTheme() {
  const selected = element('theme').value;
  const theme = selected === 'system' ? (colorPreference.matches ? 'dark' : 'light') : selected;
  document.documentElement.setAttribute('data-theme', theme);
}
element('theme').addEventListener('change', applyTheme);
colorPreference.addEventListener('change', () => {
  if (element('theme').value === 'system') applyTheme();
});
applyTheme();
element('theme').disabled = false;
element('configuration-fields').disabled = false;
render(currentView);

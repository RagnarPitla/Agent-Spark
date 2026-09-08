import test from 'node:test';
import assert from 'node:assert/strict';
import { CONDITIONS, DEFAULT_CONFIG, HarnessSimulation, MODES, SIMULATION_NOTICE } from './engine.mjs';

function finishWithApprovals(simulation) {
  for (let pause = 0; pause < 80; pause += 1) {
    const view = simulation.runUntilPause();
    if (view.status !== 'running') return view;
    assert.equal(view.phase, 'awaiting-approval');
    assert.equal(view.pendingApproval.status, 'requested');
    simulation.approve(view.pendingApproval.id);
  }
  assert.fail('A scripted run did not terminate within 80 approval pauses.');
}

function firstApproval(simulation) {
  const view = simulation.runUntilPause();
  assert.equal(view.phase, 'awaiting-approval');
  assert.equal(view.counts.writeAttempts, 0);
  assert.equal(view.counts.committedWrites, 0);
  return view.pendingApproval;
}

function assertUnpaidInvariant(view) {
  assert.equal(view.fixture.invoice.id, 'SIM-INV-1042');
  assert.equal(view.fixture.invoice.purchaseOrderId, 'SIM-PO-77');
  assert.equal(view.fixture.invoice.amountCents, 125000);
  assert.equal(view.fixture.invoice.currency, 'USD');
  assert.equal(view.fixture.invoice.paid, false);
}

for (const mode of MODES) {
  for (const condition of CONDITIONS) {
    test(`${mode.id} / ${condition.id}: explicit route, authority, and completion outcome`, () => {
      const simulation = new HarnessSimulation({ mode: mode.id, condition: condition.id });
      const initial = simulation.snapshot().fixture;
      const view = finishWithApprovals(simulation);
      assertUnpaidInvariant(view);
      assert.ok(view.counts.steps <= view.config.budget);
      assert.equal(view.counts.steps, view.trace.length);
      assert.deepEqual(view.trace.map((entry) => entry.step), Array.from({ length: view.trace.length }, (_, index) => index + 1));
      assert.equal(view.pendingApproval, null);

      if (condition.id === 'missing-permission') {
        assert.equal(view.status, 'stopped');
        assert.equal(view.outcome.code, 'permission-denied');
        assert.equal(view.counts.writeAttempts, 0);
        assert.equal(view.approvals.length, 0);
        assert.equal(view.trace.at(-1).details.fallbackAttempted, false);
        assert.deepEqual(view.fixture, initial);
      } else if (mode.id === 'api') {
        assert.equal(view.status, 'stopped');
        assert.equal(view.outcome.code, 'unsupported-api-action');
        assert.equal(view.counts.writeAttempts, 0);
        assert.equal(view.approvals.length, 0);
        assert.equal(view.trace.at(-1).details.fallbackAttempted, false);
        assert.deepEqual(view.fixture, initial);
      } else {
        assert.equal(view.status, 'completed');
        assert.equal(view.fixture.invoice.receiptId, condition.id === 'stale-state' ? 'SIM-GR-13' : 'SIM-GR-12');
        assert.equal(view.fixture.invoice.paymentHold, false);
        assert.equal(view.fixture.invoice.status, 'ready-for-review');
        assert.equal(view.counts.committedWrites, 2);
        assert.equal(view.counts.verifiedWrites, 2);
        assert.equal(view.counts.writeAttempts, condition.id === 'false-confirmation' ? 3 : 2);
        assert.equal(view.counts.recoveries, ['stale-state', 'false-confirmation'].includes(condition.id) ? 1 : 0);
        assert.equal(view.lastCheck.source, 'independent-fixture-auditor');
        assert.equal(view.lastCheck.passed, true);
        assert.ok(view.lastCheck.checks.every((check) => check.passed));
        const attempts = view.trace.filter((entry) => entry.event === 'write-attempted');
        assert.equal(attempts.at(-1).details.intent.adapter, mode.id === 'gui' ? 'simulated-screen' : 'fixture-api');
        assert.ok(attempts.filter((entry) => entry.details.intent.action === 'attachReceipt')
          .every((entry) => entry.details.intent.adapter === 'simulated-screen'));
        for (const attempt of attempts) {
          const approval = view.approvals.find((candidate) => candidate.id === attempt.details.approvalId);
          assert.equal(approval.status, 'consumed');
          assert.equal(approval.consumedAtStep, attempt.step);
          assert.deepEqual(approval.scope, { runId: view.runId, ...attempt.details.intent });
        }
      }
      const observations = view.trace.filter((entry) => entry.phase === 'observe');
      assert.ok(observations.every((entry) => entry.details.observation.adapter === (mode.id === 'gui' ? 'simulated-screen' : 'fixture-api')));
    });
  }
}

test('preview, observation, planning, and waiting are read-only and never auto-approve', () => {
  const simulation = new HarnessSimulation();
  const initial = simulation.snapshot();
  assert.equal(initial.planIsPreview, true);
  assert.equal(initial.plan.actions.length, 2);
  assert.deepEqual(simulation.step().fixture, initial.fixture);
  const planned = simulation.step();
  assert.equal(planned.planIsPreview, false);
  assert.equal(planned.phase, 'gate');
  assert.deepEqual(planned.fixture, initial.fixture);
  const waiting = simulation.step();
  assert.equal(waiting.phase, 'awaiting-approval');
  assert.equal(waiting.pendingApproval.status, 'requested');
  for (let repeat = 0; repeat < 5; repeat += 1) {
    assert.deepEqual(simulation.step(), waiting);
    assert.deepEqual(simulation.runUntilPause(), waiting);
  }
  assert.deepEqual(waiting.fixture, initial.fixture);
});

test('an approval is exact-scope, single-use, and cannot authorize the next action', () => {
  const simulation = new HarnessSimulation();
  const approval = firstApproval(simulation);
  assert.deepEqual(approval.scope, {
    runId: 'simulation-run-1',
    action: 'attachReceipt',
    target: 'SIM-INV-1042',
    stateRevision: 1,
    adapter: 'simulated-screen',
    payload: { receiptId: 'SIM-GR-12', purchaseOrderId: 'SIM-PO-77' },
  });
  assert.throws(() => simulation.approve('invented-approval'), /No matching active approval/);
  const granted = simulation.approve(approval.id);
  assert.equal(granted.counts.writeAttempts, 0);
  assert.equal(granted.pendingApproval.status, 'approved');
  assert.throws(() => simulation.approve(approval.id), /No matching active approval/);
  const attempted = simulation.step();
  assert.equal(attempted.phase, 'verify');
  assert.equal(attempted.approvals[0].status, 'consumed');
  assert.equal(attempted.pendingApproval, null);
  assert.throws(() => simulation.approve(approval.id), /No matching active approval/);
  assert.throws(() => simulation.deny(approval.id), /No matching active approval/);
  const next = simulation.runUntilPause();
  assert.equal(next.counts.writeAttempts, 1);
  assert.equal(next.pendingApproval.scope.action, 'clearHold');
  assert.equal(next.pendingApproval.scope.stateRevision, 2);
  assert.notEqual(next.pendingApproval.id, approval.id);
  assert.equal(next.fixture.invoice.paymentHold, true);
});

for (const decisionPoint of ['requested', 'approved', 'second-write']) {
  test(`denying at ${decisionPoint} prevents every subsequent write`, () => {
    const simulation = new HarnessSimulation();
    let approval = firstApproval(simulation);
    if (decisionPoint !== 'requested') simulation.approve(approval.id);
    if (decisionPoint === 'second-write') approval = simulation.runUntilPause().pendingApproval;
    const beforeDeny = simulation.snapshot();
    const denied = simulation.deny(approval.id);
    assert.equal(denied.status, 'stopped');
    assert.equal(denied.outcome.code, 'approval-denied');
    assert.equal(denied.pendingApproval, null);
    assert.equal(denied.approvals.at(-1).status, 'denied');
    assert.deepEqual(denied.fixture, beforeDeny.fixture);
    assert.equal(denied.counts.writeAttempts, decisionPoint === 'second-write' ? 1 : 0);
    assert.equal(denied.fixture.invoice.paymentHold, true);
    assert.deepEqual(simulation.step(), denied);
    assert.deepEqual(simulation.runUntilPause(), denied);
    assert.throws(() => simulation.approve(approval.id), /No matching active approval/);
  });
}

test('stale state invalidates approval before adapter use and changes the re-approved intent', () => {
  const simulation = new HarnessSimulation({ condition: 'stale-state' });
  const old = firstApproval(simulation);
  simulation.approve(old.id);
  const stale = simulation.step();
  assert.equal(stale.phase, 'recover');
  assert.equal(stale.counts.writeAttempts, 0);
  assert.equal(stale.counts.committedWrites, 0);
  assert.equal(stale.fixture.revision, 2);
  assert.equal(stale.fixture.invoice.receiptId, null);
  assert.equal(stale.fixture.receipt.id, 'SIM-GR-13');
  assert.equal(stale.pendingApproval, null);
  assert.equal(stale.approvals[0].status, 'invalidated');
  assert.equal(stale.approvals[0].reason, 'state-or-intent-changed');
  assert.throws(() => simulation.approve(old.id), /No matching active approval/);
  const retry = simulation.runUntilPause();
  assert.equal(retry.pendingApproval.scope.stateRevision, 2);
  assert.equal(retry.pendingApproval.scope.payload.receiptId, 'SIM-GR-13');
  assert.notEqual(retry.pendingApproval.scopeKey, old.scopeKey);
  assert.equal(retry.counts.writeAttempts, 0);
  assert.throws(() => simulation.approve(old.id), /No matching active approval/);
  assert.equal(finishWithApprovals(simulation).status, 'completed');
});

test('a success acknowledgement cannot satisfy the independent backing-state postcondition', () => {
  const simulation = new HarnessSimulation({ condition: 'false-confirmation' });
  const approval = firstApproval(simulation);
  simulation.approve(approval.id);
  const attempted = simulation.step();
  assert.equal(attempted.fixture.portal.lastConfirmation.reportedSuccess, true);
  assert.equal(attempted.fixture.invoice.receiptId, null);
  assert.equal(attempted.fixture.revision, 1);
  assert.equal(attempted.counts.committedWrites, 0);
  assert.equal(attempted.approvals[0].status, 'consumed');
  const failed = simulation.step();
  assert.equal(failed.phase, 'recover');
  assert.equal(failed.lastCheck.passed, false);
  assert.equal(failed.lastCheck.source, 'independent-fixture-auditor');
  assert.ok(failed.lastCheck.checks.some((check) => check.label === 'One backing-state revision committed' && !check.passed));
  assert.equal(failed.counts.verifiedWrites, 0);
  const retry = simulation.runUntilPause().pendingApproval;
  assert.notEqual(retry.id, approval.id);
  assert.equal(retry.scopeKey, approval.scopeKey);
  assert.throws(() => simulation.approve(approval.id), /No matching active approval/);
  const completed = finishWithApprovals(simulation);
  assert.equal(completed.status, 'completed');
  assert.equal(completed.counts.writeAttempts, 3);
});

test('deceptive text is not parsed as instructions or used in action scope', () => {
  const normal = new HarnessSimulation();
  const deceptive = new HarnessSimulation({ condition: 'deceptive-document' });
  const normalView = finishWithApprovals(normal);
  const deceptiveView = finishWithApprovals(deceptive);
  assert.match(deceptiveView.fixture.document.text, /SYSTEM OVERRIDE/);
  assert.deepEqual(deceptiveView.approvals, normalView.approvals);
  assert.deepEqual(deceptiveView.fixture.invoice, normalView.fixture.invoice);
  assert.deepEqual(deceptiveView.trace.filter((entry) => entry.event === 'write-attempted'),
    normalView.trace.filter((entry) => entry.event === 'write-attempted'));
  assert.ok(deceptiveView.trace.filter((entry) => entry.phase === 'observe').every((entry) => entry.details.documentUsedAsPolicy === false));
});

for (const condition of ['stale-state', 'false-confirmation']) {
  test(`${condition}: zero recoveries fails closed; one bounded recovery can finish`, () => {
    const stopped = finishWithApprovals(new HarnessSimulation({ condition, maxRetries: 0 }));
    assert.equal(stopped.status, 'stopped');
    assert.equal(stopped.outcome.code, 'recovery-limit-exhausted');
    assert.equal(stopped.counts.recoveries, 0);
    assert.equal(stopped.counts.committedWrites, 0);
    assert.equal(stopped.fixture.invoice.paymentHold, true);
    const completed = finishWithApprovals(new HarnessSimulation({ condition, maxRetries: 1 }));
    assert.equal(completed.status, 'completed');
    assert.equal(completed.counts.recoveries, 1);
  });
}

test('every mode and condition stays within small and maximum budgets', () => {
  for (const mode of MODES) {
    for (const condition of CONDITIONS) {
      for (const budget of [1, 2, 3, 4, 5, 6, 12, 15, 16, 20, 24, 48, 80]) {
        const simulation = new HarnessSimulation({ mode: mode.id, condition: condition.id, budget });
        const view = finishWithApprovals(simulation);
        assert.notEqual(view.status, 'running', `${mode.id}/${condition.id}/${budget}`);
        assert.ok(view.counts.steps <= budget);
        assert.ok(view.counts.recoveries <= view.config.maxRetries);
        assert.ok(view.counts.writeAttempts <= 3);
        assert.ok(view.approvals.every((approval) => !['approved', 'requested'].includes(approval.status)));
        if (view.outcome.code === 'step-budget-exhausted') assert.equal(view.counts.steps, budget);
        assertUnpaidInvariant(view);
      }
    }
  }
});

test('budget exhaustion invalidates unused grants and never hides partial fixture writes', () => {
  const beforeWrite = new HarnessSimulation({ budget: 5 });
  const approval = firstApproval(beforeWrite);
  beforeWrite.approve(approval.id);
  const stopped = beforeWrite.runUntilPause();
  assert.equal(stopped.outcome.code, 'step-budget-exhausted');
  assert.equal(stopped.counts.committedWrites, 0);
  assert.equal(stopped.approvals[0].status, 'invalidated');
  assert.equal(stopped.approvals[0].reason, 'step-budget-exhausted');

  const afterWrite = finishWithApprovals(new HarnessSimulation({ budget: 6 }));
  assert.equal(afterWrite.outcome.code, 'step-budget-exhausted');
  assert.equal(afterWrite.counts.committedWrites, 1);
  assert.equal(afterWrite.counts.verifiedWrites, 0);
  assert.equal(afterWrite.fixture.invoice.receiptId, 'SIM-GR-12');
  assert.equal(afterWrite.fixture.invoice.paymentHold, true);
  assert.equal(afterWrite.status, 'stopped');
});

test('denial uses the reserved terminal slot without losing the human decision', () => {
  const simulation = new HarnessSimulation({ budget: 4 });
  const approval = firstApproval(simulation);
  const stopped = simulation.deny(approval.id);
  assert.equal(stopped.counts.steps, 4);
  assert.equal(stopped.counts.writeAttempts, 0);
  assert.equal(stopped.outcome.code, 'approval-denied');
  assert.equal(stopped.approvals[0].status, 'denied');
  assert.equal(stopped.trace.at(-1).event, 'approval-denied');
});

test('reset clears pending and consumed approvals, counters, observations, faults, and state', () => {
  const simulation = new HarnessSimulation({ condition: 'stale-state' });
  const old = firstApproval(simulation);
  simulation.approve(old.id);
  simulation.step();
  const reset = simulation.reset();
  assert.equal(reset.runId, 'simulation-run-2');
  assert.deepEqual(reset.config, { ...DEFAULT_CONFIG, condition: 'stale-state' });
  assert.deepEqual(reset.counts, { steps: 0, writeAttempts: 0, committedWrites: 0, verifiedWrites: 0, recoveries: 0 });
  assert.equal(reset.phase, 'observe');
  assert.equal(reset.observation, null);
  assert.equal(reset.planIsPreview, true);
  assert.equal(reset.lastCheck, null);
  assert.equal(reset.pendingApproval, null);
  assert.equal(reset.trace.length, 0);
  assert.equal(reset.approvals.length, 0);
  assert.equal(reset.fixture.revision, 1);
  assert.equal(reset.fixture.receipt.id, 'SIM-GR-12');
  assert.equal(reset.fixture.invoice.receiptId, null);
  assert.throws(() => simulation.approve(old.id), /No matching active approval/);
  const newApproval = firstApproval(simulation);
  assert.notEqual(newApproval.id, old.id);
  assert.notEqual(newApproval.scopeKey, old.scopeKey);
  const completed = finishWithApprovals(simulation);
  assert.equal(completed.counts.recoveries, 1);
  const normalReset = simulation.reset({ mode: 'gui' });
  assert.equal(normalReset.fixture.portal.lastConfirmation, null);
  assert.deepEqual(normalReset.config, { ...DEFAULT_CONFIG, mode: 'gui' });
  assert.equal(finishWithApprovals(simulation).counts.committedWrites, 2);
});

test('public snapshots and exports cannot mutate the private fixture or approval', () => {
  const simulation = new HarnessSimulation();
  const request = firstApproval(simulation);
  request.scope.target = 'not-the-approved-invoice';
  request.scope.payload.receiptId = 'invented-receipt';
  const view = simulation.snapshot();
  view.fixture.permissions.attachReceipt = false;
  view.fixture.invoice.paid = true;
  view.approvals[0].status = 'approved';
  const exported = simulation.exportTrace();
  exported.finalFixture.invoice.paymentHold = false;
  assert.equal(simulation.snapshot().pendingApproval.status, 'requested');
  assert.equal(simulation.snapshot().pendingApproval.scope.target, 'SIM-INV-1042');
  assert.equal(simulation.snapshot().fixture.permissions.attachReceipt, true);
  assert.equal(simulation.snapshot().fixture.invoice.paid, false);
  assert.equal(simulation.snapshot().fixture.invoice.paymentHold, true);
});

test('invalid configuration fails explicitly, and an invalid reset preserves the current run', () => {
  for (const options of [null, [], { mode: 'live' }, { condition: 'unknown' }, { budget: 0 }, { budget: 81 }, { budget: 3.5 }, { maxRetries: -1 }, { maxRetries: 3 }, { budget: undefined }, { url: 'not-accepted' }]) {
    assert.throws(() => new HarnessSimulation(options), /fixture|route|budget|recovery/i);
  }
  const simulation = new HarnessSimulation();
  firstApproval(simulation);
  const before = simulation.exportTrace();
  assert.throws(() => simulation.reset({ mode: 'live' }), /Unknown route/);
  assert.deepEqual(simulation.exportTrace(), before);
});

test('identical fresh runs and decisions produce byte-identical labeled simulation exports', () => {
  for (const mode of MODES) {
    for (const condition of CONDITIONS) {
      const first = new HarnessSimulation({ mode: mode.id, condition: condition.id });
      const second = new HarnessSimulation({ mode: mode.id, condition: condition.id });
      finishWithApprovals(first);
      finishWithApprovals(second);
      assert.equal(JSON.stringify(first.exportTrace()), JSON.stringify(second.exportTrace()));
      const trace = first.exportTrace();
      assert.equal(trace.classification, 'SCRIPTED_SIMULATION');
      assert.equal(trace.notice, SIMULATION_NOTICE);
      assert.match(trace.notice, /Synthetic data; no LLM; no live computer\/browser automation; no external\/tenant calls; not a security sandbox;/);
      assert.match(trace.notice, /does not establish model effectiveness or real-world reliability/);
      assert.match(trace.measurementLimit, /not latency, benchmark/);
    }
  }
});

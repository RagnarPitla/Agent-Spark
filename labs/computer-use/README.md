# Computer-use harness learning lab

> **SCRIPTED SIMULATION. Synthetic data; no LLM; no live computer/browser automation; no external/tenant calls; not a security sandbox; does not establish model effectiveness or real-world reliability.**

An experimental, dependency-free learning fixture for a synthetic invoice exception. It implements a small control loop, not an `agentspark` CLI, a production harness, a computer-use agent, or an evaluation of a model.

## Build and test

From the repository root, using Node >=20:

```sh
node scripts/build-harness-lab.mjs
node --test labs/computer-use/*.test.mjs
node scripts/build-harness-lab.mjs --check
```

Open `site/research/lab.html` directly. The generated file has its own CSS, data, engine, and browser controller, so `file://` works without a server. The same file works at `/Agent-Spark/research/lab.html`. Navigation assumes adjacent `index.html`, `whitepaper.html`, and `article.html` pages. Those links are optional to running the fixture.

No dependency installation is needed. The build is deterministic and the `--check` command is read-only. Edit source files here, then regenerate the HTML; do not hand-edit the output.

## What the task does

The fixture contains invoice `SIM-INV-1042` from fictional Fable Parts, for USD 1,250.00 against `SIM-PO-77`. The fixed plan:

1. Attach the currently accepted goods receipt.
2. Clear the exception hold to `ready-for-review`.
3. Independently verify the final record.

No action pays an invoice. Identity, supplier, purchase order, amount, currency, and `paid: false` are checked as invariants. The mock application reflects the actual in-memory fixture, not a decorative screen.

| Mode | Observation | Receipt attachment | Hold update |
| --- | --- | --- | --- |
| API only | Structured fixture record | Unsupported: stop without writes | Implemented, but cannot bypass the missing attachment |
| GUI only | Scripted screen projection | Simulated screen action | Simulated screen action |
| Hybrid | Structured fixture record | Simulated screen action | Structured fixture action |

The simulated screen adapter has neither pixels nor real controls. All modes use a separate **privileged fixture auditor** for verification. That auditor is an intentionally available test oracle, not a claim that GUI-only real systems provide independent read access.

## Try the conditions

1. **Normal:** choose Hybrid and Run to next pause. Inspect the target, revision, adapter, and payload. Approve, then continue. The second action needs a different approval.
2. **Missing permission:** the actor cannot attach receipts. Every mode stops with no write attempt and no approval prompt. A GUI route cannot substitute for authorization.
3. **Stale target / state:** after the first approval, a scripted external correction replaces the accepted receipt with `SIM-GR-13` and increments the revision. The old approval is invalidated before adapter use. Recovery observes the changed receipt and requires a new approval.
4. **Deceptive document instruction:** inspect the vendor note. It asks to bypass controls but is always data, never a source of instructions. Planning does not parse document text. This is hard-coded trust separation, not demonstrated prompt-injection resistance.
5. **Save confirmation without a save:** the first simulated screen save claims success but leaves the backing invoice unchanged. Verification fails. Recovery requires a fresh approval even though the requested effect is unchanged. This injected fault occurs once.

API-only runs stop at their unsupported receipt operation. For the missing-permission condition, the permission stop takes precedence over the capability stop. To observe stale-state and false-confirmation recovery, use Hybrid or GUI only.

## Approval and stop semantics

An approval binds the run, action, target invoice, exact state revision, adapter, and payload. It is requested only after the authority and capability gates pass. Granting it does not execute the write. Execution checks current authority and recomputes the current intent before consuming the approval for exactly one attempt.

- A changed revision or intent invalidates the approval before any adapter write.
- A failed save still consumes its approval. Retry cannot reuse it.
- Denial, including denial of an already granted but unused approval, stops all subsequent writes.
- Reset discards state, trace, and approval history, increments the instance's run ordinal, and recreates the fixture. An old request cannot approve a new run.
- A stop does not roll back earlier fixture writes. Committed effects remain visible, including when the budget expires before verification.
- Request IDs and run ordinals are deterministic local identifiers, not authentication or cryptographic capabilities.

The default budget is 48 transitions; allowed values are 1 to 80. Observation, planning, gates, decisions, attempts, verification, recovery, and completion count as transitions. The final slot is reserved for a visible budget stop. Waiting does not consume steps. The recovery limit is 0 to 2. Run to next pause never auto-approves and has a bounded loop; it stops at an approval or terminal state.

## Files

- `engine.mjs`: private fixture and deterministic control loop; no browser or Node-specific dependencies.
- `engine.test.mjs`: built-in Node tests of all route/condition combinations and control invariants.
- `browser.mjs`: accessible controls, state panel, append-only visible trace, and explicit local JSON download.
- `lab.template.html` and `lab.css`: self-contained-page source using the Clawpilot theme.
- `artifact.test.mjs`: generated-output, syntax, embedding, and structural contracts.
- `../../scripts/build-harness-lab.mjs`: minimal fixed-source embedder. It removes ES module boundaries, not engine behavior.
- `../../site/research/lab.html`: generated offline artifact.
- `../../docs/research/lab.md`: research-facing method note and interpretation limits.

The browser never imports the engine over the network: the build embeds the same engine source used by tests. DOM rendering uses text nodes, not executable document strings. There are no arbitrary URL, code, or file-upload inputs, no model calls, no timers simulating latency, and no persistence or analytics. A restrictive page CSP also disallows connection requests. These design choices do not make the page a security sandbox.

## What the evidence does not show

Passing tests establish specified behavior only within this fixture. They do not test perception, reasoning, generated planning, real authorization systems, concurrent writes, transactionality, network failures, real browser interaction, or production auditability. The fixture provides known permissions, fixed tasks, atomic synchronous writes, deterministic faults, and a privileged verifier.

Step counts are counts of this state machine only, not performance comparisons. Real evaluation would need authorized systems, defined task distributions, independent outcomes, human-review accounting, repeated trials, and explicit failure/handoff criteria.

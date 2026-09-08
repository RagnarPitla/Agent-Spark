# A scripted lab for observing, acting, verifying, and recovering

> **SCRIPTED SIMULATION. Synthetic data; no LLM; no live computer/browser automation; no external/tenant calls; not a security sandbox; does not establish model effectiveness or real-world reliability.**

**Maturity: experimental educational artifact.** Agent Spark has templates and content validators; this lab does not implement an `agentspark` CLI or a production harness.

The [offline lab](../../site/research/lab.html) makes a narrow claim executable: a fixed workflow can route actions, distinguish authorization from interface availability, bind approval to a specific effect, check a postcondition independently, and stop or recover when evidence disagrees. It makes no claim about the ability of a model to choose correct actions.

## The synthetic business problem

Invoice `SIM-INV-1042` from fictional Fable Parts has an exception hold because its accepted receipt has not been attached. Its amount is USD 1,250.00 against `SIM-PO-77`. The permitted task is to attach the accepted receipt and clear the exception hold for review. Payment is never an implemented action, and `paid` remains false.

This task was chosen to expose a capability gap without inventing an authorization gap:

| Route | Available capabilities | Expected outcome |
| --- | --- | --- |
| API only | Read fixture records and update a hold; no receipt-attachment operation | Stop before any write. Do not fabricate a completed API operation. |
| GUI only | Read a scripted screen projection and invoke simulated screen operations | Can finish with approvals and successful fixture checks. No actual GUI is controlled. |
| Hybrid | Structured reads; a simulated screen attachment; structured hold update | Can finish through the authorized UI gap, without using UI access to bypass policy. |

The GUI projection and structured record both come from the same local, known fixture. Route differences illustrate capability contracts, not comparative model or interface performance.

## The control loop

1. **Observe:** copy the chosen adapter's current projection and revision. Vendor-note content is marked untrusted data.
2. **Plan:** compute a read-only plan from fixed task rules. A plan grants neither permission nor approval.
3. **Gate:** check the current fixture permission, adapter capability, target invariants, and receipt prerequisite. Only then request approval.
4. **Approve or deny:** show the exact run, action, target, state revision, adapter, and payload. Approval alone produces no business write. Denial stops remaining writes.
5. **Act:** recompute current intent and check it against the granted scope. Invalidate a stale grant before use. Consume a valid grant for one attempt, including an unsuccessful save.
6. **Verify:** read the backing fixture independently of the adapter's acknowledgement. Check the exact effect, revision increment, and unchanged invoice invariants.
7. **Recover or complete:** a bounded recovery returns to observation and demands another approval. Completion requires a separate final check. A failure or budget stop cannot claim completion.

Reset is explicit and creates a new local run ordinal. It clears fixture effects, observations, trace, pending approvals, and injected-fault state. Trace export contains a simulation label, settings, step-indexed events, approval history, independent comparisons, and initial/final state. It has no clock or random values; fresh instances with the same settings and decisions produce byte-identical JSON.

## Failure probes

| Condition | Deliberate perturbation | Required response |
| --- | --- | --- |
| Normal | None | Two separately approved writes, both independently checked; final state ready for review, not paid. |
| Missing permission | Actor lacks receipt-attachment authority | Stop with zero write attempts, even when the simulated GUI operation exists. Human approval cannot grant missing permission. |
| Stale target / state | First approval is followed by a scripted correction from receipt `SIM-GR-12` to `SIM-GR-13` and a new revision | Invalidate the old scope; do not call the write adapter; observe again and request approval for the revised intent. |
| Deceptive document | Vendor text asks to bypass permissions, approve changes, pay another invoice, and skip verification | Display it as data. Do not parse it into policy or actions. This is hard-coded separation, not a prompt-injection result. |
| False confirmation | First simulated save reports success without changing the backing invoice | Fail the independent check; consume the original approval; require a new one before retry. |

Missing permission takes precedence over missing capability. Other API-only cases stop at their unsupported attachment rather than reaching the injected write-time fault. Use Hybrid or GUI only to inspect those recoveries.

Faults occur once at fixed points. Recovery can demonstrate a repaired run after fresh approval, or stop immediately with the recovery limit set to zero. It is not a realistic model of fault frequency or distribution.

## Bounds and irreversible effects

The step budget is 1 to 80, with a default of 48. Decisions consume steps; idle waiting does not. The engine reserves the last slot for a visible budget stop. The recovery allowance is 0 to 2. Neither one-step execution nor Run to next pause can bypass approval.

If a run stops after its first committed write, that effect remains in the mock application and export. There is no implied transaction, rollback, or payment reversal. A run whose budget expires after an action but before verification remains stopped, with that write explicitly unverified.

Deterministic request identifiers are teaching labels, not secure tokens. The in-memory gate is not an operating-system, tenant, or browser security boundary.

## The independent-verifier assumption

The verifier reads the local backing fixture rather than the adapter's return value or portal message. It checks invoice identity, supplier, purchase order, amount, currency, unpaid state, receipt acceptance, and the action-specific effect. This is sufficient to catch the scripted no-op save.

It also gives the lab a strong advantage: privileged ground truth is guaranteed. A real legacy UI might expose neither a reliable second read nor an authoritative audit channel. The same completion claim would then be unsupported. Production work would need an independent integration, an auditable read-back, human verification, or an explicit inability-to-verify outcome.

## Reproduce and inspect

From the repository root, with Node >=20:

```sh
node scripts/build-harness-lab.mjs
node --test labs/computer-use/*.test.mjs
node scripts/build-harness-lab.mjs --check
```

Open `site/research/lab.html` through `file://` or serve the existing site at `/Agent-Spark/research/lab.html`. No dependencies, server, account, tenant, or connection are required to run the lab. All JS and CSS are embedded. The source is under [labs/computer-use](../../labs/computer-use/README.md); the build embeds the tested `engine.mjs` rather than maintaining a second engine.

The tests cover all 15 mode/condition pairs, read-only planning, permission/capability stops, denial before and after a grant, rejection of consumed and stale approvals, re-approval after failed verification, success postconditions, bounded execution, visible partial effects, reset, snapshot isolation, deterministic exports, and generated-artifact contracts. They are tests of software invariants, not a model evaluation. The repository's `research:build` and `research:test` scripts regenerate the artifact and run these checks.

## A next experiment, not a reported result

A separate authorized evaluation could compare structured-only, UI-only, and hybrid systems on the same task set while controlling permissions, effect scope, and stopping rules. Measure independently verified completion, incorrect side effects, unverified outcomes, recovery behavior, and human approval burden. Record which tasks lack an independent verifier rather than silently treating confirmation messages as truth.

This fixture cannot answer that experiment. It supplies explicit control contracts and counterexamples that a real system could be tested against.

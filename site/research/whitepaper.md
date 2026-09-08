# The missing product is the execution loop

**Computer-use harnesses, enterprise outcomes, and the limits of the AGI claim**

Ragnar Pitla | Technical position paper and research prototype

7 September 2026 | Research draft

## Abstract

An enterprise agent becomes operationally useful when it can cause an authorized change in a business system and provide evidence that the intended change occurred. A chat response can describe that work without completing it. Computer use extends the set of applications an agent can operate, especially where a workflow crosses graphical interfaces without suitable APIs. Access alone, however, does not supply authority, reliable state tracking, recovery, or an acceptable cost of supervision.

This paper argues for a controlled execution loop: a harness that combines model inference, structured tools, graphical interaction, persistent task state, action-scoped authorization, and postcondition verification. Current OpenAI evidence makes the model-versus-harness distinction concrete. A reported comparison with the same named GPT-5.6 Sol model changes substantially when context handling changes; the GPT-6 Astra announcement separately describes improvements to both the model and the Codex harness. Neither result establishes a universal enterprise advantage, and neither makes GUI interaction necessary or sufficient for AGI.

The contribution is a synthesis, a proposed architecture, a falsifiable study design, and a deterministic local teaching lab. No new model benchmark, tenant experiment, or customer study is reported. The resulting product hypothesis is narrower than "computer use wins": hybrid, policy-constrained harnesses may improve verified workflow completion in enterprises with heterogeneous software, provided their review and recovery costs do not erase the benefit.

## 1. Start with the unit of work

Consider an invoice exception. The invoice and purchase order can be read through an ERP API, but an accepted receipt can only be attached in an older portal. The user wants that receipt attached and the review hold cleared so a person can continue processing the invoice. Each write needs approval; no payment is authorized.

A chatbot can explain the procedure. That may be useful: answering a question is itself a legitimate task. But explanation is not the requested outcome here. The outcome is a particular business state, reached under particular permissions, with a receipt that survives closing the chat.

The distinction changes the product specification. Instead of asking only whether an answer sounds correct, ask which record may change, which transition is permitted, who must approve it, and what would count as evidence that the transition actually happened.

For this paper, an accepted completion has three conditions:

```text
accepted completion =
    the intended postcondition holds
    AND the effects stayed within the authorized scope
    AND the evidence is sufficient for the workflow's reviewer
```

The conjunction matters. A correct result obtained through an unauthorized action is not a successful enterprise task. An authorized click with no durable effect is not a successful task either. Nor is a confident summary unsupported by the final system state.

This is the reason to study harnesses. The model can propose what to do; a product must manage what happens around that proposal. OpenAI's description of the Codex loop explicitly distinguishes an assistant's final message from the changes its tools make to the environment. [S03](sources.md#s03)

The authorization condition is not merely theoretical. The tau-bench paper explicitly notes that a successful final-state reward can conceal a policy violation, such as taking an action without user confirmation. Correct state and a compliant path require different evidence. [S17](sources.md#s17)

## 2. Define the stack before comparing products

Terminology can quietly decide an argument. If "computer use" means any interaction with a digital environment, then APIs and shell tools are computer use too. If it means observing screenshots and operating graphical controls, it is a narrower capability. The AGI claim changes meaning depending on which definition is used.

This paper uses the following distinctions.

| Term | Meaning here | What it does not imply |
| --- | --- | --- |
| Model | A learned system that interprets observations and proposes outputs or actions | A running product, persistent task state, or execution authority |
| Harness | Software that assembles context, invokes the model, dispatches permitted tools, maintains state, and manages stopping or continuation | A particular model, a desktop interface, or guaranteed safety |
| Structured integration | An API, connector, MCP tool, query interface, or similar explicit operation contract | Correct authorization merely because a schema exists |
| GUI computer use | Observation and action through a graphical interface, using pixels, accessibility information, browser structure, or a declared combination | Equivalent access across desktop, browser, CLI, and API products |
| Workflow | A specified process whose control structure is substantially designed in advance | That every step must be manually executed |
| Agent | A system that chooses some actions from observations while pursuing a goal | Unlimited autonomy, general intelligence, or permission to improvise policy |
| Outcome evaluator | A mechanism that assesses the resulting state against a task contract | That a model's own explanation is independent evidence |

A skill can package reusable behavior inside this stack. A template can package a reviewed starting configuration. Neither is interchangeable with the software that executes a task.

Agents and harnesses are not rival categories. A harness is part of how an agent runs. Microsoft's current Copilot Studio documentation uses the term in precisely that architectural role. The meaningful comparison is between execution capabilities and operating contracts, not "harness products" and a fictional category of enterprise platforms that can only chat. [S21](sources.md#s21)

This also prevents a false product comparison. "Codex" can name several experiences. Current computer-use documentation describes desktop functionality with operating-system and application permissions. It should not be read as a promise that every Codex CLI, API, browser, or customer deployment exposes an identical action surface. [S02](sources.md#s02)

## 3. The thesis, sharpened

The initial intuition is that people are building many agents and chatbots while the useful product is a harness that can operate a computer well.

There is a defensible claim inside that intuition:

> For workflows that require action across heterogeneous enterprise software, a harness with reliable, authorized computer use can close gaps that a chat interface or an API-only integration leaves open.

Two qualifications improve the claim rather than weaken it.

First, computer use supplies reach. It does not automatically supply reliability. A visible button is an available control, not proof that the agent has selected the right account, understood the transaction, or received authority to click it.

Second, the best interface is task-dependent. An invoice API can expose a stable record identifier, a version, a typed amount, and a machine-readable receipt. A screen may expose only a rendered approximation of those facts. Where a supported structured integration fits the task, using the GUI instead can add ambiguity without adding capability. OpenAI's own computer-use guidance recommends a dedicated plugin or MCP server for repeatable data operations when one exists. [S02](sources.md#s02)

The stronger product hypothesis is therefore a hybrid one: use structured interfaces where they give an adequate contract; use graphical interaction for authorized gaps; keep both under the same task, identity, policy, and evidence model.

![One synthetic workflow routed through API-only, GUI-only and hybrid strategies. An unavailable API is distinguished from permission denial.](../../site/research/assets/02-interface-routing.svg)

*Figure 1. A conceptual route map, not a performance comparison. The API-only arm cannot complete the example because a required operation has no API. That says something about reach, not reasoning quality.*

Calling computer use a universal interface is useful shorthand only if its limits remain visible. Applications can restrict automation, require privileges the user does not have, expose inaccessible controls, or change their UI. The ability to point at a screen does not dissolve those constraints.

## 4. What the evidence actually says

### A naming correction with architectural consequences

The reviewed public announcement names **GPT-6 Astra**, not "GPT-5.6 Astra." It compares Astra with **GPT-5.6 Sol** and also describes an update to the Codex harness. Keeping the names separate matters because the argument concerns the contributions of a model and its surrounding system. [S01](sources.md#s01)

OpenAI reports an OSWorld 2.0 score of 72.6 for Astra versus 65.7 for Sol on the **v2026.08.08 offline set, using partial scoring**. It also reports a latency simulation. Those qualifiers are part of the result. A partial-credit score of 72.6 is not evidence that 72.6% of arbitrary customer workflows complete successfully.

The same announcement describes faster computer use after a harness update. This is relevant product evidence, but it is not a clean experiment assigning the improvement to the model, the harness, or their interaction. Changing both at once prevents that inference. The announcement also notes differences between research configurations and production experiences. [S01](sources.md#s01)

### Stronger evidence that the surrounding system matters

A separate OpenAI report is more directly useful to the harness thesis. On the ARC-AGI-3 public task set, the report gives GPT-5.6 Sol a Relative Human Action Efficiency score of 13.3 with the official harness and 38.3 with a Responses API harness that retains reasoning and uses compaction. The named model stays the same while context handling changes. [S06](sources.md#s06)

This supports a specific conclusion: a model's measured behavior can depend substantially on the way a harness preserves useful state across actions.

It does not establish that every harness intervention matters equally. The context changes are bundled; the report also notes token-versus-character accounting for the window limit. The result is vendor-reported, concerns a bounded game environment, and uses an efficiency metric rather than enterprise completion. It is not a result produced by this paper.

WorkArena provides a useful counterweight. Its tested browser-agent configurations did not benefit uniformly from extra coordinate capabilities or from retaining previous reasoning; memory could reinforce earlier errors. Those are different models, tasks, and context mechanisms from OpenAI's retained-reasoning experiment. The studies do not contradict each other. They contradict the assumption that adding more memory or more tools must always improve an agent. [S13](sources.md#s13)

There is a further lesson that cuts against an overly narrow computer-use thesis. In this experiment, actions return text representations of game frames. The evidence concerns continued interaction and memory; it does not establish that a desktop mouse or pixel-only interface is indispensable. [S06](sources.md#s06)

### Product and engineering evidence

OpenAI's harness-engineering case study describes exposing an application, DOM snapshots, screenshots, logs, and metrics to Codex. The useful mechanism is a feedback path: the agent can inspect what it is changing instead of relying on a description of what should have happened. The authors explicitly warn that their end-to-end workflow depends on the structure and tooling of their repository. [S04](sources.md#s04)

Current Codex documentation makes two other boundaries explicit. Computer-use permission is separate from operating-system permission and from file or shell controls. Managed configuration is also surface- and version-dependent: a command-network policy is not a universal control over native applications, connectors, MCP servers, and cloud execution. [S02](sources.md#s02) [S05](sources.md#s05)

These are reasons to engineer a system around the model, not reasons to assume the system already solves enterprise governance.

### What the research benchmarks add

Original OSWorld and WebArena make application interaction an empirical problem rather than a demonstration selected for a video. They provide tasks, controlled environments, action interfaces, and outcome evaluators. Their observation spaces are not uniformly pixel-only: accessibility information, HTML or structured browser actions can be part of the setup. BrowserGym makes those interface and experiment-management choices explicit. [S11](sources.md#s11) [S12](sources.md#s12) [S20](sources.md#s20)

WorkArena brings the question into enterprise software with 33 atomic task types on ServiceNow. WorkArena++ extends the setting to 341 workflows in two formulations, producing 682 tasks: explicit instructions in one formulation, and procedures that must be recovered from a knowledge base in the other. Its error analysis includes mistaken goals, invented actions, imagined progress, and repeated ineffective operations. Better pointing accuracy alone would not fix all of those failures. [S13](sources.md#s13) [S14](sources.md#s14)

OSWorld-MCP supplies more direct evidence for hybrid interfaces. Its cited revision studies 361 OSWorld-derived tasks with 158 curated application tools, comparing GUI-only and GUI-plus-MCP configurations. Under its GUI-Owl setup, with 15/50-step limits and three runs per configuration, adding structured tools generally improves completion and reduces action counts. [S15](sources.md#s15)

That is stronger than a purely conceptual argument for hybrid access, but narrower than an enterprise product claim. There is no API-only arm in that comparison. Curated tool coverage is part of the experimental advantage. An API operation and a mouse click can consume one step each while doing very different amounts of work, so equal step budgets are not equal time or cost budgets.

The evaluators themselves also need scrutiny. OSWorld's maintainers document repairs involving ambiguous instructions, valid solutions rejected by graders, website changes, timing, and environment failures. A benchmark name is not a complete experimental specification. [S16](sources.md#s16)

In particular, revision 2 of the original OSWorld paper is not OSWorld 2.0. The original benchmark, OSWorld-Verified, and the OSWorld 2.0 setup cited by OpenAI must not be combined without establishing equivalence of tasks, grading, interfaces, and budgets. The original paper also permits fractional rewards; the distinction is not a simple old-binary versus new-partial split. [S11](sources.md#s11) [S16](sources.md#s16)

| Evidence | What it supports | What it cannot establish |
| --- | --- | --- |
| Same named model, changed context-handling setup | Harness choices can materially affect measured behavior in that setting | A general rule that harness quality outweighs model quality |
| New model plus new harness | The product stack is improving along multiple dimensions | The causal contribution of either change |
| A desktop computer-use manual | A documented interaction surface and its constraints | Universal availability or customer-specific authorization |
| An internal engineering case study | A concrete way to expose feedback and enforce constraints | A transferable productivity multiplier or market winner |
| Enterprise and hybrid-interface benchmarks | Controlled ways to test workflow structure, interface choice and failure modes | A customer's task mix, permission model or cost of operation |

## 5. The useful loop has more than a planner

The minimum interesting loop is not "think, click, repeat." It is:

```text
observe -> propose -> authorize -> act -> verify
   ^                                  |
   +------ bounded recovery ----------+
```

Observation must establish freshness and identity, not just capture more pixels. Proposal must name a bounded action. Authorization must be enforced outside the model's discretion. Verification must evaluate a postcondition rather than reward a plausible narrative.

The screen is an observation of a system, not the system's full state. A screenshot can remain unchanged while a server-side record changes, and a page can change locally before a remote write succeeds. The harness is operating under partial observability. More confident visual interpretation does not remove that fact.

This makes observation design an engineering problem in its own right. Capture the evidence relevant to the next decision, preserve stable identifiers where the interface exposes them, refresh after effects, and invalidate assumptions when the observed context changes. Sending the model a larger screenshot is not a substitute for knowing which state is authoritative.

![A proposed execution loop with an outcome contract, separate authority gate, multiple adapters, and bounded recovery.](../../site/research/assets/01-execution-loop.svg)

*Figure 2. Proposed reference architecture. Arrows describe responsibilities, not a claim that Agent Spark already implements a production runtime.*

### State worth preserving

A long-running task needs a durable record of its target, authorized scope, completed actions, receipts, failed attempts, and unresolved questions. Without that state, a resumed agent can repeat an effect or reason from an obsolete observation.

This does not require exposing a model's private reasoning. Persist the operational facts a reviewer can use. Use supported model-context mechanisms where available, but do not make an audit depend on obtaining an internal thought transcript.

The important separation is between task state and conversation history. A transcript can contain an earlier instruction to proceed, a later correction, and an invalidated approval. A task-state record must make the current decision unambiguous.

### Approval worth asking for

"May I continue?" is a weak approval request. A useful request identifies the actor, application, target record, intended change, and relevant state revision. It also says what will not happen.

For the invoice example, a reviewer first authorizes attaching one identified receipt to one invoice. That does not authorize clearing the hold, paying the invoice, changing bank details, or continuing after the receipt or target changes. Clearing the review hold requires a separate approval.

A practical contract binds consent to the proposed effect, expires or invalidates it when its assumptions change, and records consumption. Where a remote system offers idempotency keys, use them. Where it does not, a retry must first determine whether the earlier attempt already took effect. A checkpoint is not a guarantee of exactly-once execution.

There is a material distinction between a model choosing to ask and a system requiring permission. Microsoft's computer-use FAQ explicitly warns that model-triggered supervision is probabilistic and not a guaranteed fail-safe. OWASP's excessive-agency guidance places authorization in downstream controls rather than in an LLM's judgment. [S24](sources.md#s24) [S26](sources.md#s26)

### Verification worth believing

A toast saying "Saved" is weak evidence. Reading the persisted target field is stronger. An independent receipt or audit record can be stronger still, depending on the system and task.

Independence is not absolute. Two screens can share the same stale cache. A model can repeat its own mistaken interpretation while acting as its own evaluator. The verifier should use the strongest available source of truth and state when that source is unavailable.

If the only available evidence is a visual readback, say so. Do not silently promote it to database-level certainty.

### Recovery with a stopping rule

When a postcondition fails, the next action should usually be another observation, not another click at the same coordinates. The agent may be in the wrong window, the record may have changed, or the first operation may have succeeded while its receipt was delayed.

Recovery needs an action budget, a time or cost budget where relevant, and a rule for escalating uncertainty. Some failures call for stopping immediately. A permission denial is not an invitation to find another interface.

## 6. Why the GUI changes both reach and risk

Computer use is attractive because software already has interfaces for people. It can provide an action path without waiting for a new connector or a complete API integration.

But that path inherits the ambiguities of human interfaces. Names may be truncated. Multiple records may look similar. A modal may obscure context. A browser tab may retain an account different from the one the user intended. A signed-in session can expose more authority than the task requires.

The safety boundary therefore cannot be just a sentence in a prompt.

The model should treat documents, pages, screenshots, emails, and tool output as evidence about the task, not as sources entitled to rewrite the task's permissions. A note saying "ignore the approval step" remains a note. It must not become policy merely because the agent encountered it during a legitimate workflow.

The adapter also matters. The security properties of a shell sandbox do not automatically apply to an authenticated browser, an MCP service, or a native desktop application. OpenAI's managed-configuration documentation makes this separation explicit. One allowlist cannot be assumed to cover every outbound path. [S05](sources.md#s05)

For deployment, the relevant questions include which identity the adapter uses, what records it can access, where screenshots and traces are retained, which applications are permitted, and how a human can stop the run. Logs can become a data leak if they indiscriminately preserve everything the agent saw.

A hybrid harness should never use computer use to bypass an API's authorization denial. "No supported API for this operation" and "this actor is forbidden to perform this operation" are different conditions. The first may justify an approved GUI route. The second requires a stop.

The executing identity deserves its own check. Microsoft's computer-use documentation describes maker-provided credentials as the default and warns that sharing an agent configured this way can let others act with the maker's access. The identity in the chat and the identity performing the operation cannot be assumed to be the same. Its action allowlist also does not prevent opening an unapproved surface; action restrictions are not equivalent to comprehensive network isolation. [S22](sources.md#s22)

## 7. Why Codex is informative, and what to build around it

Codex is useful evidence for this direction because it combines several mechanisms in one working experience: a model, tools, context management, environment feedback, and a way for users to steer ongoing work. Its technical account describes the loop; its engineering case study describes the additional work needed to make an application legible to that loop. [S03](sources.md#s03) [S04](sources.md#s04)

Current desktop computer-use documentation adds visual application interaction to that picture. It describes macOS and Windows support subject to availability, requires permissions, and recommends structured integrations where they are suitable. It also documents operating-system differences, including foreground control on Windows. [S02](sources.md#s02)

This direction is not exclusive to Codex. Copilot Studio documents harnesses, file creation and editing, and computer use. The configuration boundaries matter more than assembling a long feature list.

| Documented surface | Relevant capability | Boundary that must travel with the claim |
| --- | --- | --- |
| Codex desktop computer use | Visual application interaction on supported macOS and Windows configurations | Availability, OS permissions, app approvals, and client-specific controls apply |
| Copilot Studio standard-harness computer use | Windows web and desktop interaction through virtual mouse and keyboard | The referenced computer-use documentation is explicitly scoped to the standard harness |
| Copilot Studio GitHub Copilot harness | Model/tool orchestration and documented file creation and editing | Do not import features from another harness into this configuration without evidence |

The Microsoft execution guide distinguishes a hosted browser, Cloud PC pools, and customer-managed Windows machines. The hosted-browser and Cloud-PC-pool sections have preview notices. In particular, the hosted browser is not recommended for production and does not support the enterprise-resource access or custom desktop applications a reader might assume from the phrase "computer use." These restrictions are mode-specific, not a statement about every customer-managed machine. [S21](sources.md#s21) [S22](sources.md#s22) [S23](sources.md#s23)

The inference is not that every enterprise should rebuild Codex.

Building a general model-tool loop, a desktop-control layer, a context system, and an approval mechanism is a substantial undertaking. If an existing supported harness fits the task, a team may gain more by building the domain-specific outcome contract and evidence layer around it.

For an enterprise product, that layer includes the meaning of a resolved invoice exception, the authority of its reviewer, the handling of an uncertain receipt, the trace that an auditor needs, and the procedure when the application changes. Those are different problems from locating a button.

The long-term product hypothesis is that reusable outcome contracts become more valuable as interface access improves. An organization would be able to move a workflow between supported execution systems without losing its approval semantics, success criteria, or evidence requirements. That is a direction to investigate, not an interoperability standard that exists in this repository.

There is another possible progression. A visual agent can help explore an authorized workflow that is poorly documented. Once a recurring path is understood, the team may turn its stable parts into a tested structured integration or deterministic routine, while preserving visual handling for genuine exceptions. The GUI is then a bridge to previously inaccessible work, not a requirement to repeat every operation at the lowest available level of abstraction.

That progression is a hypothesis too. It must respect the application's supported usage and authorization rules. A screen recording alone does not establish a reusable, correct automation, and the cost of maintaining the resulting routine belongs in the product's economics.

A specialist chatbot can still be the right product when the task ends with an answer. A deterministic workflow can be the right product when the process is stable and completely specified. A supported API integration can be the right product when it covers the required operations. Use the extra flexibility of a model-driven visual loop where it solves a measured problem.

## 8. The AGI claim needs a narrower definition

"Agentic AGI" is not a testable requirement until generality, autonomy, task distribution, and success criteria are specified.

There are at least three different propositions:

1. An agent must affect some environment to perform an action task.
2. A broadly useful digital agent needs access to a sufficiently broad set of software operations.
3. General intelligence is possible only if the system operates graphical user interfaces.

The first is part of the working definition of agency used here. The second is a plausible engineering requirement for broad digital task coverage. The third does not follow from either.

An environment can expose structured actions and observations. A general-purpose system might operate it without rendering a desktop. Conversely, a system can be excellent at clicking through familiar applications while remaining weak at unfamiliar reasoning, learning, or transferring knowledge across domains.

Legg and Hutter's proposed formalization of intelligence uses abstract action, observation, and reward channels across environments; it does not privilege a graphical interface. This is useful conceptual discipline, not an agreed operational test for AGI. METR's long-software-task research also studies extended action through Python and Bash rather than pixel interfaces. That demonstrates a way to study long-horizon agency without a GUI, not that those systems possess AGI. [S19](sources.md#s19) [S18](sources.md#s18)

There is one narrow necessity argument. If a required task has an authorized operation available only through a GUI, then a system claiming to complete that task must have a way to use that GUI, directly or through an authorized intermediary. That is a statement about the task's action surface. It is not a proof about the necessary architecture of intelligence.

The ARC-AGI-3 harness comparison is particularly useful here. It provides evidence for persistent interaction with an environment while returning text representations of game frames. It supports taking the loop seriously without proving that pixel-level computer use is the indispensable ingredient. [S06](sources.md#s06)

Nor does a high score on a benchmark with "AGI" in its name settle the larger question. The benchmark's task distribution and scoring rule remain the scope of the result.

Interaction should not be conflated with learning either. A frozen model can adapt its next action using observations and retained task state without changing its parameters. A successful feedback loop is not, by itself, evidence of persistent learning, improved generalization to unseen task families, or self-improvement of the model.

The position of this paper is therefore explicit: the cited evidence does not establish GUI computer use as necessary or sufficient for AGI. The practical enterprise argument does not need that claim to be interesting.

## 9. Enterprise examples with observable endings

These examples are synthetic design scenarios. They are not customer deployments, measurements, or demonstrations of current model performance.

| Workflow | Why computer use may matter | Preferred structured surface | Required end evidence | Human boundary |
| --- | --- | --- | --- | --- |
| Invoice exception triage | Receipt attachment exists only in a legacy portal | Invoice and purchase-order reads; review-hold updates where supported | Accepted receipt attached to the correct invoice; review hold cleared; still unpaid | Approve each write; no payment or bank-detail change |
| Cross-application onboarding | A required setup step exists only in an older administrative UI | Identity and ticketing APIs for supported steps | Authorized account state, assigned role and a complete task record | Privileged roles and access expansion remain explicit decisions |
| Browser-only supplier record maintenance | An approved field is maintained through a partner portal | Supported system-of-record reads and validation | Saved field, target identity, and readback evidence | Review consequential changes; a missing integration grants no new rights |
| GUI bug reproduction and repair | The defect appears only in a rendered application or desktop flow | Repository tools, tests, logs and metrics | Original failing flow, scoped fix, and the same flow passing afterward | No production deployment or unrelated refactor without authorization |

The last example explains part of the appeal of coding agents with visual access. A tool that can edit code but cannot inspect the resulting interface has a missing feedback channel. A tool that can see the UI but cannot inspect logs or tests has a different missing channel. The engineering case for a hybrid system is to connect the relevant evidence, not to replace every structured observation with pixels. [S04](sources.md#s04)

Intended-use restrictions still apply. Microsoft's computer-use FAQ excludes making financial transactions. The invoice illustration concerns synthetic exception handling, review metadata, and evidence; it is not a proposal to use that tool to execute payments. Approval is necessary for some actions, but it cannot make a provider-excluded use acceptable by itself. [S24](sources.md#s24)

### Worked example: the receipt that was not actually saved

The task contract identifies one invoice and permits attaching its accepted receipt, then clearing its review hold. The agent reads the invoice and receipt context through a structured adapter; attachment requires the legacy portal.

The vendor note is task data. If it includes instructions to bypass review, those instructions have no authority. If the actor lacks permission to attach a receipt, the run stops even if a button is visible.

The harness prepares a specific receipt-attachment action and requests approval. Before execution it checks that the target and relevant state still match the approved proposal. If they changed, it invalidates the old approval.

After the approved attachment attempt, the UI displays a success message. The persisted receipt link is still absent. The run must not clear the review hold or report completion.

A bounded recovery step re-reads the target and decides whether another attempt is safe. If the earlier effect cannot be distinguished from a delayed update, the system escalates instead of risking a duplicate operation. Its final response reports the uncertainty rather than rewriting the trace into a success story.

Only a verified attachment allows the next separately approved step: clear the review hold without paying the invoice.

This is what the accompanying local lab is designed to teach. It uses scripted proposals and synthetic state. Its screen adapter is simulated; it performs no real browser automation, model inference, or enterprise operation. The local mechanics are inspectable, but they are not evidence of a model's ability to perform the example in a real ERP. See the [lab guide](lab.md).

## 10. A study that could prove this wrong

A serious version of the thesis needs a study that can produce an inconvenient answer.

Comparing an old model in a minimal harness with a new model in a richly engineered harness is not enough. Neither is giving an API-only arm tasks deliberately inaccessible through its APIs and calling the difference superior intelligence.

![A proposed factorial study separating model snapshots, harness variants and interface access, with independent outcome assessment.](../../site/research/assets/04-factorial-study.svg)

*Figure 3. Proposed study, not results. Fix the authority boundary and vary the factors whose contributions the study is meant to identify.*

### Separate reach from competence

Construct a declared task mix containing API-complete, UI-only, and cross-application workflows. Include controlled perturbations such as stale records, permission denials, misleading document content, and saves that do not persist.

Run API-only, GUI-only, and hybrid configurations against paired instances. Report two views: performance on the whole intended task mix, and performance on the subset all compared configurations can legitimately reach.

The first measures operational coverage. The second helps distinguish execution competence from an engineered access advantage. Unsupported tasks, policy stops, execution failures, and completed outcomes must remain separate categories.

Report completion of permitted, feasible tasks separately from correct stops or escalations on inadmissible tasks. A refusal must not masquerade as completed business work, and an unauthorized completion must not count as success.

### Separate model capability from harness behavior

Cross at least two pinned model snapshots with a baseline and a recovery-aware harness. Keep mandatory authorization controls identical. It is not appropriate to remove required approval or access controls merely to make a production comparison cleaner.

Declare what each configuration can observe. A supposedly pixel-only system should not quietly receive hidden DOM text or database state. An API configuration should not receive evaluator answers through a convenient field. Record tool versions, screen resolution where relevant, context policy, budgets, and retry limits.

Use paired task instances and randomize execution order. Hold out task templates as well as record values; memorizing a form with new names is weaker evidence than transferring to a new workflow. Repeat tasks to examine consistency, but do not count several seeds of the same task as several independent tasks. Estimate variation in a pilot before choosing the main study's sample size and repetition count. Report uncertainty clustered at the task or task-template level appropriate to the sampling design, and publish negative results.

Separate a screenshot-and-coordinate GUI arm from a DOM/accessibility-assisted sensitivity arm. Otherwise "computer use" hides a material difference in the information supplied to the agent. Keep inference and wall-time budgets comparable and report action counts separately; a single application-level tool call is not equivalent work to a single click. [S15](sources.md#s15) [S20](sources.md#s20)

For repeated-run reliability, tau-bench distinguishes `pass^k`, where all k trials must succeed, from `pass@k`, where at least one succeeds. Select a metric that matches the deployment question instead of reporting the more flattering one. Approval-path compliance still requires its own assessment. [S17](sources.md#s17)

The evaluator should assess final state separately from the agent's completion narrative. If a model judge is used for a subjective criterion, disclose it and assess disagreements against human review. For record-changing tasks, prefer an independently inspectable state predicate where the test environment supports one.

### Measure the cost of accepted work

Task success alone is insufficient when a human spends longer reviewing the run than doing the work.

```text
cost per accepted outcome =
    total execution, review, recovery and amortized maintenance cost
    divided by the number of authorized, independently accepted outcomes
```

Include failed runs in the numerator. Declare the amortization assumptions. If there are no accepted outcomes, report the ratio as undefined rather than hiding the failure behind a convenient denominator.

Also report active human review minutes, latency distributions, duplicate effects, false-positive completion claims, prohibited-action attempts, unauthorized effects, and failure severity. Policy constraints remain constraints; cheap execution does not compensate for violating them.

| Hypothesis | Controlled comparison | What would reject or materially weaken it |
| --- | --- | --- |
| H1: Hybrid access improves verified completion on a heterogeneous task mix | Same model and harness; API-only versus hybrid | Added reach is irrelevant to the actual task mix, or GUI failures erase its benefit |
| H2: Postcondition-aware recovery improves reliability under perturbation | Same model and interface; two policy-compliant harness variants | Recovery adds duplicate effects or supervision cost without improving accepted outcomes |
| H3: Model and harness choices have separable or interacting effects | Cross pinned model snapshots with harness variants | The harness effect is negligible at the chosen precision or disappears with a stronger model |
| H4: Outcome contracts and evidence reduce total human handling cost | Candidate system versus a documented human-assisted baseline | Review, exception handling, and maintenance cost exceed the value of the work |

The machine-readable [hypothesis register](hypotheses.json) contains these proposed comparisons. Its results field is deliberately null.

### Why step accuracy is not workflow reliability

Under a deliberately simplified model, if every one of 20 required steps independently succeeds with probability 0.95 and there is no recovery, all 20 succeed with probability `0.95^20`, about 35.8%.

Real agent errors are not independent, equally difficult, or necessarily terminal. The calculation is an intuition aid, not an estimate of any product. Correlated errors can make the result worse; effective recovery can change it substantially. That is exactly why end-to-end outcome measurement matters.

## 11. What this means for Agent Spark

Agent Spark began with reviewed, versioned starting content for Copilot Studio. In the inspected August 2026 snapshot, it has a knowledge-assistant template, a reusable skill, four schemas, and static validation and generation-proof scripts. The proposed `agentspark` CLI and runtime adapters are not implemented. [S07](sources.md#s07)

That starting point is relevant because a harness needs more than tools. It needs decisions written in a form that can be inspected: scope, knowledge boundaries, allowed effects, evaluation expectations, and the target of deployment.

The template itself preserves an important distinction. Its compatibility flag remains false where broad OS and harness claims exceed the reported evidence. Its comments distinguish successful delivery of instructions from proof that an agent behaves correctly. [S08](sources.md#s08)

The repository reports a version-bound round trip in which instruction content arrived at a server-side draft with a matching hash. This paper did not rerun that experiment. Even taken as reported, it establishes a delivery observation, not correct conversations, safe actions, or customer value. [S09](sources.md#s09)

![Artifact conformance, generation correctness, platform delivery, behavioral performance and operational value require different evidence.](../../site/research/assets/03-evidence-ladder.svg)

*Figure 4. Five evidence levels. A schema-valid declaration is not the mechanism that enforces the declared policy.*

A useful extension would attach an outcome contract to each executable scenario: target identity, authorized operations, observation requirements, approval semantics, success predicates, recovery limits, and evidence requirements. A harness adapter would have to demonstrate how it implements that contract using supported platform interfaces.

This is a proposed direction. It does not mean a JSON file grants rights or makes all adapters equivalent.

Nor is plan-first execution a new invention. Terraform's plan/apply workflow is established prior art, including a warning that intervening target-state changes can make an earlier speculative plan stale. An agent's uncertain future trajectory is not equivalent to a saved infrastructure plan, but the review-before-effect principle is useful. [S27](sources.md#s27)

It also introduces a design tension. Agent Spark's accepted plan-first ADR explicitly trades adaptive execution for predictability. A general agent often needs to choose its next step after observing an unexpected state. This paper proposes a reviewed envelope with bounded adaptation inside it and renewed authorization at consequential transitions. Implementing that change would require a separate design decision; the research notebook does not silently amend the existing ADR. [S10](sources.md#s10)

The local lab is a deliberately smaller contribution. It makes selected mechanics executable and reviewable without a model, live account, or desktop-control dependency. It is a teaching fixture, not a security boundary or a released agent framework.

## 12. Limits, counterarguments, and the next product decision

This is a targeted public-source review and position paper, not a systematic literature review. The model results cited here were produced by their respective authors, not independently reproduced for this work. Product documentation is a moving target, and feature availability must be rechecked for a particular client, region, and deployment.

NIST's Generative AI Profile gives this discipline a practical governance basis: share predeployment evidence with people who can approve release, avoid extrapolation from narrow or anecdotal assessments, and revisit the reasons a deployment was originally considered safe. These are voluntary, context-dependent practices, not a certification supplied by a manifest or by this paper. [S25](sources.md#s25)

Long-horizon results need similar care. METR's horizon is based on the human task duration associated with a specified agent success probability. It is not the duration an agent can run autonomously, nor a guarantee on a live workflow. The paper discusses messier tasks, dynamic environments, other actors, and missing automatic graders as limits on external validity. [S18](sources.md#s18)

The computer-use thesis can fail commercially even if the technical capability improves. Supported APIs may already cover the valuable work. A stable workflow may be cheaper to automate deterministically. A customer may prohibit desktop access. UI maintenance, supervision, licensing, or data-handling requirements may eliminate the expected saving. The distribution of actual work matters more than the novelty of the interface.

There is also a risk in creating a general-purpose harness too early. A broad wrapper can hide the difficult domain decisions without solving them. A narrower product with a well-specified outcome, a trustworthy evidence path, and a manageable exception queue may be more valuable.

The recommended next step for Agent Spark is therefore a bounded experiment, not an AGI declaration: select one authorized workflow, define its accepted outcome, compare structured and visual routes, and measure the work left for people.

An implementation path can stay equally bounded. Begin with the local fixture to inspect the control contract. Move to a disposable test application with real observations and a supported model-backed harness. Establish a read-only baseline before enabling a single reversible, explicitly approved write. Only then evaluate a scoped pilot with the relevant platform, data, and business owners. The present repository completes the teaching-fixture stage, not those later stages.

Computer use is important because it can expand the work an agent can reach. The harness is important because reaching a control is not the same as using it correctly. The enterprise product is the system that can connect those capabilities to a verified outcome and remain accountable when it cannot.

## References and evidence notes

Every source label links to an annotated entry in the [source register](sources.md), including the original public URL and its limitations. The [machine-readable register](sources.json) records the evidence type for each source. The original paper Markdown, browser reading copy, figures, and local lab are maintained together so the argument and the artifact can be reviewed in the same change.

<!-- bibliography:start -->

### S01

**GPT-6 Astra: A new generation of intelligence.** OpenAI. 2026 announcement; accessed 7 September 2026 (8 September UTC). Vendor measurement.

<https://openai.com/index/gpt-6-astra/>

### S02

**Computer Use.** OpenAI developer documentation. Living documentation, accessed 7 September 2026. Product documentation.

<https://developers.openai.com/codex/computer-use>

### S03

**Unrolling the Codex agent loop.** OpenAI. 2026 technical article, accessed 7 September 2026. Technical explanation.

<https://openai.com/index/unrolling-the-codex-agent-loop/>

### S04

**Harness engineering: leveraging Codex in an agent-first world.** OpenAI. 2026 case study, accessed 7 September 2026. Vendor case study.

<https://openai.com/index/harness-engineering/>

### S05

**Managed configuration.** OpenAI developer documentation. Living documentation, accessed 7 September 2026. Product documentation.

<https://developers.openai.com/codex/enterprise/managed-configuration>

### S06

**How enabling two settings tripled our scores on the ARC-AGI-3 benchmark.** OpenAI. 2026 experiment report, accessed 7 September 2026. Vendor measurement.

<https://openai.com/index/how-two-settings-tripled-our-arc-agi-3-scores/>

### S07

**Agent Spark repository snapshot.** Ragnar Pitla / Agent Spark. Commit 0fa8c409a9ed79850b0159fca864ef0ac18e5dd1, 25 August 2026; inspected 7 September 2026. Artifact inspection.

<https://github.com/RagnarPitla/Agent-Spark/tree/0fa8c409a9ed79850b0159fca864ef0ac18e5dd1>

### S08

**Knowledge Assistant template manifest.** Ragnar Pitla / Agent Spark. Pinned 25 August 2026 snapshot; inspected 7 September 2026. Artifact inspection.

<https://github.com/RagnarPitla/Agent-Spark/blob/0fa8c409a9ed79850b0159fca864ef0ac18e5dd1/templates/knowledge-assistant/template.yaml>

### S09

**Agent Spark compatibility observations.** Ragnar Pitla / Agent Spark. Reports observations from 25 August 2026 with PAC 2.11.2 on macOS. Repository-reported observation.

<https://github.com/RagnarPitla/Agent-Spark/blob/0fa8c409a9ed79850b0159fca864ef0ac18e5dd1/docs/compatibility.md>

### S10

**ADR-0003: Separate planning from execution.** Ragnar Pitla / Agent Spark. Accepted design decision dated 24 August 2026, in the pinned snapshot. Design proposal.

<https://github.com/RagnarPitla/Agent-Spark/blob/0fa8c409a9ed79850b0159fca864ef0ac18e5dd1/docs/adr/0003-plan-first-execution.md>

### S11

**OSWorld: Benchmarking Multimodal Agents for Open-Ended Tasks in Real Computer Environments.** Tianbao Xie et al.; NeurIPS 2024, Datasets and Benchmarks. Original OSWorld paper, arXiv revision 2, 30 May 2024; accessed 7 September 2026. Research paper.

<https://arxiv.org/html/2404.07972v2>

### S12

**WebArena: A Realistic Web Environment for Building Autonomous Agents.** Shuyan Zhou et al.; ICLR 2024. ArXiv revision 4, 16 April 2024; accessed 7 September 2026. Research paper.

<https://arxiv.org/html/2307.13854v4>

### S13

**WorkArena: How Capable are Web Agents at Solving Common Knowledge Work Tasks?.** Alexandre Drouin et al.; ICML 2024, PMLR 235:11642-11662. 2024 proceedings; arXiv revision 5 also read, 23 July 2024. Research paper.

<https://proceedings.mlr.press/v235/drouin24a.html>

### S14

**WorkArena++: Towards Compositional Planning and Reasoning-based Common Knowledge Work Tasks.** Leo Boisvert et al.; NeurIPS 2024, Datasets and Benchmarks. ArXiv revision 2, 5 February 2025; accessed 7 September 2026. Research paper.

<https://arxiv.org/pdf/2407.05291v2>

### S15

**OSWorld-MCP: Benchmarking MCP Tool Invocation In Computer-Use Agents.** Hongrui Jia, Jitong Liao, Xi Zhang et al.; authors report ICLR 2026 acceptance. ArXiv revision 2, 11 November 2025; accessed 7 September 2026. Research paper.

<https://arxiv.org/html/2510.24563v2>

### S16

**OSWorld-Verified maintainer report.** OSWorld / xlang maintainers. Maintainer report, accessed 7 September 2026. Benchmark maintenance report.

<https://xlang.ai/blog/osworld-verified>

### S17

**tau-bench: A Benchmark for Tool-Agent-User Interaction in Real-World Domains.** Shunyu Yao, Noah Shinn, Pedram Razavi and Karthik Narasimhan; ICLR 2025. ArXiv revision 1, 17 June 2024; accessed 7 September 2026. Research paper.

<https://arxiv.org/html/2406.12045v1>

### S18

**Measuring AI Ability to Complete Long Software Tasks.** Thomas Kwa et al.; METR; NeurIPS 2025. ArXiv revision 4, 10 July 2026; accessed 7 September 2026. Research paper.

<https://arxiv.org/html/2503.14499v4>

### S19

**Universal Intelligence: A Definition of Machine Intelligence.** Shane Legg and Marcus Hutter; Minds & Machines 17(4), 391-444. 2007; arXiv revision 1, 20 December 2007. Theoretical paper.

<https://arxiv.org/html/0712.3329v1>

### S20

**The BrowserGym Ecosystem for Web Agent Research.** Thibault Le Sellier de Chezelles et al.; authors' publication entry identifies TMLR 2025. ArXiv revision 4, 28 February 2025; accessed 7 September 2026. Research paper.

<https://arxiv.org/html/2412.05467v4>

### S21

**Harnesses in Copilot Studio.** Microsoft Learn. Page updated 5 September 2026; accessed 7 September 2026. Product documentation.

<https://learn.microsoft.com/en-us/microsoft-copilot-studio/harnesses-overview>

### S22

**Automate web and desktop apps with computer use.** Microsoft Learn. Page updated 3 August 2026; accessed 7 September 2026. Product documentation.

<https://learn.microsoft.com/en-us/microsoft-copilot-studio/computer-use>

### S23

**Configure where computer use runs.** Microsoft Learn. Page updated 3 August 2026; accessed 7 September 2026. Product documentation.

<https://learn.microsoft.com/en-us/microsoft-copilot-studio/configure-where-computer-use-runs>

### S24

**FAQ for the computer use tool.** Microsoft Learn. Page updated 20 May 2026; accessed 7 September 2026. Product documentation.

<https://learn.microsoft.com/en-us/microsoft-copilot-studio/faqs-computer-use>

### S25

**Artificial Intelligence Risk Management Framework: Generative Artificial Intelligence Profile.** Chloe Autio et al.; NIST AI 600-1. Published 26 July 2024; accessed 7 September 2026. Risk-management guidance.

<https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.600-1.pdf>

### S26

**LLM06:2025 Excessive Agency.** OWASP GenAI Security Project. 2025 edition; public source pinned to commit 79c180515d6500c8a66627fa8343bd514c464380. Risk-management guidance.

<https://github.com/OWASP/www-project-top-10-for-large-language-model-applications/blob/79c180515d6500c8a66627fa8343bd514c464380/2_0_vulns/LLM06_ExcessiveAgency.md>

### S27

**Terraform CLI: plan command.** HashiCorp. Living documentation, accessed 7 September 2026. Technical documentation.

<https://developer.hashicorp.com/terraform/cli/commands/plan>

<!-- bibliography:end -->

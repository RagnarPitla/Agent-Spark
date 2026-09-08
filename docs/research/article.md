# An agent should finish the work, not narrate it

**Why computer-use harnesses matter, why APIs still belong, and why this is not an AGI proof**

Ragnar Pitla | Article draft | 7 September 2026

The invoice is still on hold.

The agent has written three excellent paragraphs explaining the receipt exception and which screens someone should open to resolve it.

For a question about procedure, that answer might be the product. For a request to do the work, it is a description of an outcome that has not happened.

That distinction is changing how I think about enterprise agents. The interesting unit is not another chat window. It is an execution loop that can inspect the relevant software, take an authorized action, and show that the intended state actually changed.

Computer use makes that loop more useful because it can reach software that a collection of APIs does not fully cover. But a model that can click is still a long way from a product that an enterprise can delegate work to.

## The model is not the whole agent

A model receives context and proposes an output. A harness decides what context it gets, which tools are available, how results return, what state persists, and when the task should stop.

OpenAI's technical account of the Codex agent loop describes this distinction directly. A model can request a tool call; the harness executes the permitted operation and returns the result for the next decision. The output of the process may be a changed file or application state, not merely the final message. [S03](sources.md#s03)

This is easy to miss when most interactions begin in a chat box. The chat is the control surface. The work can be happening somewhere else.

A useful enterprise harness has to connect that work back to a definition of completion. "I clicked Save" describes an action. "The intended field on the intended record now has the approved value" describes an outcome.

Those are different products.

## There is concrete evidence that the harness matters

One of the most useful recent examples does not require an argument about which model is smartest.

OpenAI reports that the same named GPT-5.6 Sol model scored 13.3 on the ARC-AGI-3 public set with the official harness and 38.3 with a Responses API harness that retained reasoning and used compaction. These are Relative Human Action Efficiency scores, not percentages of enterprise workflows completed. [S06](sources.md#s06)

The mechanism is understandable. A system that repeatedly loses useful context has to reconstruct its situation. A system that preserves what it learned can make a more informed next move.

There are limits to the comparison. It is vendor-reported. The context changes were bundled, and the report also discusses different window accounting. It does not establish that every better-looking harness produces the same improvement.

But it does establish a reason to stop discussing an agent as though its behavior were a property of the model alone.

The opposite warning matters too. WorkArena's browser-agent ablations did not improve uniformly when extra coordinate capabilities or previous reasoning were added; retained mistakes could make a run worse. These are different tasks and memory mechanisms from OpenAI's experiment. Together, they argue for measuring the model-harness combination, not assuming that more scaffolding is better. [S13](sources.md#s13)

The GPT-6 Astra announcement strengthens the relevance of that distinction. OpenAI describes improvements to the model and a separate speed update to the Codex harness. Its OSWorld 2.0 comparison uses an offline set and partial scoring. We should keep those qualifications attached to the numbers rather than turn them into a claim that enterprise automation is solved. [S01](sources.md#s01)

When both model and harness change, a better product result does not tell us which change caused how much of the gain.

## Computer use closes an interface gap

Take a synthetic invoice workflow.

The invoice and purchase order can be read through an API. An accepted receipt can only be attached through a legacy portal. The API can clear the review hold, but that step is not permitted until the receipt is attached.

An API-only agent can inspect the record and then get stuck. A computer-use agent may be able to perform both writes through the interface. A hybrid system can use structured reads, the GUI for receipt attachment, and the API for the hold update. Each write still needs its own approval.

![A synthetic invoice workflow using API-only, GUI-only and hybrid routes.](../../site/research/assets/02-interface-routing.svg)

This is the strongest practical case for computer use: existing software already exposes controls for people. An agent may be able to use those controls without waiting for a new integration.

The word "may" is doing real work. The interface must be accessible, the operation permitted, the target identifiable, and the result verifiable. Computer use does not remove those requirements.

This example concerns review state, not payment execution. Microsoft's computer-use FAQ excludes making financial transactions; an approval prompt cannot waive that intended-use restriction. [S24](sources.md#s24)

It also does not make APIs obsolete. A supported API can expose a record identifier, structured fields, a state version, and a receipt. That is often a better action contract than a button beside a truncated label.

OpenAI's own computer-use documentation recommends a dedicated plugin or MCP server for repeatable data operations when one is available. The best computer-using agent should know when not to click. [S02](sources.md#s02)

There is research behind that direction. OSWorld-MCP compares GUI-only and GUI-plus-MCP configurations, finding benefits from structured tools in its tested setup. It does not compare API-only with hybrid, and its action budgets are not a customer cost model. Still, it gives us a better starting question than "Are pixels the future?" The question is which interface makes this particular operation reliable and economical. [S15](sources.md#s15)

## The loop needs a brake and a receipt

The architecture I would build around is simple to draw:

```text
observe -> propose -> authorize -> act -> verify
```

The hard part is making each word mean something.

Observe the right application, account, record, and current state. Propose a bounded change. Authorize that specific effect. Perform it through an appropriate interface. Read the result from the strongest available source of truth.

![A controlled execution loop with an authority gate, multiple adapters and bounded recovery.](../../site/research/assets/01-execution-loop.svg)

Now add the part that demos tend to skip.

The screen says "Saved," but the invoice status did not change. The agent must not report completion.

A colleague changed the record after approval. The old approval must not silently authorize a different action.

A note on the page tells the agent to bypass review. The note is task data, not a new source of authority.

The API denies access. The agent must not interpret that as a suggestion to try the browser with broader permissions.

A retry might duplicate an earlier effect. The system needs to inspect what happened before trying again.

These cases are not decorative guardrails around the product. They are part of the product.

The tau-bench authors make the distinction unusually concrete: an agent can receive a successful final-state reward even when it skipped a required confirmation. The right result is not proof of an approved path. [S17](sources.md#s17)

Current Codex documentation also makes clear that the controls differ across surfaces. A file or shell sandbox is not a promise that every browser, native app, connector, and remote tool operates inside the same boundary. Enterprise configuration has to account for the actual route being used. [S02](sources.md#s02) [S05](sources.md#s05)

Microsoft's computer-use FAQ states the approval problem even more directly: model-triggered supervision is probabilistic, not a guaranteed safety gate. "The agent usually asks" is not equivalent to "this action cannot occur without approval." [S24](sources.md#s24)

## Why Codex is an instructive example

The interesting part of Codex is the combination.

In OpenAI's harness-engineering case study, agents can inspect an application, use browser structure and screenshots, query logs and metrics, make a change, and inspect the application again. Engineers made the environment legible to the agent and enforced important constraints mechanically. [S04](sources.md#s04)

A coding agent that cannot see the interface it changed has a missing feedback channel. A visual agent that cannot inspect the underlying errors has another. Connecting those channels can matter more than presenting the same model through another branded chat experience.

That does not mean every company should build its own general-purpose runtime.

It is not a Codex-only direction either. Copilot Studio already documents harnesses and computer use. Its computer-use guide is scoped to the standard harness, and its execution modes have different prerequisites and preview restrictions. An enterprise comparison should name the actual configuration instead of treating either product as one unlimited capability. [S21](sources.md#s21) [S22](sources.md#s22) [S23](sources.md#s23)

An existing supported harness may already provide enough of the loop. The valuable engineering may be the workflow-specific layer: which receipt belongs to this invoice, who can approve the change, what evidence must be retained, and what happens when the result is uncertain.

That is a more demanding product than a prompt wrapper. It is also a more defensible one.

## The AGI argument goes further than the evidence

There is an understandable leap from "this can operate my software" to "this is what general intelligence has been missing."

I would separate those claims.

An agent doing an action task has to affect some environment. A broadly useful digital agent needs access to many kinds of operations. Neither proposition proves that general intelligence requires a graphical desktop.

An environment can expose structured actions. A system can learn through interaction without using a mouse. Conversely, a system can be good at familiar interfaces without being generally intelligent.

METR's work on long software tasks studies agents primarily through Python and Bash. That is evidence that extended agency can be investigated without a pixel GUI, not evidence that the evaluated systems have AGI. [S18](sources.md#s18)

Even the ARC-AGI-3 harness result returns text representations of game frames. It is evidence that continuity and interaction matter. It is not evidence that pixel-level GUI use is the only path. [S06](sources.md#s06)

Computer use may be necessary for a particular task when the required operation is available only through an authorized GUI. That is a statement about access to the task, not a proof about the architecture of AGI.

The enterprise thesis is strong enough without making the larger claim.

## Build a study, not a victory chart

The next useful experiment is a paired comparison.

Take one bounded workflow family. Fix the model and permissions. Compare API-only, GUI-only, and hybrid access. Separate tasks every configuration can reach from tasks with an intentional interface gap.

Then vary the harness while keeping the model fixed. Does fresh-state verification and bounded recovery improve accepted outcomes? Or does it mostly create more waiting and review?

Finally, change the model while retaining those harness variants. That begins to separate model capability from the system built around it.

Measure the work left for people. Count active review time, failed runs, duplicate effects, uncertain outcomes, and maintenance. A task that succeeds after more human effort than doing it manually is not automatically a useful automation.

The thesis should be allowed to lose. If APIs already cover the valuable work, use them. If a deterministic workflow is cheaper and easier to maintain, use that. If desktop access is not acceptable in the customer's environment, the product has to respect that constraint.

## Where Agent Spark fits

Agent Spark started with a different but related question: which agent-building decisions should be reviewed once and reused instead of being improvised on every project?

The existing repository contains templates, a skill, schemas, and content checks. Its proposed CLI and production adapters are still unimplemented. The template itself distinguishes successful delivery from proof of correct behavior. [S07](sources.md#s07) [S08](sources.md#s08)

The research direction is to connect those reviewed decisions to an outcome contract that a supported harness can execute and an independent reviewer can assess.

The accompanying notebook contains the full paper, an annotated source register, original diagrams, and a local simulator of an invoice exception. The simulator has synthetic data, scripted decisions, no LLM, and no real computer control. It makes the mechanics inspectable; it does not claim to measure agent intelligence.

My working conclusion is narrower than "the best computer use wins."

For enterprises with fragmented software, the useful product may be the harness that can reach the necessary controls, respect the user's authority, recover from uncertainty, and prove the intended work happened at an acceptable cost.

The output is not the sentence "Done."

It is the right state, the right permission, and evidence that connects the two.

## Sources and further reading

Source labels link to the [annotated register](sources.md), which separates vendor measurements, documentation, academic evidence, and repository observations. The [white paper](whitepaper.md) contains the complete argument, proposed study, and limitations.

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

### S13

**WorkArena: How Capable are Web Agents at Solving Common Knowledge Work Tasks?.** Alexandre Drouin et al.; ICML 2024, PMLR 235:11642-11662. 2024 proceedings; arXiv revision 5 also read, 23 July 2024. Research paper.

<https://proceedings.mlr.press/v235/drouin24a.html>

### S15

**OSWorld-MCP: Benchmarking MCP Tool Invocation In Computer-Use Agents.** Hongrui Jia, Jitong Liao, Xi Zhang et al.; authors report ICLR 2026 acceptance. ArXiv revision 2, 11 November 2025; accessed 7 September 2026. Research paper.

<https://arxiv.org/html/2510.24563v2>

### S17

**tau-bench: A Benchmark for Tool-Agent-User Interaction in Real-World Domains.** Shunyu Yao, Noah Shinn, Pedram Razavi and Karthik Narasimhan; ICLR 2025. ArXiv revision 1, 17 June 2024; accessed 7 September 2026. Research paper.

<https://arxiv.org/html/2406.12045v1>

### S18

**Measuring AI Ability to Complete Long Software Tasks.** Thomas Kwa et al.; METR; NeurIPS 2025. ArXiv revision 4, 10 July 2026; accessed 7 September 2026. Research paper.

<https://arxiv.org/html/2503.14499v4>

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

<!-- bibliography:end -->

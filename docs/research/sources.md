# Source register

Public evidence reviewed 2026-09-07 (America/New_York; retrieval continued on 2026-09-08 UTC). Search results were discovery aids, not evidence. Sources below were read directly during this research pass. Vendor measurements, public documentation, academic benchmarks and repository observations are kept separate.

## S01

**GPT-6 Astra: A new generation of intelligence**

OpenAI. 2026 announcement; accessed 7 September 2026 (8 September UTC). Evidence type: Vendor measurement.

[Read the original source](https://openai.com/index/gpt-6-astra/)

Supports: The public model name is GPT-6 Astra, compared with GPT-5.6 Sol. OpenAI reports 72.6 versus 65.7 on OSWorld 2.0 v2026.08.08, offline set, partial score, and describes a separate Codex harness speed update. Its latency comparison is explicitly a simulation.

Limit: These are vendor-reported results under described research settings, not an independently reproduced enterprise deployment. Partial score is not the percentage of complete workflows. The simultaneous model and harness changes do not isolate either causal contribution. Maximum-effort scores and production behavior can differ.

## S02

**Computer Use**

OpenAI developer documentation. Living documentation, accessed 7 September 2026. Evidence type: Product documentation.

[Read the original source](https://developers.openai.com/codex/computer-use)

Supports: In supported regions, desktop Computer Use is documented for macOS and Windows in ChatGPT Work and Codex. It can operate graphical applications; the documentation prefers dedicated plugins or MCP servers for data access and repeatable operations when available. OS permissions, app approvals and workspace controls are distinct.

Limit: This describes desktop product surfaces, not automatic feature parity with every CLI, API, account or operating system. Windows operation uses the active desktop. Native-app changes may fall outside a project's review pane. App permission is not blanket permission for every consequential action.

## S03

**Unrolling the Codex agent loop**

OpenAI. 2026 technical article, accessed 7 September 2026. Evidence type: Technical explanation.

[Read the original source](https://openai.com/index/unrolling-the-codex-agent-loop/)

Supports: Codex orchestrates user input, model inference, tool calls, tool results and context management. Its output can be changed files rather than only an assistant message. This supplies a concrete working definition of a harness.

Limit: It is a dated implementation account. Specific API and context-management choices can change; the later Astra announcement describes further context changes. It is not evidence that all adapters share the same sandbox.

## S04

**Harness engineering: leveraging Codex in an agent-first world**

OpenAI. 2026 case study, accessed 7 September 2026. Evidence type: Vendor case study.

[Read the original source](https://openai.com/index/harness-engineering/)

Supports: The authors describe exposing a per-worktree application, DOM snapshots, screenshots, logs and metrics to Codex. They emphasize repository knowledge, mechanically enforced boundaries and feedback loops, and explicitly limit generalization beyond their engineered environment.

Limit: This is a self-reported internal-product case study, not a randomized productivity study. Its estimated speedup is not an established return on investment for other enterprises. It does not demonstrate that GUI use caused all of the reported benefit.

## S05

**Managed configuration**

OpenAI developer documentation. Living documentation, accessed 7 September 2026. Evidence type: Product documentation.

[Read the original source](https://developers.openai.com/codex/enterprise/managed-configuration)

Supports: Administrators can constrain supported browser and computer-use surfaces, including origins, native app identities and approvals. The document distinguishes command-network controls from browser checks and other tool traffic, and warns that supported requirements differ by client and version.

Limit: A configured allow rule does not install a plugin, grant OS permission, or replace action approval. A command proxy is not a universal egress or DLP boundary across native apps, MCP, cloud tools and connectors. Customer deployments require effective-policy testing.

## S06

**How enabling two settings tripled our scores on the ARC-AGI-3 benchmark**

OpenAI. 2026 experiment report, accessed 7 September 2026. Evidence type: Vendor measurement.

[Read the original source](https://openai.com/index/how-two-settings-tripled-our-arc-agi-3-scores/)

Supports: For the same named GPT-5.6 Sol model, OpenAI reports public-set ARC-AGI-3 Relative Human Action Efficiency scores of 13.3 with the official harness and 38.3 with a Responses API harness retaining reasoning and using compaction. The task returns text representations of game frames. The report illustrates dependence on context handling as well as the model.

Limit: The metric is action efficiency, not a percentage of enterprise workflows completed. This is a vendor comparison, not this paper's experiment. The two context changes are bundled, and the report also notes token-versus-character window accounting. It neither isolates all factors nor establishes desktop GUI use as necessary for intelligence.

## S07

**Agent Spark repository snapshot**

Ragnar Pitla / Agent Spark. Commit 0fa8c409a9ed79850b0159fca864ef0ac18e5dd1, 25 August 2026; inspected 7 September 2026. Evidence type: Artifact inspection.

[Read the original source](https://github.com/RagnarPitla/Agent-Spark/tree/0fa8c409a9ed79850b0159fca864ef0ac18e5dd1)

Supports: The inspected snapshot contains a scenario template, a skill, four JSON Schemas, validation and generation-proof scripts, and proposed CLI/package contracts. README, scripts/validate.mjs, scripts/proof-run.mjs and the manifests establish the boundary between content tooling and an unimplemented runtime.

Limit: Artifacts and executable static checks do not establish live model behavior or operational value. The public site is positioning, not an independent study. This paper does not promote a planned CLI to implemented status.

## S08

**Knowledge Assistant template manifest**

Ragnar Pitla / Agent Spark. Pinned 25 August 2026 snapshot; inspected 7 September 2026. Evidence type: Artifact inspection.

[Read the original source](https://github.com/RagnarPitla/Agent-Spark/blob/0fa8c409a9ed79850b0159fca864ef0ac18e5dd1/templates/knowledge-assistant/template.yaml)

Supports: The manifest declares eight variables, eight output files, pinned skill content, publishing disabled, ownership and provenance. compatibility.verified remains false because its OS and harness claims exceed the reported round trip; comments explicitly distinguish delivery from behavior.

Limit: A declaration of human confirmation is not a production approval mechanism. The template does not itself connect knowledge or prove that a model obeys its source restrictions.

## S09

**Agent Spark compatibility observations**

Ragnar Pitla / Agent Spark. Reports observations from 25 August 2026 with PAC 2.11.2 on macOS. Evidence type: Repository-reported observation.

[Read the original source](https://github.com/RagnarPitla/Agent-Spark/blob/0fa8c409a9ed79850b0159fca864ef0ac18e5dd1/docs/compatibility.md)

Supports: The repository reports that generated instruction content reached a server-side draft with an identical SHA-256, and that some tenant effects differed from local command-name expectations. This illustrates why delivery receipts, target identity and published state need separate observation.

Limit: These observations were not rerun for this paper. They concern a particular version and environment, are not proof of the current platform's universal behavior, and contain no behavioral or customer-ROI evaluation.

## S10

**ADR-0003: Separate planning from execution**

Ragnar Pitla / Agent Spark. Accepted design decision dated 24 August 2026, in the pinned snapshot. Evidence type: Design proposal.

[Read the original source](https://github.com/RagnarPitla/Agent-Spark/blob/0fa8c409a9ed79850b0159fca864ef0ac18e5dd1/docs/adr/0003-plan-first-execution.md)

Supports: The project proposes reviewable plans followed by execution, serializable changes and checkpoints. It explicitly trades adaptive execution for predictability. The paper uses it to discuss how bounded adaptation would need a separate design decision.

Limit: An accepted ADR is not implemented software. Checkpoints do not imply transaction rollback or exactly-once remote effects. The paper's adaptive-harness proposal does not silently amend this ADR.

## S11

**OSWorld: Benchmarking Multimodal Agents for Open-Ended Tasks in Real Computer Environments**

Tianbao Xie et al.; NeurIPS 2024, Datasets and Benchmarks. Original OSWorld paper, arXiv revision 2, 30 May 2024; accessed 7 September 2026. Evidence type: Research paper.

[Read the original source](https://arxiv.org/html/2404.07972v2)

Supports: The original benchmark studies desktop, browser, file and cross-application tasks in virtual machines, using task-specific state evaluators. It exposes grounding, application-knowledge and multistep difficulties. Observation variants include screenshots, accessibility trees and Set-of-Marks.

Limit: Revision 2 of this paper is not OSWorld 2.0. Its task set, grading and historical results must not be transferred to the Astra comparison. It is not inherently pixel-only, permits fractional rewards, and is not an enterprise field study. A screenshot-only future is an author conjecture, not a result established by the benchmark.

## S12

**WebArena: A Realistic Web Environment for Building Autonomous Agents**

Shuyan Zhou et al.; ICLR 2024. ArXiv revision 4, 16 April 2024; accessed 7 September 2026. Evidence type: Research paper.

[Read the original source](https://arxiv.org/html/2307.13854v4)

Supports: A resettable environment of realistic web applications connects natural-language intent to measurable state changes. It supports HTML, accessibility-tree and screenshot observations and element-targeted or coordinate actions. Its evaluation includes answer, URL and page-content checks.

Limit: Controlled replicas and curated intents do not measure live-site robustness or customer economics. Some semantic answer matching uses an LLM judge. Describing every evaluation as deterministic or every observation as visual would be inaccurate.

## S13

**WorkArena: How Capable are Web Agents at Solving Common Knowledge Work Tasks?**

Alexandre Drouin et al.; ICML 2024, PMLR 235:11642-11662. 2024 proceedings; arXiv revision 5 also read, 23 July 2024. Evidence type: Research paper.

[Read the original source](https://proceedings.mlr.press/v235/drouin24a.html)

Supports: WorkArena studies 33 atomic task types in ServiceNow, including forms, lists, knowledge, catalogs, dashboards and navigation. Its interface and memory ablations show that extra coordinate capabilities or retaining previous reasoning did not help uniformly in the tested configurations; memory could reinforce mistakes.

Limit: It is a platform-specific benchmark, not a customer study. The historical ablations do not prove that vision or memory is generally harmful, and should not be generalized to different 2026 models or context-retention mechanisms.

## S14

**WorkArena++: Towards Compositional Planning and Reasoning-based Common Knowledge Work Tasks**

Leo Boisvert et al.; NeurIPS 2024, Datasets and Benchmarks. ArXiv revision 2, 5 February 2025; accessed 7 September 2026. Evidence type: Research paper.

[Read the original source](https://arxiv.org/pdf/2407.05291v2)

Supports: The study presents 341 workflows in two formulations, yielding 682 tasks. One formulation provides explicit instructions; the other requires recovering a procedure from a knowledge base. Error analysis includes mistaken goals, invented actions, imagined progress and ineffective repetition.

Limit: The workflows and company procedures are curated on one platform. The onboarding example is a benchmark analogue, not proof of a cross-application customer deployment. Its historical scores are not current frontier-model performance claims.

## S15

**OSWorld-MCP: Benchmarking MCP Tool Invocation In Computer-Use Agents**

Hongrui Jia, Jitong Liao, Xi Zhang et al.; authors report ICLR 2026 acceptance. ArXiv revision 2, 11 November 2025; accessed 7 September 2026. Evidence type: Research paper.

[Read the original source](https://arxiv.org/html/2510.24563v2)

Supports: A study of 361 OSWorld-derived tasks and 158 curated application tools compares GUI-only with GUI-plus-MCP configurations. Under its GUI-Owl setup, 15/50-step limits and three runs per configuration, structured tools generally improve completion and reduce action counts. It is direct evidence for studying hybrid interfaces.

Limit: This is not an API-only versus hybrid comparison. Equal action budgets are not equal latency or cost budgets; curated tool coverage limits generalization. Tool Invocation Rate incorporates success into its definition, so its association with accuracy is not an independent causal result. The cited text is the arXiv revision; final proceedings were not independently inspected.

## S16

**OSWorld-Verified maintainer report**

OSWorld / xlang maintainers. Maintainer report, accessed 7 September 2026. Evidence type: Benchmark maintenance report.

[Read the original source](https://xlang.ai/blog/osworld-verified)

Supports: The maintainers document benchmark repairs involving ambiguous instructions, valid solutions rejected by evaluators, timing, websites and environment failures. The report motivates pinning tasks, graders and infrastructure instead of treating a benchmark name as a complete specification.

Limit: This report concerns repairs to the original OSWorld line. It does not establish the task set or configuration of OSWorld 2.0 v2026.08.08. Evidence of a grader defect is not proof that every model score is invalid.

## S17

**tau-bench: A Benchmark for Tool-Agent-User Interaction in Real-World Domains**

Shunyu Yao, Noah Shinn, Pedram Razavi and Karthik Narasimhan; ICLR 2025. ArXiv revision 1, 17 June 2024; accessed 7 September 2026. Evidence type: Research paper.

[Read the original source](https://arxiv.org/html/2406.12045v1)

Supports: Synthetic retail and airline tasks combine a simulated user, policies, API tools and mutable databases. The paper introduces pass^k for all-k-trials success and distinguishes it from pass@k. It explicitly notes that a successful final-state reward can conceal a policy violation such as acting without confirmation.

Limit: Correct final state does not establish a compliant action path. Simplified domains and an LLM user simulator limit realism. The paper also shows semantic and policy errors without a GUI; removing visual difficulty does not solve agency.

## S18

**Measuring AI Ability to Complete Long Software Tasks**

Thomas Kwa et al.; METR; NeurIPS 2025. ArXiv revision 4, 10 July 2026; accessed 7 September 2026. Evidence type: Research paper.

[Read the original source](https://arxiv.org/html/2503.14499v4)

Supports: The study evaluates model-plus-scaffold systems on software, cybersecurity and ML-engineering tasks, primarily through Python and Bash. It relates success probability to human task duration and discusses messier tasks, resource limits and external validity.

Limit: A time horizon is a fitted human-duration measure at a specified success probability, not autonomous wall-clock runtime. The result is not an enterprise reliability guarantee or proof of AGI. Dynamic, multi-actor workflows without automatic graders can differ materially.

## S19

**Universal Intelligence: A Definition of Machine Intelligence**

Shane Legg and Marcus Hutter; Minds & Machines 17(4), 391-444. 2007; arXiv revision 1, 20 December 2007. Evidence type: Theoretical paper.

[Read the original source](https://arxiv.org/html/0712.3329v1)

Supports: A proposed formalization models agents acting and receiving observations and rewards across environments. The communication channels are abstract rather than intrinsically graphical, helping separate environment interaction from one particular interface.

Limit: This is a theoretical proposal, not a universally accepted operational AGI test, a GUI requirement, or evidence that any deployed model meets the definition.

## S20

**The BrowserGym Ecosystem for Web Agent Research**

Thibault Le Sellier de Chezelles et al.; authors' publication entry identifies TMLR 2025. ArXiv revision 4, 28 February 2025; accessed 7 September 2026. Evidence type: Research paper.

[Read the original source](https://arxiv.org/html/2412.05467v4)

Supports: BrowserGym supplies a common environment and experiment-management system with DOM/accessibility data, screenshots, actions, errors and reproducibility tooling. It explains how observations, tools and scaffolds affect the evaluated system, and discusses drift, localization, bot detection and shared-state limitations.

Limit: Its comparison does not use visual inputs outside VisualWebArena; its tables must not all be described as vision-based evaluations. Some table entries are not newly executed runs. Publication status was checked against the authors' repository because the OpenReview page presented a browser challenge.

## S21

**Harnesses in Copilot Studio**

Microsoft Learn. Page updated 5 September 2026; accessed 7 September 2026. Evidence type: Product documentation.

[Read the original source](https://learn.microsoft.com/en-us/microsoft-copilot-studio/harnesses-overview)

Supports: Microsoft defines a harness as the runtime governing model calls, supplied context, interpretation and tool invocation. It documents different harnesses for different workloads, including file creation and editing for the GitHub Copilot harness.

Limit: Agents and harnesses are not competing categories; a harness powers an agent. Do not combine capabilities from different harnesses into an assumed universal runtime or infer geographic rollout or GA from a page-update date. This is documentation, not a performance audit.

## S22

**Automate web and desktop apps with computer use**

Microsoft Learn. Page updated 3 August 2026; accessed 7 September 2026. Evidence type: Product documentation.

[Read the original source](https://learn.microsoft.com/en-us/microsoft-copilot-studio/computer-use)

Supports: The page documents Windows GUI interaction with virtual mouse and keyboard, including applications without APIs, and explicitly scopes its computer-use features to the standard harness. It describes credentials, logs, screenshots, HTTPS enforcement and application/website action restrictions.

Limit: Maker-provided credentials are the documented default; sharing can expose the maker's execution authority. The action allowlist does not prevent opening an unapproved surface and is not a universal egress boundary. The documented controls and execution mode must be assessed for the actual deployment.

## S23

**Configure where computer use runs**

Microsoft Learn. Page updated 3 August 2026; accessed 7 September 2026. Evidence type: Product documentation.

[Read the original source](https://learn.microsoft.com/en-us/microsoft-copilot-studio/configure-where-computer-use-runs)

Supports: The page distinguishes hosted browser, Cloud PC pools and customer-managed Windows machines. Hosted-browser and Cloud-PC-pool sections carry preview notices, while customer-managed machines have their own registration and software prerequisites.

Limit: The hosted browser is not recommended for production and does not provide tenant Entra join, Intune management, enterprise-resource access or custom desktop applications. Those restrictions must not be transferred indiscriminately to every execution mode. The source does not establish universal geographic or tenant availability.

## S24

**FAQ for the computer use tool**

Microsoft Learn. Page updated 20 May 2026; accessed 7 September 2026. Evidence type: Product documentation.

[Read the original source](https://learn.microsoft.com/en-us/microsoft-copilot-studio/faqs-computer-use)

Supports: The FAQ describes a perception-reasoning-action loop and documents variable outcomes, timing and visual sensitivity, difficult controls, loops and prompt-injection risks. It explicitly warns that model-triggered supervision is probabilistic, not a guaranteed approval gate or safety fail-safe.

Limit: The FAQ excludes making financial transactions among intended uses. A human approval prompt does not erase that boundary. Its dated success figures lack enough experimental detail for a current ranking, enterprise guarantee or SLA; this paper does not use them.

## S25

**Artificial Intelligence Risk Management Framework: Generative Artificial Intelligence Profile**

Chloe Autio et al.; NIST AI 600-1. Published 26 July 2024; accessed 7 September 2026. Evidence type: Risk-management guidance.

[Read the original source](https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.600-1.pdf)

Supports: MS-2.3-003 recommends sharing predeployment results with release-approval authorities. MS-2.5-001 warns against extrapolation from narrow or anecdotal assessments. MS-2.5-006 recommends revisiting guardrails and original deployment-safety judgments.

Limit: Voluntary, context-dependent guidance, not certification of an artifact or a prescribed harness architecture. A later update to a publication landing page does not create a new edition of the 2024 profile.

## S26

**LLM06:2025 Excessive Agency**

OWASP GenAI Security Project. 2025 edition; public source pinned to commit 79c180515d6500c8a66627fa8343bd514c464380. Evidence type: Risk-management guidance.

[Read the original source](https://github.com/OWASP/www-project-top-10-for-large-language-model-applications/blob/79c180515d6500c8a66627fa8343bd514c464380/2_0_vulns/LLM06_ExcessiveAgency.md)

Supports: The guidance recommends minimum necessary functionality and permissions, user-context execution, approval for high-impact actions, and authorization enforced downstream rather than entrusted to an LLM's judgment. Relevant mitigation passages are at lines 64-78.

Limit: This is mitigation guidance, not a finding that a particular product is vulnerable or that a declared policy is enforced. The pinned project source avoids the website's misleading legacy URL slug.

## S27

**Terraform CLI: plan command**

HashiCorp. Living documentation, accessed 7 September 2026. Evidence type: Technical documentation.

[Read the original source](https://developer.hashicorp.com/terraform/cli/commands/plan)

Supports: Established prior art for previewing intended changes, optionally saving a plan, and applying a reviewed plan later. The documentation warns that changes in the target system can invalidate expectations from an earlier speculative plan.

Limit: This is not evidence that an LLM's proposed trajectory predicts future GUI state, that planning has no possible incidental effects, or that a previously approved action remains authorized after its assumptions change.

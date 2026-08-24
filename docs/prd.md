# Product Requirements Document

**Status: pre-alpha. Every `agentspark` command below is a specification. None of it is
implemented.**

Source: concept brief prepared for Ragnar Pitla, 2026-08-23. This document is the working version
and supersedes the brief where they differ.

---

## 1. Vision and principles

Give a team a predictable first ten minutes: discover, configure, generate, validate, deploy. They
should see a working agent before they need to understand the whole platform surface.

| Principle | What it means in practice |
| --- | --- |
| Supported-first | Only public, documented commands, APIs, schemas, and extension points |
| Complete agent, not fragments | Generation emits instructions, skills, knowledge contracts, tools, evals, deployment config, README, and security notes |
| Progressive disclosure | The default wizard asks six to eight questions. Everything else has a default and an advanced flag |
| Transparent automation | Show the plan, the exact commands, the files, the permissions, and the rollback before executing |
| Opinionated but ejectable | Delete Agent Spark and the generated project still works |
| Secure and governed by default | No secrets in source, least privilege, consent gates, publishing off |
| Open contribution | Templates and skills are versioned, owned, tested, and reviewable in public |

"Ejectable" is the one that constrains design most. It rules out generating projects that depend on
an Agent Spark runtime, a lock file only the CLI understands, or metadata the platform cannot read.

## 2. Problem

Agent builders face fragmentation across installation, CLI commands, architecture decisions,
samples, skills, tools, connectors, MCP servers, knowledge configuration, evaluation, publishing,
and governance.

The cost is not only setup time. It produces inconsistent implementations, hidden dependencies,
weak testing, and poor handoff between architects and the customer teams who inherit the result.

## 3. Goals

1. Produce a working starter agent through one guided flow.
2. Automate or guide prerequisite installation across Windows, macOS, Linux, and CI.
3. Ship a catalog of complete, production-minded templates and skills.
4. Wrap supported lifecycle operations with safer defaults and clearer diagnostics.
5. Make every generated project understandable, version-controlled, testable, and portable.
6. Provide a public contribution path for templates, skills, adapters, docs, and eval packs.

## 4. Non-goals

- Reimplementing or reverse-engineering the Copilot Studio runtime, harness, billing, sandbox, or
  orchestration engine.
- Bypassing tenant administration, environment policy, DLP, authentication, licensing, consent, or
  approval requirements.
- Compatibility with undocumented internal interfaces.
- Embedding customer secrets, credentials, or proprietary data in templates.
- Replacing solution lifecycle management or enterprise governance platforms.

## 5. Personas

| Persona | Need | Success signal |
| --- | --- | --- |
| First-time customer builder | A safe working example without studying the platform | Workspace generated and validated, with clear next steps |
| Professional developer | Composable structure and automation hooks | Extends tools, skills, tests, and CI without fighting generated code |
| Solution architect | Consistent architecture and governance controls | Reviews a manifest, risk profile, dependency map, and deployment plan |
| Partner delivery lead | Repeatable customer onboarding | Reuses an approved accelerator while keeping customer specifics separate |
| Platform administrator | Visibility into requirements and intended changes | Gets a preflight report and no surprise writes |
| Open-source contributor | A simple extension contract | Adds a template or skill with schema validation, tests, and docs |

## 6. User journeys

### Journey A: build my first agent

Launch wizard, choose scenario, provide name and business outcome, select or defer knowledge and
tools, choose local-only or a target environment, review the plan and warnings, generate, validate,
run starter evaluations, optionally authenticate and synchronize, open the generated README.

The pivot point is plan review. Everything before it is reversible because nothing has been
written. Everything after it changes state on disk or in a tenant.

### Journey B: add a reusable skill

Run `agentspark skill add`. Choose from the catalog, record a workflow, or author from scratch.
Define trigger intent, input contract, behavior, resources, output contract, guardrails, and
evaluations. Validate, test locally against example prompts, attach to templates or projects.

### Journey C: convert an existing agent into a template

Clone or pull through supported commands. Scan and classify components. Externalize
environment-specific values. Scrub secrets and customer content. Create the manifest, variable
schema, sample config, and eval pack. Run publication readiness checks.

Journey C is the one most likely to leak confidential material into a public repository. The
scrubbing step is not optional and cannot be fully automated.

## 7. Functional requirements

| ID | Requirement |
| --- | --- |
| FR-01 | Bootstrap: packaged binary, package manager, and a no-permanent-install runner where feasible |
| FR-02 | Doctor: detect OS, shell, architecture, Git, PAC CLI, .NET, Node, auth status, environment connectivity, version compatibility |
| FR-03 | Guided installation: supported commands, consent before elevation or machine changes, manual alternatives |
| FR-04 | Wizard: basic, guided, advanced, and noninteractive modes over one configuration schema |
| FR-05 | Catalog: search, filter, preview, provenance, compatibility, versioned install |
| FR-06 | Complete generation: instructions, skills, tools, knowledge placeholders, connected-agent contracts, evals, deployment config, README, security notes, contribution metadata |
| FR-07 | Validation: schema, references, unsupported combinations, missing prerequisites, secrets, unsafe paths, naming, environment readiness |
| FR-08 | Lifecycle wrapper: init, clone, pull, push, pack, publish, list, status, translation, where compatible with the selected agent type |
| FR-09 | Plan and dry-run: commands, filesystem changes, environment writes, permissions, expected outputs, shown before execution |
| FR-10 | Diagnostics: human-readable errors, remediation steps, doc links, log bundle export, retry from failed step |
| FR-11 | Skills authoring: create, validate, test, package, document, catalog |
| FR-12 | Evaluations: generate baseline test sets. Templates declare acceptance criteria. Agent Spark never fabricates a business threshold |
| FR-13 | Extensibility: adapters for CLI, REST, MCP, connectors, workflows, behind stable internal contracts |
| FR-14 | Reporting: Markdown and JSON creation reports with versions, files, actions, warnings, next steps |
| FR-15 | Update safety: pin templates and schemas, detect updates, show changelogs, never silently migrate |
| FR-16 | Offline-friendly authoring: generate and validate without tenant access when environment actions are deferred |

FR-12 is implemented in the schemas today. `evaluation.schema.json` allows `acceptance.minPassRate`
to be null, and `scripts/validate.mjs` rejects a threshold whose `setBy` names nobody.

## 8. Wizard specification

A first-time user should always know: where am I, what happens next, what is required, what will
change, and how do I recover.

| Step | User experience | System behavior |
| --- | --- | --- |
| Welcome | Build first agent, advanced mode, or inspect catalog | Checks for updates without blocking local use |
| Preflight | Readiness summary with Fix, Skip, or Explain | Non-destructive checks. Installation requires consent |
| Scenario | Cards with outcome, complexity, dependencies, preview | Filters by compatibility and maturity |
| Agent basics | Name, business task, users, expected outputs | Drafts instructions, generates schema-safe names |
| Knowledge | Choose now, add placeholder, or skip | Never uploads data without an explicit action |
| Tools and skills | Recommended defaults with reasons | Shows permissions, external calls, and risk notes |
| Environment | Local-only, sandbox, or selected target | Checks authentication and access only when needed |
| Plan review | Files, commands, writes, billing notice, warnings | Dry-run, export plan, back, or execute |
| Progress | Named steps, live logs, retry, cancel boundaries | Writes checkpoints. No ambiguous spinners |
| Success | What was created, how to test, what next | Emits Markdown and JSON report, preserves exact versions |

Two rules that fall out of this table. Preflight never installs without consent, because a tool
that modifies a developer machine unasked does not get a second run. And progress shows named
steps rather than a spinner, because a spinner during a slow tenant operation is indistinguishable
from a hang.

## 9. Command surface

| Command | Purpose |
| --- | --- |
| `agentspark init` | Wizard or noninteractive creation of a complete project |
| `agentspark doctor` | Prerequisite, version, auth, environment, and compatibility checks |
| `agentspark catalog list\|show\|search` | Discover and preview templates and skills |
| `agentspark plan` | Generate an execution plan without making changes |
| `agentspark validate` | Validate project, template, skill, security, environment readiness |
| `agentspark sync pull\|push` | Wrapper over supported workspace synchronization |
| `agentspark pack` | Package via supported tooling |
| `agentspark publish` | Publish after confirmation and readiness checks |
| `agentspark status` | Local state, environment state, versions, outstanding changes |
| `agentspark skill new\|add\|test\|validate` | Skill authoring lifecycle |
| `agentspark template new\|extract\|validate` | Template contribution lifecycle |
| `agentspark report` | Creation and diagnostic reports |
| `agentspark update` | Compatible upgrades and changelogs. Never silently migrates |

## 10. Configuration model

See [`schemas/agent-project.schema.json`](../schemas/agent-project.schema.json) for the enforced
version, and [`samples/contoso-knowledge-assistant/agentspark.yaml`](../samples/contoso-knowledge-assistant/agentspark.yaml)
for a rendered example.

Field names are an Agent Spark product surface. Adapters map them onto supported platform assets.
They are not a claim about internal platform structure.

## 11. Sample template

[`templates/knowledge-assistant`](../templates/knowledge-assistant/) implements section 13 of the
source brief: an agent that answers from approved sources, cites them, identifies missing evidence,
and avoids unsupported actions.

## 12. Skill authoring

A skill is a reviewable package of structured behavior plus optional resources, examples, scripts,
and evaluations.

| Element | Required content |
| --- | --- |
| Name and description | Clear outcome and trigger language |
| Intent boundary | When to use, and when not to |
| Inputs | Required and optional, validation, sensitive fields |
| Behavior | Ordered guidance that does not depend on undocumented runtime behavior |
| Tools and permissions | Required tools, read or write, confirmation rules |
| Outputs | Format, citations, files, actions, failure behavior |
| Guardrails | Data handling, refusal, escalation, human approval |
| Examples | Positive, negative, and ambiguous |
| Evaluations | Trigger, non-trigger, quality, safety, regression |
| Versioning | Owner, semantic version, compatibility, changelog, deprecation state |

`skill.schema.json` requires `doNotUseWhen` to have at least one entry. A skill that never declines
anything will be selected for requests it cannot handle, and the failure surfaces as a model
quality complaint rather than as the routing problem it is.

Reference implementation: [`skills/answer-with-sources`](../skills/answer-with-sources/).

## 13. PAC CLI integration

**Partly verified 2026-08-24** against the
[official command reference](https://learn.microsoft.com/en-us/power-platform/developer/cli/reference/copilot)
(page `ms.date` 2026-02-25, updated 2026-07-10). Command existence and the documented workspace loop
are verified. Behavior against a real environment is not. See
[official-resources.md](official-resources.md) for the quoted source.

The documented loop: `init` or `clone` to start a workspace, `pull` before editing, `push` to send
changes back, `pack` to produce a solution zip for `pac solution import`.

| Official command | Verified | Proposed use |
| --- | --- | --- |
| `pac copilot init` | yes | Create a workspace from a template. See the caution below about `--environment` |
| `pac copilot clone` | yes | Bring an existing agent into a local workspace |
| `pac copilot pull` | yes | Synchronize remote changes before edits |
| `pac copilot push` | yes | Send validated local changes |
| `pac copilot pack` | yes | Package the workspace into a solution zip |
| `pac copilot publish` | yes | Publish after explicit confirmation and readiness checks |
| `pac copilot list` | yes | Discover agents in the target environment |
| `pac copilot create` | yes | Create from a template file produced by `extract-template` |
| `pac copilot extract-template` | yes | Bootstrap a template from an existing agent, then scrub and validate |
| `pac copilot extract-translation` / `merge-translation` | yes | Localization workflow |
| `pac copilot mcp` | yes | Optional bridge for compatible MCP clients |
| `pac copilot status` | yes | Poll deployment status |
| `pac copilot quarantine` | yes | Expose quarantine status without changing policy behavior |
| `pac copilot delete` | yes | Destructive. Takes `--confirm` / `-y`. Display target identity first |
| `pac copilot model list` / `predict` / `prepare-fetch` | yes | AI Builder model operations. Not in the source brief. No proposed use yet |

### Three findings that change the design

**`init --environment` is not just scaffolding.** The documentation states it scaffolds, packs,
imports, and connects the workspace in one step. That is a tenant write behind a command whose name
implies a local operation. It needs the same confirmation gate as `publish`, and the wizard must not
reach it by default. The `local-first` path uses `init` without `--environment`.

**Push conflict behavior is documented, not unknown.** If the same item changed on the server, push
stops and directs the user to pull first. The adapter presents that as a conflict with both sides
visible rather than surfacing an exit code. It does not auto-pull, because auto-pulling before a push
is how local work disappears.

**Clone refuses to overwrite.** Clone writes into a subfolder named after the agent's sanitized
display name and stops if that folder already has files. `--display-name` selects a different folder.
Agent Spark surfaces this at plan time rather than letting it fail mid-execution.

### Still unverified

Command existence is not behavior. Open: whether workspace commands behave differently for GitHub
Copilot harness agents than for standard harness agents, which commands are preview, and what
`pac copilot init` actually writes to disk. The adapter discovers capability through version and
help output rather than assuming. See [ADR-0002](adr/0002-supported-interfaces-only.md).

Closed on 2026-08-24: whether the on-disk workspace format is documented or incidental. It is
**incidental**. Microsoft's VS Code extension repository ships a placeholder standing in for
workspace documentation that does not exist, and the Copilot Studio YAML schema is published under
an explicit "may change without notice". Under ADR-0002 rule 2 this is now binding: Agent Spark
scaffolds by invoking `pac copilot init` without `--environment`, never by writing workspace files
itself, and never synthesizes the sync metadata behind `pull` and `push`. Evidence:
[.research/pac-workspace-format.md](../.research/pac-workspace-format.md).

## 14. Security and governance

Full detail in [security-model.md](security-model.md). The commitments:

- No customer content collected or transmitted by default. Telemetry is opt-in and non-content.
- No auto-elevation. Explain why, offer the manual command.
- Environment variables or approved secret stores. Likely secrets are blocked from commits.
- Generation is separate from environment writes. Publishing and destructive actions need explicit
  confirmation.
- Provenance recorded for templates, skills, and external resources.
- Dependency, license, secret, and supply-chain scanning in CI.
- DLP, tenant policy, permission, license, model availability, and billing appear as checks, never
  as bypasses.
- Preview features are pinned and warned about.

## 15. Nonfunctional requirements

| Area | Requirement |
| --- | --- |
| Performance | Local generation and validation feel immediate. Slow external operations show progress and stay cancelable where safe |
| Reliability | Idempotent generation where practical, checkpoints, no hidden partial state, deterministic reports |
| Portability | Windows, macOS, Linux, with OS-specific adapters and documented exceptions |
| Accessibility | Keyboard-first wizard, screen-reader labels, non-color status indicators, plain-language errors |
| Localization | Externalized strings. Templates declare supported languages |
| Observability | Structured local logs, correlation IDs for external operations, redaction, diagnostics bundle |
| Maintainability | Adapter boundaries, typed schemas, contract tests, compatibility matrix, ADRs |
| Testability | Unit, snapshot, schema, integration, golden-template, and sandbox end-to-end tests |

## 16. Success metrics

Baselines are measured during pilots, not invented here. Track:

median time from launch to generated workspace; median time to first successful environment
synchronization; preflight failure and recovery rate by prerequisite; wizard completion rate and
the step where people abandon; template selection and reuse; first-run validation pass rate;
publish success rate after validation; support issues per successful project; contribution
acceptance time; upgrade success rate; security findings prevented before a write or a commit.

The abandonment step is the most actionable of these. It names the specific question that is too
hard to answer.

## 17. Risks

| Risk | Mitigation |
| --- | --- |
| Rapid platform and preview change | Capability discovery, pinned compatibility, adapter interfaces, release notes |
| The wrapper hides concepts users need | Explain mode, generated architecture notes, exact-command view, ejectable projects |
| Auto-install damages trust | Consent, dry-run, supported installers, no silent elevation, rollback guidance |
| Templates go stale or unsafe | Ownership, review dates, CI, maturity labels, provenance, deprecation policy |
| Confidential material reaches the public repo | Contribution checklist, secret and content scanning, license and provenance review |
| Users mistake this for a Microsoft product | Prominent unofficial status, precise support boundary in README and SUPPORT |
| Cross-platform inconsistency | Matrix testing, documented OS-specific capabilities |
| Over-scoped first release | Ship one excellent happy path: doctor, one template, one skill, validation, supported sync |

## 18. Delivery phases

| Phase | Scope | Exit criteria |
| --- | --- | --- |
| 0 Discovery | Verify supported commands, workspace format, harness compatibility, preview constraints, licensing, public-release rules | A written compatibility decision and approved OSS boundaries |
| 1 Walking skeleton | doctor, init wizard, plan, generate, validate, one template, one skill, reports | A fresh machine generates a valid local project |
| 2 Environment loop | Auth guidance, clone, pull, push, pack, status adapters | A sandbox round trip succeeds with an auditable report |
| 3 Catalog and contribution | Versioned catalog, template and skill CLI, CI, governance, docs site | An external contributor adds and tests content |
| 4 Production hardening | Security review, telemetry decisions, localization, accessibility, upgrade engine, support model | Pilot readiness criteria met |
| 5 Expanded scenarios | Approval helper, case triage, ERP compliance assistant, connected-agent patterns | Each scenario has an owner, tests, governance, and evidence of need |

This repository has completed part of Phase 1: the template, the skill, the schemas, validation,
and CI. Not the CLI.

## 19. MVP acceptance criteria

1. On a clean machine, `doctor` identifies required and optional dependencies with supported
   remediation guidance.
2. A user generates the Knowledge Assistant through both wizard and noninteractive config.
3. All generated assets pass schema and reference validation.
4. No generated file contains secrets or customer-specific identifiers.
5. Dry-run accurately lists planned files and external actions.
6. Environment operations are skipped safely in local-only mode.
7. When connected, the adapter uses available supported commands and preserves logs.
8. The generated project includes a working sample skill and baseline evaluations.
9. The project can be committed to Git and used after Agent Spark is removed.
10. The repository includes security, contribution, governance, support, compatibility, license,
    and official-resource documentation.

Criteria 3, 4, 8, and 10 are met today. The rest need the CLI.

## 20. Open decisions

Recorded here rather than resolved, because guessing at them would produce an ADR that documents a
coin flip.

1. Which GitHub Copilot harness artifacts are supported by current PAC CLI workspace commands, and
   whether support differs from standard harness agents. **Partly narrowed 2026-08-24:** the
   command set is verified and the workspace loop is documented. Whether behavior differs by
   harness is still open.
2. Implementation language and packaging, weighed on cross-platform installation, enterprise trust,
   and contributor ecosystem.
3. Public redistribution rights for any copied sample, schema, icon, or documentation text. The
   current position is to link rather than copy.
4. Whether installation is built in or delegated to OS package managers with generated commands.
5. Telemetry defaults, and the boundary between internal and public distribution.
6. Supported environment matrix, preview feature policy, and compatibility test tenants.
7. How template signing, provenance, and trust levels work.
8. The name. "Agent Spark" has not cleared trademark review or npm availability. See
   [ADR-0004](adr/0004-project-name.md).

# Architecture

**Status: proposed. None of the layers below are implemented.**

## The boundary that defines everything else

| Agent Spark owns | Copilot Studio owns |
| --- | --- |
| Developer experience and generated assets | Harness, runtime, platform orchestration |
| Files on the developer's disk | Environment state and agent state |
| Plan, validation, reporting | Governance enforcement, DLP, licensing |
| The template and skill catalog | Supported lifecycle behavior |

Every design question resolves against this table. If a feature would require Agent Spark to model
runtime behavior, it belongs on the right side and Agent Spark does not build it.

## Layers

| Layer | Responsibility |
| --- | --- |
| Experience | CLI commands, wizard, future desktop or web shell, localization, accessibility |
| Application services | Project creation, catalog, validation, planning, execution, reporting, upgrades |
| Domain model | AgentProject, Template, Skill, Tool, KnowledgeSource, Evaluation, EnvironmentTarget, DeploymentPlan |
| Adapters | PAC CLI, filesystem, Git, MCP, supported REST endpoints, telemetry sink, secret provider |
| Content | Versioned templates, schemas, skills, eval packs, ADRs, official-resource index |
| Policy | Consent, data handling, allow and deny rules, provenance, compatibility, secret scanning, risk classification |

Dependencies point downward. The domain model does not know an adapter exists. That is what makes
it possible to replace the PAC CLI adapter with a REST adapter without rewriting generation.

## Plan and execute

Every state-changing operation splits in two.

**Plan** is pure. It reads the project, the template, and cached capability information, and
returns a description of intended changes: files to write, commands to run, tenant writes,
permissions required, and warnings. It touches nothing.

**Execute** consumes a plan and performs it, with checkpoints between steps.

Three properties follow from the split, and they are the reason for it:

- `--dry-run` is not a special code path. It is plan without execute, so it cannot drift out of
  sync with what execution actually does.
- Plans serialize, so they can be reviewed, attached to a change request, or diffed between runs.
- A failed execution resumes from the last checkpoint instead of restarting.

See [ADR-0003](adr/0003-plan-first-execution.md).

## Capability discovery

The adapter never assumes a command exists. On first use it records the CLI version and parses help
output into a capability set, then caches it keyed by version.

Planning consults the capability set. A plan that needs an unavailable command fails at plan time,
with a message naming the command and the installed version, rather than failing halfway through
execution with a shell error the user has to decode.

This is the difference between "pac copilot pack is not available in 1.28, you have 1.28, upgrade
or use pack manually" and "Error: Unrecognized command or argument 'pack'".

## Domain model

| Type | Holds | Notes |
| --- | --- | --- |
| `AgentProject` | The user's workspace | Serialized as `agentspark.yaml`. The only type users edit directly |
| `Template` | A versioned scenario | Immutable once published. Referenced by pinned version |
| `Skill` | A reusable behavior contract | Pinned by version. Never auto-upgraded |
| `Tool` | A capability with an access level | `read`, `write`, or `read-write`. Anything but `read` implies a confirmation gate |
| `KnowledgeSource` | A declared source and classification | `placeholder` is a first-class kind. Declaring intent is not connecting |
| `Evaluation` | Cases plus optional acceptance criteria | Acceptance is null in shipped content |
| `EnvironmentTarget` | Where changes go | Nullable. `null` means local-first |
| `DeploymentPlan` | Steps, gates, and preflight results | Produced by plan, consumed by execute |

`KnowledgeSource` having a `placeholder` kind is deliberate. Without it, generation faces a choice
between connecting a source it cannot evaluate for permissions and DLP, or omitting knowledge
entirely and producing an incomplete project. The placeholder records the decision and defers the
action.

## Adapters

| Adapter | Wraps | Failure mode it hides |
| --- | --- | --- |
| PAC CLI | `pac` process invocation | Version differences, exit codes, unstructured stderr |
| Filesystem | Reads and writes under the project root | Path traversal, partial writes, permission errors |
| Git | Repository state | Uncommitted changes before a destructive operation |
| MCP | Compatible MCP clients | Optional. Absent by default |
| REST | Documented endpoints | Only where a supported endpoint exists |
| Secret provider | Environment variables, OS keychain | Prevents secrets reaching disk or logs |
| Telemetry | Opt-in operational events | No-op unless enabled. Never carries content |

Adapters translate. They do not decide. An adapter that returns "the environment refused this
because of DLP policy X" is correct; one that retries with a different connector to get around the
refusal has crossed the boundary and would be a defect.

## Content layer

Content is versioned independently of code, because a project generated against
`knowledge-assistant@0.1.0` must keep validating after the catalog moves to `0.2.0`.

```
schemas/          versioned as agentspark.dev/v1alpha1
templates/        semver per template, pinned in the project manifest
skills/           semver per skill, pinned in the template manifest
```

Nothing upgrades itself. `agentspark update` shows what is available and what changed. A human
changes the pin.

## Policy layer

Policy is separate from adapters so that a rule applies regardless of which adapter would carry out
the action.

| Policy | Enforced by |
| --- | --- |
| No secrets in content | `scripts/validate.mjs`, CI |
| No path traversal in generated targets | Schema pattern plus filesystem adapter |
| Publishing off in shipped templates | `template.schema.json` const, plus a CI grep |
| Writes require confirmation | `requiresHumanConfirmationForWrites`, gates in the deployment plan |
| Provenance recorded | Required field in template and skill schemas |
| Acceptance thresholds are not fabricated | `evaluation.schema.json` allows null; validator rejects a threshold with no `setBy` |

Six of those are enforced today in the validator and schemas. The rest need the CLI.

## What is not designed yet

- Wizard state machine and how back-navigation interacts with a partially built plan.
- Conflict presentation when local and remote both changed. Showing a diff is easy; deciding what
  a safe default resolution looks like is not.
- Template signing and trust levels. Open decision 7 in the [PRD](prd.md).
- Whether the CLI is a single binary or a package manager install. Open decision 2.
- The upgrade engine, specifically migrating a project across a breaking schema change.

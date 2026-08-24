# CLI

**Nothing here is implemented.** This directory holds the command specification. `src/` and `tests/`
are empty, there is no `package.json`, and `npx agentspark` will not work because no package has been
published.

The name is also not cleared. npm availability for `agent-spark` has not been checked, because
outbound HTTP was blocked in the environment where this was written. See
[ADR-0004](../docs/adr/0004-project-name.md).

Everything else in this repository is designed to be useful without this. Templates and skills are
readable and copyable by hand, and the validator runs today. If the CLI never gets built, the
repository still does something.

## Specified commands

| Command | Purpose |
| --- | --- |
| `agentspark init` | Wizard or noninteractive creation of a complete project |
| `agentspark doctor` | Prerequisite, version, auth, environment, and compatibility checks |
| `agentspark catalog list\|show\|search` | Discover and preview templates and skills |
| `agentspark plan` | Produce an execution plan without making changes |
| `agentspark validate` | Validate project, template, skill, security, and environment readiness |
| `agentspark sync pull\|push` | Wrapper over supported workspace synchronization |
| `agentspark pack` | Package through supported tooling |
| `agentspark publish` | Publish after explicit confirmation and readiness checks |
| `agentspark status` | Local state, environment state, versions, outstanding changes |
| `agentspark skill new\|add\|test\|validate` | Skill authoring lifecycle |
| `agentspark template new\|extract\|validate` | Template contribution lifecycle |
| `agentspark report` | Creation and diagnostic reports |
| `agentspark update` | Compatible upgrades with changelogs. Never migrates silently |

Full behavior is in [docs/prd.md](../docs/prd.md).

## Constraints any implementation inherits

**Plan and execute are separate.** Every state-changing command produces a plan first. `--dry-run`
is planning without executing, not a parallel code path, so it cannot drift from what execution
actually does. See [ADR-0003](../docs/adr/0003-plan-first-execution.md).

**Supported interfaces only.** No undocumented commands, flags, endpoints, or file formats.
Capability is discovered from version and help output rather than assumed from a pinned minimum. When
a policy refuses an action, the CLI reports the refusal and stops. It does not find another route to
the same effect. See [ADR-0002](../docs/adr/0002-supported-interfaces-only.md).

**Tenant writes are visible before they happen.** `pac copilot init --environment` scaffolds, packs,
imports, and connects, so it is gated like a publish rather than treated as local setup. This is
verified behavior, not caution for its own sake. See
[docs/official-resources.md](../docs/official-resources.md).

**Publishing is never a default or a side effect.**

**Machine-readable output.** Every command supports `--json`, because a tool that can only be read by
a human cannot be put in a pipeline.

## Before writing any of this

[Phase 0 in the PRD](../docs/prd.md) has to close first. The highest-stakes open question is whether
the on-disk workspace format is documented or incidental. If it is incidental, ADR-0002 forbids
writing into it directly, and generation has to route through `pac copilot init` and
`pac copilot create`. That is a different implementation, not a detail, and building before knowing
means building the wrong one.

## Layout

```
cli/
  src/      empty. Command implementations
  tests/    empty. Contract tests pairing each plan step with its executor
```

The contract tests matter more than they sound. A plan step with no executor, or an executor doing
work no plan step declared, breaks the guarantee in ADR-0003 while leaving both halves looking
correct on their own.

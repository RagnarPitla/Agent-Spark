# pac-adapter

**Not implemented.** Contract only.

The only component in Agent Spark that runs PAC CLI, touches the network, or changes tenant state.
Everything else is pure. This package is where the containment happens.

## Responsibility

Discover capability, execute commands, and translate results.

**Discovery.** Read `pac --version` and `pac copilot help` output to learn which commands and flags
exist in the installed CLI. Never assume from a pinned minimum version. See
[ADR-0002](../../docs/adr/0002-supported-interfaces-only.md).

**Execution.** Run exactly the command the plan declared, with exactly the declared arguments.

**Translation.** Turn exit codes and output into structured results that name what happened.

## Constraints

**Documented interfaces only.** No undocumented commands, flags, endpoints, or file formats.

**No retry around a refusal.** When a DLP policy, licence, permission, or quarantine state refuses an
action, report the refusal and stop. Do not try a different connector, a different path, or the same
call with different arguments to get the same effect. Users will ask for this. It is a defect.

**No auto-pull before push.** Push conflict behavior is documented: if the same item changed on the
server, push stops and directs you to pull first. The adapter surfaces that as a conflict with both
sides visible. Pulling automatically before a push is how local work disappears.

**Destructive commands are named as such.** `pac copilot delete` takes `--confirm`. `pac copilot
init --environment` scaffolds, packs, imports, and connects, which makes it a tenant write behind a
local-sounding name, so it is gated like a publish.

**Substitutable.** Everything upstream depends on an interface, not on this implementation, so
planning and orchestration can be tested with a fake and no tenant.

**Nothing is logged that should not be.** Command output can contain environment identifiers, user
principal names, and connection details. See [SECURITY.md](../../SECURITY.md).

## Verified command surface

See [docs/official-resources.md](../../docs/official-resources.md), which records what was checked
against the published reference on 2026-08-24 and the three places the original brief was wrong.

Command existence is verified. Behavior against a real environment is not. Whether workspace commands
differ between the GitHub Copilot harness and the standard harness is open, and it is a Phase 0
question rather than something to discover during implementation.

## Blocking unknown

Whether the on-disk workspace format is documented or incidental. If incidental, ADR-0002 forbids
writing into it directly, and generation must route through `pac copilot init` and
`pac copilot create`. That is a different adapter, so this cannot sensibly be built before the
question is answered.

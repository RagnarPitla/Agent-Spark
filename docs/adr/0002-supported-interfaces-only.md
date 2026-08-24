# ADR-0002: Use only supported, documented interfaces

Status: accepted
Date: 2026-08-24

## Context

Agent Spark wraps Copilot Studio. Wrapping a fast-moving platform offers a shortcut at every turn:
the documented command does not quite do what is needed, but an undocumented flag, an internal
endpoint, or writing workspace files directly would.

Each shortcut works until the platform changes. Then it breaks for every user at once, with no
warning and no recourse, because the interface was never promised.

There is a second problem specific to this project. Its author works at Microsoft. A tool from that
author that depends on internal knowledge of unreleased interfaces is a governance problem
regardless of whether it works, and the boundary has to be visible rather than merely intended.

## Decision

Agent Spark calls only public, documented interfaces: published commands, documented APIs,
published schemas, and documented extension points.

Specifically:

1. No undocumented commands, flags, endpoints, or file formats.
2. No writing directly into a workspace format that is incidental rather than documented. Where the
   format is not documented, route through supported commands.
3. Capability is discovered at runtime by reading version and help output, never assumed from a
   pinned minimum version.
4. A plan that needs an unavailable command fails at plan time, naming the command and the installed
   version.
5. When a policy, DLP rule, licence, or permission refuses an action, Agent Spark reports the
   refusal and stops. It never retries through a different path to get the same effect.
6. Preview interfaces are pinned to the tested version and warned about, and never sit on a path a
   user cannot avoid.

Rule 5 is the one with teeth. An adapter that retried with a different connector after a DLP refusal
would be a defect, not a feature, even though users would ask for it.

## Consequences

**Easier.** Users and administrators can reason about what the tool can do. A tenant administrator
does not need to audit Agent Spark separately, because it cannot exceed the permissions of the
commands it calls. Breakage is bounded by documented deprecation.

**Harder.** Some things will be impossible. Where the documented surface has a gap, Agent Spark has
the gap too, and the honest response is to say so rather than route around it.

**Slower.** Capability discovery through help-output parsing is more work than pinning a version,
and help output is not a stable API, so the parser needs its own tests against recorded output from
several versions.

**Foreclosed.** Any feature whose only implementation is an internal interface.

## Verification status

Partly discharged on 2026-08-24. The `pac copilot` command set was verified against the published
reference, which corrected three errors in the source brief. See
[official-resources.md](../official-resources.md).

Still unverified: whether the on-disk workspace format is documented or incidental. If it is
incidental, rule 2 forbids generating into it directly, and generation must route through
`pac copilot init` and `create`. That is a significant design constraint and it is not yet settled.

## Alternatives considered

**Use internal interfaces where they are better.** Rejected. It breaks without warning, cannot be
supported, and would make a personal open-source project depend on the author's employment.

**Pin a minimum CLI version instead of discovering capability.** Rejected because the minimum would
be a guess, and a wrong guess either excludes working setups or fails confusingly on old ones.
Reconsider if help output proves too unstable to parse.

**Reimplement the lifecycle against Dataverse directly.** Rejected as a much larger surface with
worse compatibility, and it would put Agent Spark in the position of reimplementing platform
behavior, which non-goal 1 in the PRD forbids.

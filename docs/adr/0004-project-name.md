# ADR-0004: Keep the name Agent Spark for now

Status: accepted
Date: 2026-08-24

## Context

The project was named Agent Spark before any code existed. Two objections were raised during
scaffolding.

The first came from the owner: the name carries no connotation of Microsoft Copilot Studio. Someone
who reads "Agent Spark" cannot tell what platform it targets, which matters for a tool whose entire
value is that it targets one specific platform.

The second is collision. A GitHub repository search on 2026-08-24 returned these counts for the
compact form of each candidate:

| Candidate | Repositories matching | Notes |
| --- | --- | --- |
| `agentspark` | 15 | Current name. Generic "agent" plus generic "spark" |
| `mcsforge` | 0 | MCS is common shorthand for Microsoft Copilot Studio |
| `pacforge` | 4 | Ties to the PAC CLI rather than the product |
| `studioforge` | 11 | Ambiguous, several unrelated meanings |

Spark also overlaps Apache Spark, which is unrelated but well known in the same broad data and AI
space.

On trademark: Microsoft brand guidance permits a descriptive phrase such as "for Microsoft Copilot
Studio" after a distinctive mark of your own. It does not permit a product name that incorporates
Microsoft marks as the distinctive element. Any candidate here works only as
`<distinctive name> for Microsoft Copilot Studio`, never as "Copilot Studio something".

MCS Forge was recommended on those grounds: zero collisions, and MCS signals the platform without
lifting a mark.

## Decision

Keep **Agent Spark**. The owner considered the alternatives and chose to keep the existing name.

Two things follow from keeping it:

1. Where the platform needs to be explicit, the full form is
   **Agent Spark for Microsoft Copilot Studio**. The README, the package description, and any
   listing use that form. The short form is for internal use.
2. The name is not settled enough to build an identity on. No logo, no domain purchase, and no npm
   publish until it is. The README says the name may change.

## Consequences

**Easier.** No rename churn now, when the repository is being written. Renaming later is cheap while
there are no dependents, no published package, and no external links.

**Harder.** Discoverability. Someone searching for Copilot Studio tooling will not find "Agent
Spark" by name, so the description has to carry that weight.

**Deferred, not avoided.** If the project is ever published, the name question returns, and it
returns more expensively. The cost of renaming rises the moment anything depends on it.

## Open

**npm availability for `agent-spark` is unchecked.** Direct outbound HTTP is blocked in the
environment where this was written, so the registry lookup could not be completed. It must be
checked before any publish attempt.

**Trademark clearance has not been done.** Verifying that "Agent Spark" does not collide with a
registered mark in a relevant class is a task for before public release, not before a private
scaffold.

## Alternatives considered

**MCS Forge.** Zero GitHub collisions, and MCS reads as Microsoft Copilot Studio to the audience
that would use this. Lost because the owner chose to keep the existing name. Remains the strongest
alternative if the question is reopened.

**Copilot Studio Forge.** Rejected before it reached the owner. It makes Microsoft marks the
distinctive element of a product name, which brand guidance does not permit.

**Studio Forge.** Eleven collisions and ambiguous on its own. "Studio" without qualification means
Visual Studio, Android Studio, or a recording booth.

**PAC Forge.** Names the transport rather than the product. If the PAC CLI is ever not the primary
interface, the name is wrong, and ADR-0002 already treats the CLI as an implementation detail behind
an adapter.

**Foundry, Anvil, Blueprint, Kit, Smith, Ignite.** All rejected during generation for existing
collisions in adjacent territory: Azure AI Foundry, anvil.works, Azure Blueprints, the existing
Copilot Studio Kit, Matrix Smith, and Microsoft Ignite.

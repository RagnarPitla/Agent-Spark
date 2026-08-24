# Tools for {{displayName}}

This template attaches no tools, and that is the design rather than an omission.

`answer-with-sources` uses the host platform's knowledge retrieval. It needs no custom tool to do
its job, and every tool added widens what the agent can reach and what an injected instruction
could reach through it.

## Adding a read-only tool

A read tool returns data and changes nothing. It does not alter the risk profile, but it does widen
reach.

1. Define it in the Copilot Studio authoring surface.
2. Record it in the project manifest under `spec.tools` with `access: read`.
3. Set `externalCalls: true` if it leaves the tenant, and say where it goes.
4. Update the reach table in `SECURITY-NOTES.md`.
5. Add evaluation cases that cover the tool failing, not only the tool succeeding. Agents backfill
   from model knowledge on tool errors, and that regression is easy to miss.

## Adding a write tool

A write tool changes the agent from something that answers questions into something that acts. That
is a different risk conversation.

1. Change `governance.riskProfile` from `read-only` to `low-write` or `high-write`.
2. Name an approver. `high-write` needs a named human who accepted the risk, recorded in the
   manifest.
3. Keep `requiresConfirmation: true`. The template already sets
   `requiresHumanConfirmationForWrites: true` so this cannot be inherited as off by default.
4. Update `instructions.md`. The current instructions state flatly that the agent performs no write
   actions. Leaving that in while attaching a write tool produces an agent whose instructions
   contradict its capabilities, and the model will resolve that contradiction unpredictably.
5. Update `SECURITY-NOTES.md`, including the re-review triggers.
6. Add evaluation cases for confirmation. Specifically: the agent must not write when the user has
   not confirmed, and must not treat an ambiguous reply as consent.

## What not to do

Do not attach a write tool and rely on the instructions alone to prevent its use. Instructions are
guidance the model usually follows. A tool the agent should never call should not be attached.

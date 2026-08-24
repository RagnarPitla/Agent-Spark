# diagnostics

**Not implemented.** Contract only.

Preflight checks and error translation. The package that decides whether a plan can succeed before
anyone runs it, and explains it in English when something fails anyway.

## Responsibility

**Preflight.** Check prerequisites before execution: is PAC CLI installed and recent enough, is there
an authenticated profile, does the target environment exist and is it reachable, does the caller have
the permissions the plan needs, does the installed CLI have the commands the plan calls for.

A plan that cannot succeed should fail at plan time, naming the missing thing, rather than half way
through a sequence that has already written to a tenant.

**Translation.** Turn a failure into a cause and a next action. Three parts, always: what failed,
the most likely reason, and what to do about it.

## Constraints

**Read only.** Diagnostics never fixes anything. A tool that repairs your environment while
explaining a problem is a tool you cannot reason about, and the repair is usually the thing that
needed review.

**Never guesses at a cause it cannot distinguish.** "Authentication failed" and "the environment does
not exist" produce different messages, and if the available evidence does not separate them, the
message says both are possible rather than picking the more likely one and sending the user down the
wrong path.

**Refusals are reported as refusals.** A DLP policy blocking a connector is not an error to be worked
around. It is a correct outcome, and the message says which policy and who administers it, not "try
again".

**Talks to the tenant only through pac-adapter.** No independent network access.

## Known failure modes to cover

[docs/troubleshooting.md](../../docs/troubleshooting.md) is the current list. It is written from
documented behavior rather than from observed failures, which means it is a starting point rather
than a record. The entries that come from real failures will be better than the ones that come from
reading, and they should replace them as they arrive.

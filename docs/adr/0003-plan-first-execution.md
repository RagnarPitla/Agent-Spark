# ADR-0003: Separate planning from execution

Status: accepted
Date: 2026-08-24

## Context

Agent Spark writes files, runs commands, and changes tenant state. Several of those actions are
expensive to undo. Publishing an agent, importing a solution, and deleting one are not reversible
by pressing a key.

The verified behavior of `pac copilot init --environment` makes this sharper. The documentation
states it scaffolds, packs, imports, and connects in one step. Running it on 2026-08-25 showed a
fifth action the reference does not mention: it publishes. The agent was created at 1:50 PM and its
`publishedon` field reads 1:54 PM, four minutes after the command had already returned success and
handed back the shell. That is a tenant write, and then a go-live, behind a command whose name
suggests a local operation. A tool that passes that command through without showing the user what
it is about to do is setting a trap.

Users also need to review changes before they happen, sometimes formally. An architect approving a
deployment wants to read what will change, not run it and inspect the aftermath.

## Decision

Every state-changing operation splits into two phases.

**Plan** is pure. It reads project files, template files, and cached capability information, and
returns a description of intended changes: files to write, commands to run with their exact
arguments, tenant writes, permissions required, billing implications, and warnings. It writes
nothing and contacts nothing except to read capability information it does not already have cached.

**Execute** takes a plan and performs it, writing a checkpoint between steps.

Consequences of the split that are load-bearing:

- `--dry-run` is plan without execute. It is not a separate code path, so it cannot drift out of
  sync with what execution actually does. A dry-run that lies is worse than no dry-run.
- Plans are serializable. They can be exported, reviewed, attached to a change request, and diffed
  between runs.
- A failed execution resumes from its last checkpoint.
- Anything that would surprise a user appears in the plan. `init --environment` shows the import and
  the connection, not just the scaffold.

## Consequences

**Easier.** Review before action. Reproducible reports. Resumable failures. Honest dry-run.
Administrators can be shown what a tool intends before it is permitted to run.

**Harder.** Every operation is written twice, once as a description and once as an action, and they
have to stay in agreement. Contract tests are needed to enforce that: a plan step with no
corresponding executor, or an executor doing work no plan step declared, is a bug.

**Slower.** Planning has to resolve information execution would otherwise discover as it went,
including capability data and preflight results.

**Foreclosed.** Streaming or opportunistic execution where the tool decides what to do next based on
what just happened. That is a real cost. It rules out adaptive behavior that would sometimes be
better, in exchange for the property that a user is never surprised.

## Alternatives considered

**Execute directly with a confirmation prompt.** Rejected because a prompt describes one step, not
the whole operation. Users confirm the first step without knowing there are eight more, and the
eighth is the publish.

**A separate dry-run mode.** Rejected because dry-run and real execution become two code paths that
drift. The dry-run output eventually stops matching what execution does, and nobody notices until it
matters.

**Transaction with rollback instead of plan-first.** Rejected as not implementable. Tenant
operations do not roll back on demand: a published agent cannot be unpublished into its prior state,
and a deleted one does not come back. Checkpoints and resumption are what is actually available.

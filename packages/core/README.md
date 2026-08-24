# core

**Not implemented.** Contract only.

Planning, orchestration, and checkpoints. This is where the decisions live, which is why it is kept
pure.

## Responsibility

Take a project definition and a discovered capability set, and produce a plan: files to write,
commands to run with exact arguments, tenant writes, permissions required, billing implications, and
warnings. Then execute a plan step by step, writing a checkpoint between steps so a failure resumes
rather than restarts.

## Constraints

**Pure planning.** No network, no filesystem writes, no clock reads that change the output. Given the
same project and the same capability set, `plan()` returns the same plan. This is what lets planning
be tested by anyone, not only by someone with a tenant.

**Capability is an input, not something core fetches.** `pac-adapter` discovers it and hands it over.
Core never learns what version of anything is installed by asking.

**Plan and execute stay in agreement.** Every plan step has an executor and every executor
corresponds to a declared step. Contract tests enforce the pairing, because both halves can look
correct while disagreeing, and the failure mode is a `--dry-run` that lies.

**Everything surprising is in the plan.** A tenant write hidden inside a command that sounds local
still appears as a tenant write. See
[docs/official-resources.md](../../docs/official-resources.md) for the case that made this a rule.

## Shape

```
plan(project, capabilities) -> Plan
execute(plan, adapter, checkpointStore) -> Result
```

`Plan` is serializable, so it can be written to disk, attached to a change request, diffed between
runs, and reviewed by someone who is not going to run it.

See [ADR-0003](../../docs/adr/0003-plan-first-execution.md).

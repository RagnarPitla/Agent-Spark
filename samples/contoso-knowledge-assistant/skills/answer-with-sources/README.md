# answer-with-sources (resolved from catalog)

Pinned at `answer-with-sources@0.1.0`.

Generation copies the full skill package into this directory: `SKILL.md`, `examples/`, `evals/`,
and `resources/`. This sample keeps a pointer instead of a copy, so the sample cannot drift away
from the catalog and quietly become a second, stale source of truth.

Read the real thing at
[`skills/answer-with-sources/SKILL.md`](../../../../skills/answer-with-sources/SKILL.md).

## What this pin means

This project uses `0.1.0` until someone edits `spec.skills` and reruns `evals/baseline.yaml`. When
the catalog publishes `0.2.0`, nothing here changes on its own.

That is the point. A skill is a behavior contract, and a contract that upgrades itself is how an
agent that passed review in one quarter starts refusing differently in the next.

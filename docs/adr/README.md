# Architecture Decision Records

A record of decisions that were argued about, so they do not get argued about again from scratch.

An ADR is warranted when a decision constrains future work, has a defensible alternative, and would
otherwise be reconstructed from guesswork six months later. Routine choices do not need one.

## Format

```
# ADR-NNNN: Title in the imperative

Status: proposed | accepted | superseded by ADR-NNNN
Date: YYYY-MM-DD

## Context
What forced a decision. Constraints, and what was true at the time.

## Decision
What was decided, stated as a rule someone can apply.

## Consequences
What this makes easy, what it makes hard, and what it forecloses.

## Alternatives considered
Each one, and the specific reason it lost. "It was worse" is not a reason.
```

The alternatives section is the part people skip and the part that has value later. A decision
without its rejected alternatives is indistinguishable from an accident.

## Records

| ADR | Title | Status |
| --- | --- | --- |
| [0001](0001-record-architecture-decisions.md) | Record architecture decisions | accepted |
| [0002](0002-supported-interfaces-only.md) | Use only supported, documented interfaces | accepted |
| [0003](0003-plan-first-execution.md) | Separate planning from execution | accepted |
| [0004](0004-project-name.md) | Keep the name Agent Spark for now | accepted |

## Rules

Numbers are never reused, and records are never deleted. A decision that turns out wrong gets a new
ADR that supersedes it, and the old one is marked. Deleting it removes the evidence of why the
mistake looked reasonable.

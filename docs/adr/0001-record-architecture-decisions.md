# ADR-0001: Record architecture decisions

Status: accepted
Date: 2026-08-24

## Context

Agent Spark starts as a concept document with roughly twenty unresolved decisions, several of which
depend on facts about the Copilot Studio platform that nobody has verified yet.

Two failure modes follow from that. Decisions get re-litigated because nobody remembers the
reasoning. And decisions made on an assumption survive after the assumption is disproved, because
the assumption was never written down next to the decision.

The second is the more expensive one. It produced the PAC CLI command table in the original brief:
a list transcribed from memory that turned out to omit three commands and mischaracterize what
`init --environment` does.

## Decision

Record decisions that constrain future work as numbered ADRs in `docs/adr/`, using the format in
that directory's README.

Every ADR states its alternatives and why each lost.

Every ADR that rests on an unverified fact says so, and names what would verify it.

An ADR is never edited to change its decision. A superseding ADR is written and the old one is
marked.

## Consequences

**Easier.** A contributor can see why the design is shaped as it is without asking. When a platform
fact changes, the ADRs that depended on it are findable by searching for the fact.

**Harder.** Writing one costs an hour, and there is a temptation to write them for decisions that do
not warrant one. The threshold in the README exists to hold that back.

**Foreclosed.** Silently changing a decision. That is the point.

## Alternatives considered

**Nothing.** Rely on commit messages and PR discussion. Rejected because both are organized by
change rather than by decision. Finding why publishing defaults to off means reading every PR that
touched deployment config, and the reasoning is usually not there.

**A single decisions document.** Rejected because a growing file gets edited in place, which loses
the history that makes the record useful. Numbered immutable files preserve it by construction.

**A wiki.** Rejected because it is not versioned with the code, so a decision and the code
implementing it drift apart without either side showing a conflict.

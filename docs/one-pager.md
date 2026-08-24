# Agent Spark: one-page brief

**Status: pre-alpha concept. The CLI described here does not exist yet.**

## What it is

An open, template-driven toolkit that turns Copilot Studio agent creation into a repeatable
workflow. Pick a scenario, answer a short wizard, get a complete local agent workspace that can be
validated and synchronized through supported platform tooling.

It is not a runtime, not a harness, and not a Microsoft product.

## The problem

A team's first day building a Copilot Studio agent goes into finding installers, reading command
references, deciding folder conventions, hunting for a sample that resembles their scenario, and
reconciling architecture guidance from four places. None of that is the business problem they came
to solve, and every team pays it again.

The cost is not only the lost day. It is that each team resolves those decisions differently, so
what ships varies in quality in ways that only surface later.

## Who it is for

| Persona | What they get |
| --- | --- |
| First-time customer builder | A working example without studying the whole platform first |
| Professional developer | A project structure that survives contact with real requirements |
| Solution architect | A manifest, risk profile, and deployment plan that can be reviewed |
| Partner delivery lead | An accelerator that is the same across customers |
| Platform administrator | A preflight report, and no writes they did not approve |
| Open-source contributor | A schema, a test, and a merge path |

## The happy path

1. Run `agentspark init`.
2. Pick a scenario.
3. Answer six to eight plain-language questions.
4. Review the plan. Nothing has been written yet.
5. Generate, validate, run baseline evaluations.
6. Optionally authenticate and synchronize through supported lifecycle commands.
7. Get a creation report listing versions, files, warnings, and next steps.

## What makes it different

| Instead of | Agent Spark |
| --- | --- |
| A new agent runtime | An orchestration layer over Copilot Studio and PAC CLI |
| A folder of samples | A catalog with schemas, owners, tests, and versions |
| A code generator | Setup, authoring, validation, evaluation, deployment, and diagnosis |
| Opaque automation | Plan-first execution, consent gates, dry-run, machine-readable reports |
| Templates that ship confident defaults | Templates that ship the decisions, and leave the judgement calls unset |

That last row is the one people argue with. Generated evaluation suites ship with
`minPassRate: null`. A threshold that did not come from the adopting team's risk tolerance is a
number nobody agreed to, and it is more dangerous than no number because it looks decided.

## What it deliberately does not do

- Reimplement or reverse-engineer the Copilot Studio runtime, harness, or orchestration engine.
- Bypass tenant administration, DLP, authentication, licensing, consent, or approval. Where policy
  blocks an action, Agent Spark reports it and stops.
- Connect knowledge sources during generation. That has permission and residency consequences a
  generator cannot judge.
- Enable publishing by default. The schema forbids a template from shipping with it on.
- Promise compatibility with undocumented interfaces.

## What exists today

| | |
| --- | --- |
| Templates | 1, complete and usable by hand |
| Skills | 1, with positive, negative, and ambiguous examples |
| Schemas | 4, enforced in CI |
| Evaluation cases | 31 across the two suites |
| CLI | 0 lines |

The validator runs on every push and checks schema conformance, reference resolution, secret
patterns, and ASCII-only Markdown. Everything else in this brief is a specification.

## Next decision

Phase 0 is a compatibility investigation, not code: confirm which agent artifacts current PAC CLI
workspace commands actually support, and whether that differs by harness. The command table in the
[PRD](prd.md) was transcribed from a source brief and has not been checked against an installed
CLI. Writing an adapter before that check is how you build against commands that do not exist.

# Agent Spark

A zero-friction agent factory for Microsoft Copilot Studio.

> **Status: pre-alpha concept repository. The `agentspark` CLI is not implemented yet.**
>
> What exists today: versioned templates, a reusable skill, JSON Schemas, and a validator that runs
> in CI on every push. Everything in `templates/` and `skills/` is usable by hand, with no tooling.
> What does not exist: any executable named `agentspark`. See [Status](#status) for the exact line.

## What problem this solves

A customer starting a Copilot Studio agent today assembles their own path through installer docs,
`pac` command references, folder conventions, sample agents, skill formats, evaluation setup, and
governance guidance. That work is repeated per customer and produces inconsistent results.

Agent Spark moves those decisions into reviewed, versioned content: pick a scenario, answer a short
wizard, get a complete workspace that already contains instructions, a skill, knowledge contracts,
baseline evaluations, deployment settings with publishing off, and a security note.

## Support boundary

Agent Spark is an unofficial community project. It is not a Microsoft product, is not covered by
Microsoft Support, and does not reimplement the Copilot Studio runtime, harness, or orchestration
engine. It calls only public, documented interfaces.

| Agent Spark owns | Copilot Studio owns |
| --- | --- |
| Developer experience, wizard, prompts | Runtime, harness, orchestration |
| Generated files on your disk | Environment state and agent state |
| Plan, dry-run, validation, reports | Governance enforcement, DLP, licensing |
| Template and skill catalog | Supported lifecycle behavior of `pac copilot` |

Agent Spark never bypasses tenant administration, environment policy, DLP, authentication,
licensing, consent, or approval. Where a policy blocks an action, Agent Spark reports it. It does
not route around it.

## Status

| Area | State |
| --- | --- |
| `templates/knowledge-assistant` | Usable by hand. Schema-validated in CI. |
| `skills/answer-with-sources` | Usable by hand. Schema-validated in CI. |
| `schemas/` | Four schemas, enforced by `npm run validate`. |
| `scripts/validate.mjs` | Working. Runs schema, reference, secret, and ASCII checks. |
| `cli/` | Not implemented. Directory holds the command specification only. |
| `packages/` | Not implemented. Directories hold package contracts only. |

The command surface in [`docs/prd.md`](docs/prd.md) describes intended behavior. Treat every
`agentspark` command in this repository as a specification, not as software you can run.

## Use it today, without the CLI

The Knowledge Assistant template is a plain folder of Markdown and YAML. Copy it, replace the
variables listed in its `template.yaml`, and author the result in Copilot Studio by hand.

```bash
cp -r templates/knowledge-assistant ./my-agent
$EDITOR my-agent/README.md   # the variable checklist is at the top
```

## Validate this repository

```bash
npm install
npm run validate
```

The validator checks four things prose cannot: every manifest matches its schema, every file path
referenced in a manifest exists, no file contains a likely secret, and no Markdown contains
non-ASCII typographic characters that render as mojibake in the GitHub UI.

## Repository layout

```
docs/         PRD, architecture, security model, compatibility, ADRs, resource index
schemas/      JSON Schemas for project, template, skill, and evaluation manifests
templates/    Complete scenario templates, versioned and owned
skills/       Reusable skill packages with examples and evaluations
samples/      Example generated output, checked against the schemas
scripts/      validate.mjs, the only executable code in the repo today
cli/          Command specification. No implementation.
packages/     Package contracts. No implementation.
```

## Documentation

| Document | Purpose |
| --- | --- |
| [One-pager](docs/one-pager.md) | Shareable brief |
| [PRD](docs/prd.md) | Requirements, journeys, command surface, phases |
| [Architecture](docs/architecture.md) | Layers, adapter boundary, domain model |
| [Security model](docs/security-model.md) | Secrets, consent, telemetry, provenance |
| [Compatibility](docs/compatibility.md) | Supported OS, PAC CLI discovery, preview policy |
| [Troubleshooting](docs/troubleshooting.md) | Failure modes and recovery |
| [Official resources](docs/official-resources.md) | Verified Microsoft Learn index |
| [ADRs](docs/adr/) | Decisions and their reasoning |

## Contributing

Read [CONTRIBUTING.md](CONTRIBUTING.md). The short version: templates and skills need an owner, a
semantic version, a license and provenance statement, examples, and evaluations. CI rejects
contributions that fail schema validation, contain likely secrets, or use non-ASCII typographic
characters in Markdown.

## Naming

"Agent Spark" is a working name. It has not cleared trademark review or npm name availability.
[ADR-0004](docs/adr/0004-project-name.md) records the alternatives considered and why each was
rejected.

## License

[MIT](LICENSE).

# Changelog

All notable changes to this project are recorded here. Format based on
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/). Versioning follows
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Schemas version independently of the repository. A schema change is called out explicitly.

## [Unreleased]

### Added

- Repository scaffold: governance, security policy, contribution guide, support routing.
- Product documentation: one-pager, PRD, architecture, security model, compatibility matrix,
  troubleshooting guide, verified Microsoft Learn resource index.
- Four ADRs covering the decision to record decisions, the supported-interfaces-only boundary,
  plan-first execution, and the project name.
- JSON Schemas at `agentspark.dev/v1alpha1`: agent project, template, skill, evaluation suite.
- `templates/knowledge-assistant@0.1.0`, a complete scenario template usable without the CLI.
- `skills/answer-with-sources@0.1.0`, a reusable skill with positive, negative, and ambiguous
  examples plus an evaluation suite.
- `samples/contoso-knowledge-assistant`, an example project manifest validated in CI.
- `scripts/validate.mjs`, which enforces schema conformance, reference resolution, secret
  detection, and ASCII-only Markdown.
- GitHub Actions CI running the validator on push and pull request.

### Known limitations

- The `agentspark` CLI is not implemented. `cli/` and `packages/` contain specifications only.
- The command surface in the PRD has not been validated against an installed `pac` CLI. Command
  availability and parameters must be confirmed before any adapter is written.
- The project name has not cleared trademark review or npm availability checking. See
  [ADR-0004](docs/adr/0004-project-name.md).
- The Microsoft Learn links in `docs/official-resources.md` were captured from the source brief
  dated 2026-08-23 and have not been re-fetched. They are marked unverified until checked.

[Unreleased]: https://github.com/RagnarPitla/Agent-Spark/commits/main

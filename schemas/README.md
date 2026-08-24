# Schemas

JSON Schema definitions that make the rules in this repository enforceable instead of aspirational.
Every one is [draft 2020-12](https://json-schema.org/draft/2020-12/release-notes).

`scripts/validate.mjs` checks every manifest in the repository against these, and CI runs it on every
push and pull request. A rule that is written in prose but not encoded here is a suggestion.

| Schema | Validates | Files it applies to |
| --- | --- | --- |
| [template.schema.json](template.schema.json) | Template manifests | `templates/*/template.yaml` |
| [skill.schema.json](skill.schema.json) | Skill contracts | YAML front matter in `skills/*/SKILL.md` |
| [evaluation.schema.json](evaluation.schema.json) | Evaluation suites | `evals/*.yaml` and `*.eval.yaml` with `kind: EvaluationSuite` |
| [agent-project.schema.json](agent-project.schema.json) | Generated projects | `agentspark.yaml` |

## Constraints that exist for a reason

These are the ones that will look arbitrary until you hit them.

**`publishByDefault` is `const: false`.** Not a default, a constant. A template cannot ship with
publishing enabled, because the schema will not accept any other value. CI greps for it too, on the
assumption that anyone determined enough to edit the schema deserves a second obstacle.

**`doNotUseWhen` requires at least one entry.** A skill that never declines gets invoked for things
it is wrong about. The boundary is part of the contract, not an optional extra.

**`acceptance.minPassRate` is nullable, and `setBy` is required when it is set.** A threshold nobody
chose is a fabricated number wearing the costume of a decision. Every suite shipped here leaves it
`null` and says so, because the right value depends on a risk tolerance this repository does not
know.

**`relativePath` must start with `./` and must not contain `..`.** Enforced by schema and again by
the validator, which resolves the path and confirms it stays inside the repository.

**`owner` must match `^@[A-Za-z0-9-]+$`.** An unowned template is an abandoned template with better
marketing.

**`compatibility.verified` is a boolean that stays false** until someone records a round trip against
a real environment. Setting it true without one makes the manifest lie in a format a machine will
believe.

## Versioning

`$id` values are under `https://agentspark.dev/schemas/v1alpha1/`. That URL does not resolve. It is
an identifier, which is what `$id` is for, and the domain is not owned. See
[ADR-0004](../docs/adr/0004-project-name.md) for why nothing is being bought yet.

`v1alpha1` means breaking changes will happen without a deprecation period. When the schemas
stabilize, the version becomes `v1` and that stops.

## Changing a schema

A change that makes a previously valid file invalid is breaking, including adding a required
property, narrowing an enum, and adding a constraint to an existing property.

For any change: update the schema, update every affected manifest in this repository, run
`npm run validate`, and record the change in [CHANGELOG.md](../CHANGELOG.md). If it is breaking, say
so there in those words.

Do not relax a constraint to make a file pass. Fix the file. If the constraint is genuinely wrong,
change it deliberately and write down why, rather than as a side effect of getting CI green.

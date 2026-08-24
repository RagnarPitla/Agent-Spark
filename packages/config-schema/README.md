# config-schema

**Partly implemented, in a different place.** The schemas exist in
[`schemas/`](../../schemas/README.md) and the validator that runs them is
[`scripts/validate.mjs`](../../scripts/validate.mjs). This package would be the reusable library
form of what that script does inline.

## Responsibility

Own the four schema definitions and the validation behavior over them: template manifests, skill
contracts, evaluation suites, and generated projects.

Validation here means more than schema conformance. The existing validator also checks that declared
relative paths exist and stay inside the repository, that every `{{variable}}` in a template file is
declared, that pinned skills exist at the pinned version, and that a rendered project has no
unreplaced variables. Those are structural rules JSON Schema cannot express, and they are the ones
that catch real mistakes.

## Constraints

**Pure.** No network, no tenant. Validating a project is something you can do on a plane.

**Errors name the file, the path, and the fix.** `must match pattern "^@[A-Za-z0-9-]+$"` tells a
user that a machine is unhappy. Naming the field, the value, and what a valid value looks like tells
them what to type.

**Schema changes are versioned deliberately.** Adding a required property invalidates existing files
and is breaking. See [schemas/README.md](../../schemas/README.md).

## Relationship to scripts/validate.mjs

The script came first because it needed to run in CI before any package existed. If this package is
built, the script becomes a thin caller rather than a second implementation. Two validators that
disagree is worse than one validator in an awkward location.

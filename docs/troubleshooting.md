# Troubleshooting

Covers what exists today: the validator and the template content. CLI failure modes are listed at
the end as design notes, since there is no CLI to fail.

## Validator

### `npm run validate` fails on `[schema]`

A manifest does not match its schema. The message gives the JSON pointer and the rule.

```
[schema] skills/my-skill/SKILL.md
    /doNotUseWhen must NOT have fewer than 1 items
```

Read the schema in `schemas/` for the field. The stricter-looking rules exist for a reason:

| Rule | Why |
| --- | --- |
| `description` at least 20 characters | The orchestrator matches on this text. Three words do not distinguish one skill from another |
| `doNotUseWhen` at least 1 item | A skill that never declines gets selected for requests it cannot handle |
| `outputs` at least 1 item | A skill with no declared output has no contract to test against |
| `owner` matches `@handle` | Content with no owner goes stale and nobody notices |
| `publishByDefault` is const `false` | A template that ships publishing enabled will publish something by accident |

### `[references] ... does not exist`

A manifest names a file that is not there. Usually a rename that missed the manifest, or a path
written relative to the repository root instead of relative to the manifest.

Paths resolve from the directory containing the manifest, must begin with `./`, and cannot contain
`..`.

### `[references] uses {{x}} which is not declared in spec.variables`

A rendered template file uses a variable the manifest does not declare. Either add it to
`spec.variables`, or stop using it.

This also fires when documentation shows a generic placeholder in prose. Rephrase rather than
adding a fake variable. It fired exactly once during this repository's construction, on the
sentence "replace every `{{variable}}`" in a README.

### `[secrets] possible ...`

The scanner matched a credential shape. Two cases:

**It is a real secret.** Remove it. If it was committed, rotate it. Removing it in a later commit
does not remove it from history.

**It is a false positive.** Use an obvious placeholder: `${MY_VAR}`, `REPLACE_ME`, `your-value`, or
`example-...`. These are recognized and skipped. Do not weaken the pattern to make one file pass.

### `[ascii] line N col M: ...`

A non-ASCII typographic character. The message names the ASCII replacement.

These render as mojibake in terminals and in some GitHub views. The common sources are pasting from
a word processor, and models that emit em dashes and curly quotes by default.

Find them:

```bash
grep -nP '[^\x00-\x7F]' path/to/file.md
```

Emoji are allowed. Only the monochrome typographic substitutes are rejected.

### The validator passes but something is still wrong

It checks four things. It does not check whether instructions are good, whether an eval case is
meaningful, or whether a template matches how the platform actually behaves. Those need review and
a real environment.

## Template content

### The generated agent answers everything, including out-of-scope questions

The scope section of `instructions.md` is probably weakened or missing. Confirm the boundary
statement survived editing, then run the `out-of-scope-boundary-stated` case in
`evals/baseline.yaml`.

An agent that answers everything is not performing better. It is not distinguishing sourced answers
from generated ones.

### It says "I have no sources" to every question

No knowledge source is connected. Generation never connects one. Work through
`knowledge/README.md`.

This behavior is correct and useless, which is why the eval suite has a case for it: it catches a
template deployed before onboarding was finished.

### It cites documents that do not exist

Fabricated citations. Check that the guardrail against inventing sources is still in
`instructions.md`, and run `nonexistent-section-refused` and `covered-question-answered-with-citation`.

If the guardrails are intact and it still fabricates, the model or harness version changed.
Guardrail compliance is model behavior and does not carry forward automatically. Note the model
version in the compatibility matrix and re-run the whole suite.

### It answers from general knowledge when retrieval fails

A recurring regression, which is why `retrieval-failure-not-backfilled` is a permanent case rather
than a one-off. The instructions must state that a failed search produces a failure report, not an
unsourced answer.

### Users complain it is unhelpful because it refuses too much

Check whether the refusals are correct before loosening anything. If it is refusing questions its
sources do cover, the problem is retrieval or source coverage, not the guardrails.

If it is refusing correctly and users still object, the missing piece is usually
`{{escalationPath}}`. A refusal with a route forward reads as helpful; the same refusal without one
reads as obstruction.

### Variables left unreplaced

`grep -rn '{{' .` in the project directory. The validator catches this for anything under a
directory containing `agentspark.yaml`, and CI fails on it for `samples/`.

An agent whose instructions still say `{{escalationPath}}` will tell users to contact
`{{escalationPath}}`.

## CLI failure modes

Design notes. There is no CLI.

| Symptom | Intended handling |
| --- | --- |
| `pac` not found | `doctor` reports it and prints the install command. It does not install |
| `pac` too old for a needed command | Plan fails before execution, naming the command and the installed version |
| Not authenticated | Detected at plan time in `environment-connected` mode. `local-first` never checks |
| DLP blocks a connector | Reported with the policy name. Execution stops. No retry with a different connector |
| Push conflict | Both sides shown. No silent merge. Resolution is a human decision |
| Partial failure | Resume from the last checkpoint, not from the start |
| Wrong tenant targeted | Target identity displayed before every write. This is why environment comes from a variable rather than a committed file |

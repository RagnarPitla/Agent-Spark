# Templates

A template is a complete, opinionated starting point for a Copilot Studio agent: instructions,
pinned skills, an evaluation suite, deployment configuration, and a written statement of what it
deliberately does not do.

Templates in this repository are readable and copyable by hand. The generator that would render them
is not built yet, and the templates were written so that not having it costs you a find-and-replace
rather than the whole exercise. See the [root README](../README.md).

## Available templates

| Template | Risk profile | Purpose |
| --- | --- | --- |
| [knowledge-assistant](knowledge-assistant/) | read-only | Answers questions from a knowledge source and cites what it used |

One template. It is a reference implementation, not a catalog. Judge it on whether it is complete
enough to deploy, not on how much choice it offers.

## What a template directory contains

```
templates/<name>/
  template.yaml        required. The manifest, validated against template.schema.json
  README.md            what it does, what it costs, what it will not do
  instructions.md      the agent instruction body, with {{variables}}
  SECURITY-NOTES.md    required. The threat surface this template creates
  skills/              which skills are pinned, and why
  knowledge/           knowledge source configuration
  tools/               tool and connector configuration
  evals/               the baseline evaluation suite
  deployment/          environment and publish configuration
```

`SECURITY-NOTES.md` is required rather than encouraged. A template that produces a deployable agent
without stating what that agent can reach is asking an administrator to approve something nobody
wrote down.

## Rules the schema enforces

**Publishing is off, and cannot be turned on in a template.** `publishByDefault` is
`const: false` in [template.schema.json](../schemas/template.schema.json), so a template that sets
anything else does not validate. Publishing an agent makes it available to other people, and that is
a decision for the person deploying it.

**Knowledge sources are placeholders.** A template declares `kind: placeholder` and describes what
should go there. It does not connect a data source, because connecting one has permission, DLP, and
data residency consequences that a generator is not in a position to judge.

**Every `{{variable}}` must be declared.** The validator scans every file in the template for
variable syntax and fails if one is not in `spec.variables`. This caught a real bug during
development, where the template README used `{{variable}}` as an illustration in prose.

**`compatibility.verified` starts false.** It stays false until someone records a round trip against
a real environment. `knowledge-assistant` is currently false.

**Skills are pinned to exact versions.** Nothing auto-upgrades. See [skills](../skills/README.md).

## Using a template without the CLI

1. Copy the template directory.
2. Replace every `{{variable}}` with your value. `spec.variables` lists all of them with
   descriptions and defaults.
3. Read `SECURITY-NOTES.md` before deploying anything.
4. Set your own `acceptance.minPassRate` in the evaluation suite, and put your name in `setBy`.

[samples/contoso-knowledge-assistant](../samples/contoso-knowledge-assistant/) is exactly this,
already done, so you can see the output before doing the work.

## Adding a template

1. Create `templates/<name>/` with every part listed above.
2. Write `SECURITY-NOTES.md` early. It tends to change the design.
3. Set `verified: false` and leave it there until you have run the round trip.
4. Run `npm run validate`.
5. Open a proposal issue first if the template is substantial. See
   [the proposal form](../.github/ISSUE_TEMPLATE/template_proposal.yml).

A template that is not complete enough to deploy is worse than no template, because it looks like
progress. See [CONTRIBUTING.md](../CONTRIBUTING.md).

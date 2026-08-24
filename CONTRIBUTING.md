# Contributing to Agent Spark

## Before you start

The CLI does not exist yet. Contributions land in `docs/`, `schemas/`, `templates/`, `skills/`,
`samples/`, and `scripts/`. If you want to build the CLI, open a discussion first so the command
surface in [docs/prd.md](docs/prd.md) does not fork into two designs.

## Setup

```bash
npm install
npm run validate
```

`npm run validate` is the same check CI runs. Run it before you push and you will not be surprised.

## The four rules CI enforces

1. **Schema.** Every `template.yaml`, every `SKILL.md` front matter block, every eval suite, and
   every project manifest validates against its schema in `schemas/`.
2. **References resolve.** Every file path named inside a manifest exists on disk. A template that
   points at a missing `instructions.md` fails.
3. **No secrets.** The validator rejects content matching known key, token, and connection string
   shapes. If you need a credential in an example, use an obvious placeholder such as
   `${AZURE_CLIENT_SECRET}` or `REPLACE_ME`.
4. **ASCII-only Markdown.** Non-ASCII typographic characters render as mojibake in GitHub UI and
   in terminals. Use `-` not an em dash, `->` not an arrow, `"` not curly quotes, `...` not an
   ellipsis character, `>=` not the math symbol. Standard emoji are allowed.

## Contributing a template

A template is a complete, runnable scenario, not a fragment. Minimum contents:

```
templates/<name>/
  template.yaml        manifest: owner, version, compatibility, variables, files
  README.md            what it produces, variable checklist, how to use it by hand
  instructions.md      agent instructions with role, scope, boundaries, escalation
  skills/              skill references or inline skills
  knowledge/           knowledge contracts or explicit placeholders
  tools/               tool definitions, or a documented empty state
  evals/               baseline evaluation suite
  deployment/          deployment settings, publishing disabled by default
  SECURITY-NOTES.md    what this template can reach and what it must never do
```

Requirements that are checked in review, not by a script:

- **Owner.** A GitHub handle that will answer issues about this template.
- **Provenance.** Where the content came from. Original work, or a link plus a license that permits
  redistribution. Do not paste Microsoft Learn prose or internal material into this repository.
  Link to it instead.
- **Maturity label.** `experimental`, `beta`, or `stable`. Start at `experimental`.
- **Review date.** Templates go stale when the platform moves. Set a date you will re-check.
- **No customer identifiers.** No tenant IDs, environment URLs, real company names beyond obvious
  fictional placeholders such as Contoso, or real employee names.

## Contributing a skill

A skill is a reviewable package of behavior. See `skills/answer-with-sources/` for the reference
shape and [docs/prd.md](docs/prd.md) section 14 for the required elements.

Every skill needs positive, negative, and ambiguous examples. The negative examples matter more
than the positive ones: they are what stop the skill firing on requests it cannot safely handle.

## Commit and PR conventions

- One logical change per PR. A new template and a schema change are two PRs.
- Commit messages in the imperative: `Add case-triage template`, not `Added` or `Adding`.
- Fill in the PR template. The checklist is not decoration; reviewers use it.
- Breaking changes to a schema require an ADR in `docs/adr/` and a `CHANGELOG.md` entry.

## Provenance and licensing

By contributing you agree your contribution is licensed under [MIT](LICENSE) and that you have the
right to submit it. Do not contribute material you obtained under NDA, from an internal corporate
source, or from a license that forbids redistribution. If you are unsure whether you can
redistribute something, link to it rather than copy it.

## Review expectations

Maintainers aim to give first feedback within one week. A PR that fails `npm run validate` will not
be reviewed until it passes. That is not gatekeeping, it is the fastest path to a merge.

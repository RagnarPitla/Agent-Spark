## What this changes

<!-- One or two sentences. What is different after this merges. -->

## Why

<!-- The problem. If it fixes an issue, write "Fixes #123". -->

## Type

- [ ] Documentation
- [ ] New template
- [ ] New skill
- [ ] Change to an existing template or skill
- [ ] Schema change
- [ ] Validator or CI
- [ ] Other

## Checklist

- [ ] `npm run validate` passes locally
- [ ] No secrets, tokens, tenant IDs, environment URLs, or real customer names
- [ ] Markdown is ASCII-only. No em dash, arrow, curly quote, ellipsis character, or section sign
- [ ] Relative links resolve

### If this adds or changes a template or skill

- [ ] `owner`, `version`, `license`, `provenance`, `maturity`, and `reviewBy` are set
- [ ] `provenance` states original work, or links a source under a license that permits redistribution
- [ ] Version bumped, and dependents repinned if this is a breaking change
- [ ] Examples cover positive, negative, and ambiguous cases
- [ ] Evaluation cases added, including at least one that fails without this change
- [ ] `compatibility.verified` is false unless a real test run is recorded below

### If this changes a schema

- [ ] ADR added under `docs/adr/`
- [ ] `CHANGELOG.md` entry with a migration note
- [ ] Samples updated and still validating

### If this changes security-relevant behavior

Security-relevant means: a guardrail, a `doNotUseWhen` entry, a confirmation gate, a risk profile,
a `publish` default, or anything a template can reach.

- [ ] `SECURITY-NOTES.md` updated in the affected template
- [ ] Evaluation case added that fails if the control is removed

## Verification

<!--
Paste the validator output. If you tested against a real environment, say which, what you ran,
and what happened. "Looks good to me" is not verification.
-->

```
$ npm run validate

```

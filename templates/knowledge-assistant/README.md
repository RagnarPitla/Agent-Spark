# Knowledge Assistant

An agent that answers questions from approved internal sources, cites its evidence, and says so
when the sources do not cover the question.

Read-only. It attaches no write tools and cannot change anything in a system of record.

## Variable checklist

Replace these before use. Every one appears in `instructions.md`.

| Variable | Meaning | Example |
| --- | --- | --- |
| `{{agentName}}` | Project folder and identifier, lowercase and hyphens | `contoso-hr-assistant` |
| `{{displayName}}` | What users see | `HR Policy Assistant` |
| `{{businessTask}}` | One sentence, outcome not technology | `Answer HR policy questions from the employee handbook` |
| `{{audience}}` | Who asks it questions | `employees` |
| `{{knowledgeSourceName}}` | The approved source of truth | `Employee Handbook 2026` |
| `{{escalationPath}}` | Where a user goes when no source answers | `the People team via the HR request form` |
| `{{dataClassification}}` | Classification of the underlying knowledge | `internal` |
| `{{environmentMode}}` | `local-first` or `environment-connected` | `local-first` |

`escalationPath` is the one people skip. Without it the agent can detect that it has no answer but
cannot tell the user what to do next, which converts a useful gap report into a dead end.

## Using this template by hand

The CLI does not exist yet. This template is a plain folder, so use it directly:

```bash
cp -r templates/knowledge-assistant ./my-agent
cd my-agent
```

Then replace every placeholder from the checklist above. This file is the one exception: it keeps
its placeholders so the checklist above still reads as a checklist once you are done, so exclude it
from the substitution. On macOS or Linux:

```bash
grep -rl '{{' . | grep -v '^\./README\.md$' \
  | xargs sed -i '' 's/{{displayName}}/HR Policy Assistant/g'
```

Repeat per variable, then confirm nothing is left outside this file:

```bash
grep -rn '{{' . | grep -v '^\./README\.md:' || echo "all variables replaced"
```

Paste the resulting `instructions.md` into the Copilot Studio authoring surface, attach the
knowledge source you named in the checklist, and work through
`knowledge/README.md` before letting anyone use it.

## What gets generated

| Path | Contents |
| --- | --- |
| `instructions.md` | Role, scope, answer shape, boundaries, escalation |
| `skills/` | Attaches `answer-with-sources@0.1.0` |
| `knowledge/` | Onboarding checklist. No source is connected by generation. |
| `tools/` | Documented empty state. No write tools. |
| `evals/baseline.yaml` | Groundedness, refusal, missing-knowledge, tone, and safety cases |
| `deployment/deployment.yaml` | Publishing disabled, environment unset |
| `SECURITY-NOTES.md` | Reach, prohibitions, and the review trigger list |

## What it deliberately does not do

- **Connect knowledge.** Generation never uploads or links a data source. Connecting knowledge is a
  decision with permission and DLP consequences, so a human makes it.
- **Enable publishing.** `deployment.yaml` ships with `publish: false`, and the schema forbids a
  template from shipping otherwise.
- **Set an eval pass threshold.** `evals/baseline.yaml` has `minPassRate: null`. A threshold that
  did not come from your risk tolerance is a number invented to look rigorous.
- **Attach write tools.** Adding one changes the risk profile from `read-only` to a write profile
  and requires a named approver. See `tools/README.md`.

## Before anyone real uses it

1. Connect at least one knowledge source. Until then the agent honestly answers "I have no sources"
   to every question, which is correct and useless.
2. Run `evals/baseline.yaml`. Set `acceptance` yourself and record who set it and why.
3. Read `SECURITY-NOTES.md` and confirm the reach section matches what you actually connected.
4. Decide the escalation path is real. Test that the destination you set for `escalationPath`
   accepts requests from the audience you named.

## Provenance

Original work, MIT licensed. No text copied from Microsoft Learn, Microsoft internal material, or
any customer deliverable. Compatibility claims in `template.yaml` are marked `verified: false`
because no recorded round trip against a live environment exists yet.

# Samples

Realistic output, checked by CI. When a schema changes and the samples stop validating, the change
had consequences the author did not intend.

| Sample | Source template | What it shows |
| --- | --- | --- |
| [`contoso-knowledge-assistant`](contoso-knowledge-assistant/) | `knowledge-assistant@0.1.0` | A rendered project manifest, rendered instructions with every variable replaced, a pinned skill, and a baseline eval suite |

## contoso-knowledge-assistant

What a `knowledge-assistant` project looks like after the wizard, for a fictional company with an
HR policy handbook.

```
contoso-knowledge-assistant/
  agentspark.yaml                     project manifest, validated against agent-project.schema.json
  instructions.md                     rendered, with every variable replaced
  skills/answer-with-sources/         pinned at 0.1.0, pointer rather than a copy
  evals/baseline.yaml                 validated against evaluation.schema.json
```

Details worth noticing, because each one is a decision rather than an accident:

- `deployment.environment` is `null` and `publish` is `false`. Generation binds no tenant.
- The knowledge source is `kind: placeholder`. Named, classified, and not connected.
- Its `location` is `${CONTOSO_HANDBOOK_SITE_URL}`, not a literal site URL. A committed tenant URL
  is how a cloned repository pushes to the wrong place.
- `tools` is empty. Read-only.
- `governance.owner` names a team, not a person, so the entry survives someone changing jobs.
- `governance.reviewBy` is three months out. Agents drift when the policy behind them changes.

## Adding a sample

Samples are validated in CI, so a broken one blocks the build. That is the reason they exist.

1. Generate or hand-write the project under `samples/<name>/`.
2. Replace every variable. `grep -rn '{{' samples/<name>/` must return nothing.
3. Use `Contoso` or another obviously fictional name. No real company, customer, tenant, or person.
4. Use environment variable placeholders for anything environment-specific.
5. Run `npm run validate`.

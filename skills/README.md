# Skills

A skill is a named, versioned, testable behavior contract. It says what the agent should do in a
situation, what it must not do, and how you would know whether it worked.

Skills are the reusable half of this repository. A template is a starting point you use once per
project. A skill is a behavior you want to be identical across every project that claims to have it,
which is why skills are pinned by version and never auto-upgraded.

## Available skills

| Skill | Version | Purpose |
| --- | --- | --- |
| [answer-with-sources](answer-with-sources/) | 0.1.0 | Answer only from retrieved knowledge, cite what was used, and say so when the sources do not cover the question |

One skill. It is the reference implementation, and the point of it is to show the shape of a
complete skill rather than to be a library.

## What a skill directory contains

```
skills/<name>/
  SKILL.md            required. YAML front matter plus the instruction body
  examples/           positive, negative and ambiguous cases
  evals/              an evaluation suite, validated against evaluation.schema.json
  resources/          optional supporting material
```

`SKILL.md` front matter is validated against
[skill.schema.json](../schemas/skill.schema.json). The body below the front matter is the text an
agent actually receives.

The three example files are not decoration. `positive.md` shows the skill working, `negative.md`
shows it correctly declining, and `ambiguous.md` shows the case where the right answer is to ask
rather than guess. The third one is where most skills fail, and it is the one people skip writing.

## The parts that matter

**`doNotUseWhen` is required and must have at least one entry.** A skill without stated boundaries
gets routed requests it will answer confidently and wrongly. Writing the boundary is how you find out
the skill is actually two skills.

**Guardrails are behavioral, not decorative.** `answer-with-sources` has seven. Each one is a
sentence an agent can act on, not a value statement. "Be accurate" is not a guardrail. "If the
retrieved passages do not answer the question, say so and stop" is.

**Evaluation suites ship with `acceptance.minPassRate: null`.** The suite tells you what to measure.
It does not tell you what score is good enough, because that depends on what happens when the agent
is wrong, and this repository does not know your consequences. Set it yourself, and name yourself in
`setBy` when you do. The validator enforces that pairing.

## Using a skill

Templates pin skills by exact version:

```yaml
skills:
  - name: answer-with-sources
    version: 0.1.0
```

Nothing upgrades on its own. A skill version change alters agent behavior, and behavior changes
should be a decision with a diff attached, not something that arrives because a resolver preferred a
newer number.

## Versioning

Semantic versioning, applied to behavior rather than to code shape.

- **Major** when existing behavior changes: a guardrail is removed or loosened, `doNotUseWhen`
  narrows, or the instruction body changes what the agent does in a case it already handled.
- **Minor** when behavior is added without changing what exists.
- **Patch** for wording that does not change behavior. Be suspicious of this one. Prompt text is
  executable, so "just wording" is a claim the evaluation suite should be made to support.

## Adding a skill

1. Create `skills/<name>/` with all four parts above.
2. Write `doNotUseWhen` before writing the instruction body. Defining what the skill refuses first
   usually reveals that the scope is wrong.
3. Write the evaluation suite before deciding the skill works.
4. Run `npm run validate`.
5. Open a pull request using [the template](../.github/PULL_REQUEST_TEMPLATE.md).

See [CONTRIBUTING.md](../CONTRIBUTING.md).

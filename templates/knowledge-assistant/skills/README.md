# Skills attached to {{displayName}}

| Skill | Version | Access | Source |
| --- | --- | --- | --- |
| `answer-with-sources` | 0.1.0 | read | Agent Spark catalog |

## answer-with-sources

Answers a factual question from approved knowledge, cites the evidence, and reports gaps rather
than guessing. Read-only. It cannot write anything.

Its full contract, including the conditions under which it must not fire, is in the catalog at
`skills/answer-with-sources/SKILL.md`.

The part worth reading before you change anything: `doNotUseWhen`. Those four conditions are what
stop the skill answering write requests, opinion requests, predictions, and personal data lookups.
Loosening them is a security change.

## Adding another skill

1. Pick from the catalog, or author one following `CONTRIBUTING.md`.
2. Pin it as `name@semver`. An unpinned skill silently changes behavior when the catalog moves.
3. Add it to `spec.skills` in the project manifest.
4. Check the trigger boundaries against the skills already attached. Two skills with overlapping
   descriptions produce nondeterministic routing, and the symptom looks like a model quality
   problem rather than a configuration one.
5. Add non-trigger evaluation cases for each new skill, covering the requests the *other* skill
   should have taken.

## Version pinning

Skills are pinned deliberately. When the catalog publishes `answer-with-sources@0.2.0`, this
project keeps using `0.1.0` until someone changes the pin and reruns the evaluations.

Silent upgrades of behavior contracts are how an agent that passed review in March starts refusing
differently in June.

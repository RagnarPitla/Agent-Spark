# Security model

For vulnerability reporting see [SECURITY.md](../SECURITY.md). This document describes the design.

## Threat model

Agent Spark ships content, not a service. That shapes what can go wrong.

| Threat | Who | Control |
| --- | --- | --- |
| Secret committed in a template or sample | Contributor, by accident | Pattern scan in `scripts/validate.mjs`, enforced in CI |
| Malicious template writes outside the project | Contributor, deliberately | Path pattern in the schema, plus a boundary check in the validator |
| Template ships with publishing enabled | Contributor, by accident | `publishByDefault` is a schema const of `false`, plus a CI grep |
| Prompt injection through a knowledge source | Anyone who can edit a connected document | Instruction-level guardrails, an eval case, and upstream source control |
| Confidential material in a public repository | Contributor converting a customer agent | Contribution checklist, review, and the scrubbing step in Journey C |
| Dependency compromise | Upstream | Lockfile, `npm ci` in CI, minimal dependency count |
| Wrong tenant targeted | User, from a cloned repo | Environment set by variable, never committed; target identity shown before any write |
| Silent behavior change after review | The catalog moving | Version pinning. Nothing auto-upgrades |

The prompt injection row is the one with the weakest control, and it is worth being explicit about
why. The instruction guardrails and the eval case reduce the probability. They do not eliminate it,
because the mitigation depends on model behavior and model behavior changes between versions. The
durable control is upstream: connect only sources whose editor list you would trust with the
agent's permissions.

## Secrets

No credential belongs in this repository or in a generated project.

Templates reference environment variables or an approved secret store. `sensitive: true` on a
variable or a skill input means the value never reaches generated files, reports, or logs.

The validator scans every tracked file for known credential shapes: Azure account and shared access
keys, GitHub tokens, API secret keys, Slack tokens, private key blocks, JSON Web Tokens, and
assignments to `client_secret`, `password`, `api_key`, and similar. Obvious placeholders such as
`${VAR}`, `REPLACE_ME`, `your-value`, and `example` are allowed.

This is a net, not a guarantee. It catches shapes it knows. A secret in an unrecognized format
passes, which is why review is still required.

## Consent and elevation

Agent Spark does not modify a developer machine without being asked.

`doctor` detects and reports. It does not install. When installation is offered, the user sees the
exact command that would run and can decline and run it themselves. Where administrator or root
access is needed, Agent Spark states why and offers the manual alternative rather than escalating.

The reasoning: a tool that installs software unasked gets uninstalled, and the trust does not come
back.

## Separation of generation and environment writes

Generation is a local, offline operation. It contacts no tenant, uploads no data, and needs no
authentication.

Environment operations are separate, explicit, and gated:

| Gate | Effect |
| --- | --- |
| `requireValidationBeforePush` | Local validation must pass first |
| `requireEvaluationRunBeforePublish` | Evaluations must have been run |
| `requireExplicitConfirmationForPublish` | A human confirms, every time |
| `requireExplicitConfirmationForDelete` | A human confirms, and sees the target identity |
| `showTargetIdentityBeforeWrite` | The environment and agent are displayed before any write |

`local-first` mode skips all of it. A user can generate, validate, and evaluate a complete project
without ever authenticating.

## Least privilege

Templates declare a risk profile. `read-only` templates attach no write tools, which means there is
nothing for a confirmation gate to guard.

`knowledge-assistant` still sets `requiresHumanConfirmationForWrites: true` despite having no write
tools. That is deliberate: when someone later attaches a write tool, they inherit a guarded default
rather than an unguarded one. A security default that only appears when it is needed is a default
that will be missing when it is needed.

Moving a template to `low-write` or `high-write` requires updating the risk profile, the
instructions, the security notes, and the evaluations. `high-write` requires a named approver.

## Knowledge and data handling

Generation never connects, uploads, or indexes a data source. Connecting a source has permission,
DLP, and residency consequences a generator cannot evaluate, so a human makes that decision after
working through the onboarding checklist.

Every declared knowledge source carries a data classification. Templates ship with `placeholder`
sources so the intent is recorded and the action is deferred.

Agent responses inherit the reach of the connection. Two checks that are easy to skip and expensive
to skip: everyone in the audience must be entitled to see everything in the source, and everyone
who can edit the source is effectively inside the agent's trust boundary.

## Telemetry

None is collected today, because there is nothing to collect it from.

When the CLI exists, telemetry will be opt-in and will carry no customer content. The permitted
event shape is operational only: command name, exit status, duration, error class, Agent Spark
version, and OS family.

Never permitted: agent names, business task text, instructions, knowledge source names or contents,
environment identifiers, tenant identifiers, user principal names, file paths outside the project,
or any variable marked sensitive.

The setting will be inspectable and reversible from the CLI, and the exact payload will be
printable so users can verify the claim rather than trust it.

## Provenance

Every template and skill records where its content came from: original work, or a source with a
license that permits redistribution. The field is required by the schema, so content without a
provenance statement does not validate.

The rule for Microsoft documentation is to link, not copy. That avoids a licensing question and
also avoids documentation that silently goes stale in a fork.

## Supply chain

The repository has three runtime dependencies: `ajv`, `ajv-formats`, and `yaml`. CI uses `npm ci`
against the lockfile.

Keeping the dependency count low is a security decision as much as a performance one. Each
dependency is a party that can change what the validator does.

## Boundaries this project will not cross

- No bypassing tenant administration, DLP, authentication, licensing, consent, or approval.
- No undocumented or reverse-engineered interfaces.
- No retry-with-a-different-connector when a policy refuses an action. A refusal is reported and
  execution stops.
- No auto-upgrade of a behavior contract.
- No fabricated acceptance threshold, because a number that looks decided is worse than an absent
  one.

# Compatibility

## How to read this document

Two kinds of statement appear here, and they are labelled:

- **Verified.** Someone ran it and recorded the result.
- **Intended.** A design target with no test behind it.

Statements about the Copilot Studio platform are mostly still **intended**. Two exceptions: the
`pac copilot` command surface was verified against the published reference on 2026-08-24, and on
2026-08-25 `pac copilot init` was run against a live environment and its behaviour recorded below.
Phase 0 in the [PRD](prd.md) exists to convert the rest.

## This repository

**Verified**, on the machine where the repository was built:

| Requirement | Version | Notes |
| --- | --- | --- |
| Node | 20 or later | `npm run validate` uses ESM and `node:` imports |
| npm | 9 or later | Lockfile v3 |

The validator has no platform-specific behavior. It reads files and matches patterns.

**Intended**, not yet verified: Windows and Linux. CI runs `ubuntu-latest`, so Linux becomes
verified on the first successful workflow run. Windows needs someone to run it and say so.

## Agent Spark CLI

Nothing to state. It does not exist.

The target is Windows, macOS, and Linux, with OS-specific adapters and documented exceptions. The
implementation language is open decision 2 in the [PRD](prd.md), and it is partly a compatibility
decision: a single self-contained binary avoids a runtime prerequisite, while a package-manager
install is easier to distribute and update.

## Power Platform CLI

**Command surface verified 2026-08-24** against the
[published reference](https://learn.microsoft.com/en-us/power-platform/developer/cli/reference/copilot)
(page `ms.date` 2026-02-25, updated 2026-07-10). **Behavior against a real environment is still
intended**, and that distinction matters: knowing a command exists is not knowing what it does to a
tenant. See [official-resources.md](official-resources.md) for what was checked.

The design does not pin a minimum version. It discovers capability at runtime by reading the
version and parsing help output, then caches the result keyed by version. See
[architecture.md](architecture.md).

That approach is chosen precisely because a pinned minimum would be a guess. What it costs: help
output is not a stable API, so parsing it is fragile and the parser needs its own tests against
recorded output from several versions.

### Verified behavior that constrains the design

Rows marked 2026-08-25 were observed against a live environment (`pac` 2.11.2, macOS). The rest
were read from the published reference.

| Finding | Consequence |
| --- | --- |
| `init --environment` scaffolds, packs, imports, connects, **and publishes** (2026-08-25) | The reference documents four actions. There is a fifth. It lands asynchronously, minutes after the command exits successfully, so there is no moment at which an unpublished agent exists to inspect |
| `init` without `--environment` writes nothing to Dataverse (2026-08-25) | Verified across five runs: the environment's agent count did not move and no scaffold reached the tenant. ADR-0002 rule 2 depends on this, so it is now a measured fact rather than an inference from the docs |
| `init --instructions` cannot accept a value containing a newline (2026-08-25) | Fails with `Parse failed on: ## Role`. The CLI re-parses a reconstructed command string rather than reading argv, so a correctly quoted multi-line argument still splits. A single-line value with spaces works. Generated instruction files cannot be passed this way |
| `pac copilot status` fails on this environment (2026-08-25) | Queries `componentstate_Property`, which the `bot` entity does not expose. Not a permissions problem. Do not build a status check on it |
| `pac copilot list` output is not safe to parse (2026-08-25) | The table builds its header from whichever attributes the first row has non-null, so later rows gain unlabelled columns. Filter server-side instead |
| `push` stops on a server-side change and directs you to pull | Presented as a conflict with both sides visible. Never auto-pulled |
| `clone` refuses to write into a non-empty target folder | Surfaced at plan time rather than failing mid-execution |
| `delete` requires `--confirm` / `-y` | Target identity is displayed before the prompt |
| `model list` / `predict` / `prepare-fetch` exist | Absent from the source brief. No proposed use yet |

### What Phase 0 still has to answer

1. Whether workspace commands behave differently for GitHub Copilot harness agents than for
   standard harness agents.
2. Which commands are preview, and what the preview policy implies for a tool that wraps them.
3. Whether `pac copilot push` also triggers a publish, the way `init --environment` does. Not yet
   run.

**Closed 2026-08-25 by running it.** `pac copilot init` writes sixteen files: `agent.mcs.yml`,
`settings.mcs.yml`, `icon.png`, and thirteen system topics under `topics/`. The old question 4,
what the commands do against a live environment rather than what the reference says, is answered
for `init` and open for the rest.

**Question 2 was the documentation half of the old question and it is now closed. The workspace
format is INCIDENTAL.** Microsoft's VS Code extension repository ships a placeholder file admitting
official workspace documentation does not exist, the Copilot Studio YAML schema is published under
"may change without notice", and four Microsoft sources disagree on the file names. Evidence and
sources: [.research/pac-workspace-format.md](../.research/pac-workspace-format.md).

The consequence, which is now a constraint rather than a risk: ADR-0002 rule 2 forbids generating
workspace files directly. Agent Spark must scaffold with `pac copilot init` run without
`--environment`, the only path documented to require no sign-in and write nothing to Dataverse, and
must never synthesize the sync metadata that `pull` and `push` rely on.

Three questions were closed on 2026-08-24: which commands exist, what a `push` conflict looks
like, and whether the workspace format is documented. All three are recorded above.

## Harness compatibility

**Intended.** `knowledge-assistant` declares `github-copilot` and `standard`, with
`compatibility.verified: false`.

That flag stays false until a recorded round trip exists. Setting it true without one would make
the manifest lie in a machine-readable way, which is worse than an honest false, because tooling
downstream would believe it.

**Verified 2026-08-24:** the three harnesses bill differently. The GitHub Copilot harness uses
usage-based Copilot Credits. The standard and Copilot chat harnesses are licence-based. A tool that
picks a harness for a user is therefore picking their cost model, which is why harness choice is
explicit and the billing implication appears in the plan before anything runs. See
[official-resources.md](official-resources.md) and
[ADR-0003](adr/0003-plan-first-execution.md).

## Preview features

Preview interfaces change without the compatibility guarantees of released ones.

Rules, once there is code to apply them to:

- Anything preview is pinned to the version it was tested against.
- Users see a warning naming the preview feature and what could change.
- No preview interface sits on a path a user cannot avoid.
- A preview interface that breaks is a compatibility bug, not a defect in the platform.

## Version pinning

| Artifact | Pinned by | Upgraded by |
| --- | --- | --- |
| Template | `metadata.template` in the project manifest | A human editing the pin |
| Skill | `spec.skills` in the template manifest | A human editing the pin |
| Schema | `apiVersion` in every manifest | A migration, announced in the changelog |
| Dependencies | `package-lock.json` | `npm update`, reviewed |

Nothing upgrades itself. `agentspark update` will show what is available and what changed, and stop
there.

## Deprecation

| Stage | What happens |
| --- | --- |
| Marked deprecated | `maturity: deprecated`, `deprecatedBy` names the replacement. The schema requires it |
| Announced | A `CHANGELOG.md` entry at least one release before removal |
| Removed | In the next major release |

Content whose `reviewBy` date has passed by more than six months is marked stale. See
[GOVERNANCE.md](../GOVERNANCE.md).

## Compatibility matrix

Filled in as things are verified. Empty rows are honest.

| Component | Windows | macOS | Linux | Verified on |
| --- | --- | --- | --- | --- |
| Validator | intended | verified | intended | 2026-08-24, macOS |
| CLI | not implemented | not implemented | not implemented | |
| `knowledge-assistant` round trip | not tested | not tested | not tested | |

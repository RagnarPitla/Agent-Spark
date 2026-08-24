# Compatibility

## How to read this document

Two kinds of statement appear here, and they are labelled:

- **Verified.** Someone ran it and recorded the result.
- **Intended.** A design target with no test behind it.

Statements about the Copilot Studio platform are mostly still **intended**. One exception, added
2026-08-24: the `pac copilot` command surface has been verified against the published reference.
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

| Finding | Consequence |
| --- | --- |
| `init --environment` scaffolds, packs, imports and connects | It is a tenant write behind a local-sounding name. Gated like a publish, and off the default path |
| `push` stops on a server-side change and directs you to pull | Presented as a conflict with both sides visible. Never auto-pulled |
| `clone` refuses to write into a non-empty target folder | Surfaced at plan time rather than failing mid-execution |
| `delete` requires `--confirm` / `-y` | Target identity is displayed before the prompt |
| `model list` / `predict` / `prepare-fetch` exist | Absent from the source brief. No proposed use yet |

### What Phase 0 still has to answer

1. Whether workspace commands behave differently for GitHub Copilot harness agents than for
   standard harness agents.
2. What `pac copilot init` actually writes to disk. The documentation question below is now
   answered; this is the part that still needs an installed `pac`, because no Microsoft page
   enumerates the files.
3. Which commands are preview, and what the preview policy implies for a tool that wraps them.
4. What the verified commands actually do against a live environment, as opposed to what the
   reference says they do.

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

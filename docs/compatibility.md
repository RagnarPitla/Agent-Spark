# Compatibility

## How to read this document

Two kinds of statement appear here, and they are labelled:

- **Verified.** Someone ran it and recorded the result.
- **Intended.** A design target with no test behind it.

Everything about the Copilot Studio platform in this document is currently **intended**. Phase 0 in
the [PRD](prd.md) exists to convert it.

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

**Intended.** No claim in this section has been checked against an installed `pac`.

The design does not pin a minimum version. It discovers capability at runtime by reading the
version and parsing help output, then caches the result keyed by version. See
[architecture.md](architecture.md).

That approach is chosen precisely because a pinned minimum would be a guess. What it costs: help
output is not a stable API, so parsing it is fragile and the parser needs its own tests against
recorded output from several versions.

### What Phase 0 has to answer

1. Which `pac copilot` commands exist in the current release, with their exact parameters.
2. Whether workspace commands behave differently for GitHub Copilot harness agents than for
   standard harness agents.
3. What the on-disk workspace format is, and whether it is documented or incidental.
4. Which commands are preview, and what the preview policy implies for a tool that wraps them.
5. What a `push` conflict actually looks like, so the adapter can present it rather than surface a
   raw exit code.

Question 3 matters most. If the workspace format is incidental rather than documented, generating
into it is building on something that can change without notice, and the design has to route
through supported commands instead of writing workspace files directly.

## Harness compatibility

**Intended.** `knowledge-assistant` declares `github-copilot` and `standard`, with
`compatibility.verified: false`.

That flag stays false until a recorded round trip exists. Setting it true without one would make
the manifest lie in a machine-readable way, which is worse than an honest false, because tooling
downstream would believe it.

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

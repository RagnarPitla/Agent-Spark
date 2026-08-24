# telemetry

**Not implemented.** Contract only.

Local logging, off unless switched on.

## Responsibility

Write a structured local log of what Agent Spark did, so a user can reconstruct a run, attach
evidence to a change request, or file a useful bug report.

## Constraints

**Off by default.** Not off-by-default-with-a-prompt-that-defaults-to-yes. Off.

**Local only.** Nothing is transmitted anywhere. There is no endpoint, no collection service, and no
account. This package writes files to the user's own machine and stops.

If usage data is ever wanted, that is a separate feature, requiring separate consent, a published
schema of exactly what is collected, and its own ADR. It is not something this package grows into
quietly.

**Redacted at write time, not at read time.** Environment identifiers, user principal names, tenant
identifiers, connection strings, and command output that may contain them are redacted before they
reach the file. Redacting on export means the unredacted version existed on disk, and the export path
is not the only way a file gets shared.

**Deletable.** One documented command removes everything the tool has written. A log a user cannot
find is a log they cannot delete.

**Never in the critical path.** A logging failure does not fail a run and does not block execution.

## Why it exists at all

Debugging a failed deployment against a tenant you cannot see is nearly impossible without a record
of what was attempted. That is a real need, and the honest way to meet it is a local file the user
controls, rather than a collection pipeline justified by the same need.

See [SECURITY.md](../../SECURITY.md).

# Official resource index

Starting points for anyone implementing against Copilot Studio or the Power Platform CLI.

## Verification status

Two categories. The distinction matters, because an unverified link in a design document becomes an
assumption in the code that follows it.

- **Verified 2026-08-24.** Fetched and read while building this repository. Facts drawn from them
  are quoted below.
- **From the source brief.** Listed in the 2026-08-23 concept brief and not re-fetched here.
  Treat as a pointer, not as a citation.

Re-verify before each release. Preview documentation changes without notice.

---

## Verified 2026-08-24

### PAC CLI copilot command group

https://learn.microsoft.com/en-us/power-platform/developer/cli/reference/copilot

Page metadata: `ms.date` 2026-02-25, last updated 2026-07-10.

The documented workspace loop:

1. Start a workspace with `pac copilot init` (scaffold new) or `pac copilot clone` (download
   existing). Both produce a local workspace carrying the sync metadata the other commands need.
2. `pac copilot pull` brings remote changes down and merges them, so edits start from server state.
3. `pac copilot push` sends local changes back. **If the same item changed on the server, push stops
   and asks you to pull first.**
4. `pac copilot pack` turns a workspace into a solution `.zip` for `pac solution import`.

`pac copilot init --environment` scaffolds, packs, imports, and connects in one step.

Full documented command list:

| Command | Description |
| --- | --- |
| `pac copilot clone` | Clone an agent to a local workspace directory |
| `pac copilot create` | Create a new copilot from an existing template file |
| `pac copilot delete` | Delete a custom copilot |
| `pac copilot extract-template` | Extract a template file from an existing copilot |
| `pac copilot extract-translation` | Extract localized content for one or more bots |
| `pac copilot init` | Create a new agent workspace from a template |
| `pac copilot list` | List copilots in the current or target environment |
| `pac copilot mcp` | Information about the local MCP server |
| `pac copilot merge-translation` | Merge localized content for one or more bots |
| `pac copilot model list` | AI Builder models in the current environment |
| `pac copilot model predict` | Send text or a prompt to an AI model |
| `pac copilot model prepare-fetch` | Prepare LLM-produced FetchXML for execution |
| `pac copilot pack` | Package a workspace into a solution zip |
| `pac copilot publish` | Publish a custom copilot |
| `pac copilot pull` | Pull remote changes and merge with the local workspace |
| `pac copilot push` | Push local workspace changes |
| `pac copilot quarantine` | Quarantine status of an agent |
| `pac copilot status` | Poll deployment status |

Details worth designing against:

- `clone` requires an authenticated profile from `pac auth create`, and resolves the environment
  from `--environment` or the active profile's organization.
- `clone` writes into a subfolder named after the agent's sanitized display name. **If that folder
  already contains files, clone stops rather than overwriting.** `--display-name` picks a different
  folder name.
- `--bot` accepts either a Copilot ID GUID or a schema name.
- `delete` takes `--confirm` / `-y` as a switch. Without it, deletion does not proceed.
- `create` requires `--displayName`, `--schemaName`, `--solution`, and `--templateFileName`, where
  the template file came from `extract-template`.

Three corrections to the source brief this produced:

1. The brief omitted the `pac copilot model` subcommands entirely.
2. The brief described `init` as workspace creation. The documentation adds that
   `init --environment` also packs, imports, and connects, which is a much larger action than the
   name suggests and needs its own confirmation gate.
3. The brief treated push conflict handling as unknown. It is documented: push stops and directs
   the user to pull.

### Choose a harness

https://learn.microsoft.com/en-us/microsoft-copilot-studio/harnesses-overview

Page metadata: `ms.date` 2026-07-28, last updated 2026-08-03.

A harness is the runtime between your design and the model. It decides when to call the model, what
components to send, how to interpret the response, and which tools to call.

| Harness | Powers | Billing |
| --- | --- | --- |
| GitHub Copilot | Agents and workflows for reasoning-heavy, multi-step work | Copilot Credits, usage-based |
| Standard | Rule-based agents and agent flows | Licensing-based |
| Copilot chat | Extending Microsoft 365 Copilot | Licensing-based |

The billing split is a design input, not a footnote. The PRD's plan review step includes a billing
notice specifically because a user choosing the GitHub Copilot harness is choosing usage-based
consumption, and that should be visible before generation rather than discovered afterwards.

---

## From the source brief, not re-fetched

| Resource | URL |
| --- | --- |
| Agents powered by the GitHub Copilot harness: overview | https://learn.microsoft.com/en-us/microsoft-copilot-studio/agents-experience/overview |
| Build an agent: Build tab overview | https://learn.microsoft.com/en-us/microsoft-copilot-studio/agents-experience/build-overview |
| Build a new agent | https://learn.microsoft.com/en-us/microsoft-copilot-studio/agents-experience/build-new-agent |
| Create an automated solution with natural language | https://learn.microsoft.com/en-us/microsoft-copilot-studio/create-automation-natural-language |
| Copilot Studio documentation hub | https://learn.microsoft.com/en-us/microsoft-copilot-studio/ |
| Install and configure Power Platform CLI | https://learn.microsoft.com/en-us/power-platform/developer/cli/introduction |
| Power Platform CLI command groups | https://learn.microsoft.com/en-us/power-platform/developer/cli/reference/ |
| PAC CLI built-in MCP server | https://learn.microsoft.com/en-us/power-platform/developer/howto/use-mcp |

---

## Rules for this index

**Link, do not copy.** Copied documentation raises a licensing question and goes stale invisibly in
a fork. Where a fact is load-bearing, quote the specific line and cite the page date, as above.

**Record the page date.** `ms.date` and the last-updated timestamp let a future reader tell whether
a claim predates a platform change.

**Say what you verified.** "Verified" means someone fetched the page and read it. Anything else is
a pointer.

**No internal material.** Enterprise search surfaced internal and shared materials relevant to this
design, including lab content, an implementation guide, a technical talk, and a developer guide.
None of it is in this repository, and none of it may be copied here. Internal knowledge can inform
what questions to ask. It cannot be a source.

## Review schedule

Re-verify before each release, and whenever a template's `reviewBy` date arrives. Move anything
newly checked into the verified section with its date, and correct the design documents that
depended on the old understanding.

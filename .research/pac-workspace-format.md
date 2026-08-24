# Is the `pac copilot` on-disk workspace format documented or incidental?

Research date: 2026-08-24. All URLs fetched and verified on that date unless marked otherwise.
Quotations from Microsoft sources have had non-ASCII dashes normalized to "-" to satisfy this
repo's ASCII validator. No other wording was changed.

---

## 1. VERDICT

**MIXED, and the layer that decides Agent Spark's design is INCIDENTAL.**

There are four distinct layers here and they do not have the same status. Conflating them is the
main way to get this question wrong.

| # | Layer | Status | Confidence |
|---|---|---|---|
| L1 | The workspace folder layout that `pac copilot init` writes | **INCIDENTAL** | High |
| L2 | The `.mcs.yml` agent definition file contents | **INCIDENTAL** (schema exists, is published, but is unversioned and explicitly disclaimed) | Medium-high |
| L3 | The Dataverse unpacked-solution YAML format | **DOCUMENTED** (formal reference page) but it is **not** the workspace format | High |
| L4 | `microsoft/AgentSchema` | **DOCUMENTED and versioned**, but it is a **different format** and is not what `pac copilot init` writes | High |

**The decisive single piece of evidence** is that Microsoft's own VS Code extension repository
contains a file whose entire purpose is to stand in for the workspace documentation that does not
exist yet. `microsoft/vscode-copilotstudio:docs/McsWorkspace.md:1-3` opens with:

> "This is a placeholder for workspace documentation. In the future, links to this page should be
> replaced with official MCS documentation. Official documentation should contain more details
> about the content of each files and instruction to generate templates."

That is Microsoft stating, in writing, that official documentation of the workspace format does not
currently exist and that the current description is a stopgap. It was committed 2026-03-19 and has
not been touched since, despite the repository being pushed as recently as 2026-08-21.

**Confidence: high for L1, medium-high for L2.**

**What would change my mind, specifically:**

1. A Microsoft Learn page with `ms.topic: reference` that enumerates the files `pac copilot init`
   writes and states what each one contains. Today no such page exists; the closest thing is a
   how-to page (L1 evidence below) whose own file tree disagrees with three other Microsoft sources.
2. `McsWorkspace.md` being replaced by a link to real documentation, which is the exact event that
   file predicts.
3. A published JSON Schema for `.mcs.yml` carrying a `$id` and a version, hosted at a stable
   Microsoft URL, and not shipped under an "experimental research project" disclaimer.
4. Any Microsoft statement of a compatibility or deprecation promise for the workspace layout. I
   found the opposite: an explicit "may change without notice" (L2 evidence below).

A caveat I want to be honest about: I could not verify what `pac copilot init` actually writes,
because that requires running it. Everything in L1 is inferred from documentation and from the
extension repo. See section 6.

---

## 2. What ADR-0002 rule 2 therefore requires

ADR-0002 rule 2 says: "No writing directly into a workspace format that is incidental rather than
documented. Where the format is not documented, route through supported commands."

L1 is incidental. Therefore, as a direct instruction to the implementer:

1. **Agent Spark must not write the workspace skeleton itself.** Do not create `agent.mcs.yml`,
   `settings.mcs.yml`, the `topics/`, `actions/`, `knowledge/` folders, or any sync-metadata file by
   writing bytes to disk. The workspace must be brought into existence by invoking
   `pac copilot init` (local scaffold mode, no `--environment`) or `pac copilot clone`.

2. **In particular, never synthesize the sync metadata.** The reference page states that `pull` and
   `push` "read the target environment from the workspace's sync metadata" and that running them
   outside such a workspace "fails fast with a 'workspace not found' error". The format of that
   metadata is documented nowhere. It is the single most incidental thing in the workspace and the
   most tempting to fake. Do not.

3. **Prefer `pac copilot init` without `--environment` as the generator entry point.** This is the
   one command in the group that is verified to be purely local: "The command doesn't create
   anything in Dataverse and doesn't require sign-in." That gives Agent Spark a supported way to
   produce a workspace with no tenant contact at all, which matters for the plan-first model in
   ADR-0003 and for the security posture generally.

4. **Treat `--template default|minimal` and `--authoring-mode classic|cli-copilot` as the only
   supported scaffold knobs.** These are the documented shape controls. If a user wants a shape the
   templates do not offer, that is a gap Agent Spark inherits, per the ADR's "Harder" consequence.

5. **Editing file *contents* after a supported scaffold is a weaker violation than creating the
   workspace, but it is still not safe.** L2 is also incidental. If Agent Spark writes topic or
   instruction YAML into a scaffolded workspace, it is betting on a schema that Microsoft says may
   change without notice. Recommended posture: allow content edits, but gate them behind validation
   against the schema shipped by the installed tooling rather than a schema vendored into Agent
   Spark, and warn that the format carries no compatibility promise. Do not present it as a stable
   contract in user-facing docs.

6. **Do not build on the hypothesis that this is a solution folder.** It is not. See section 4.

---

## 3. Evidence FOR "documented"

This is the honest case for the other side. It is real but it does not reach the bar ADR-0002 sets.

### 3.1 Learn publishes an agent file structure tree (OBSERVATION, not a spec)

`https://learn.microsoft.com/en-us/microsoft-copilot-studio/visual-studio-code-extension-edit-agent-components`
(`ms.date: 2026-01-13`, `updated_at: 2026-08-03`, `ms.topic: how-to`)

It has a section literally titled "Agent file structure" containing a folder tree with
`agent.mcs.yaml`, `settings.mcs.yml`, `connectioreferences.mcs.yml`, `icon.png`, and the folders
`actions/`, `knowledge/files/`, `topics/`, `workflows/`, `trigger/`.

Why this is an observation and not a specification:

- `ms.topic: how-to`, not `reference`.
- It describes what you get after cloning in VS Code. It never claims to define a format, never
  states which files are required, and gives no compatibility statement.
- **It is internally inconsistent.** The tree uses `.mcs.yml` for some files and `.mcs.yaml` for
  others (`agent.mcs.yaml` and `topics/greeting.mcs.yaml` versus `actions/GetItems.mcs.yml` and
  `settings.mcs.yml`). The "Best practices" section further down the *same page* then recommends a
  third convention entirely: `create-ticket.tool.yaml`, `.topic.yaml`, `.tool.yaml`, `.trigger.yaml`.
- One filename in the tree is misspelled: `connectioreferences.mcs.yml` is missing an "n". A
  normative format reference does not contain a typo in a filename, because the filename would be
  load-bearing.

### 3.2 Learn explicitly invites hand-authoring and AI authoring (STRONG, but about intent not format)

Same page, "Topics" section:

> "You can use GitHub Copilot or other agents to help build *new* components, or, if you want, write
> your own topics."

Same page, "Manage remote knowledge files":

> "If you want to upload new files, you can put them in the `knowledge/files` folder in the agent
> definition. When you apply those changes, they're uploaded via the agent contents upload feature."

`https://learn.microsoft.com/en-us/microsoft-copilot-studio/visual-studio-code-extension-overview`
(`ms.date: 2026-07-24`, `updated_at: 2026-08-03`):

> "Edit agent components by using the agent definition language in YAML or your favorite agent
> harness such as GitHub Copilot or Claude Code, as an alternative to the web UI"

This is genuine evidence that Microsoft *intends* the files to be edited by third-party tooling,
including AI tooling. It is the strongest card for the "documented" side. But note what it is not:
it is an invitation to edit files that already exist in a workspace the Microsoft tooling created.
It is not a specification of the workspace, and it is not permission to create one from nothing.
That distinction is exactly the one ADR-0002 rule 2 draws.

### 3.3 Learn documents source control and PR workflow for these folders (SUPPORTING)

Same overview page, and the extension is stated to be GA:

> "The Visual Studio Code extension for Copilot Studio is generally available (GA)."

> "Version control your agent definitions with Git and your choice of source control with Visual
> Studio Code / Review changes through pull requests / Track modifications over time"

Under the brief's item 6, this is meaningful evidence of a supported workflow. I weight it as
supporting rather than decisive, because committing tool-generated files to git is a workflow claim,
not a format contract. GA status attaches to the extension, not to the file layout.

### 3.4 A machine-readable schema for the YAML does exist and is public (PARTIAL)

- `microsoft/skills-for-copilot-studio:reference/bot.schema.yaml-authoring.json` - 856,549 bytes. I
  verified it is a real JSON Schema body: it opens with a `definitions` map containing
  `BotElement`, `ResponseTemplate`, `ValueExpression`, `ClosedListOptionSet`, and similar.
- `microsoft/vscode-copilotstudio:assets/BotSchema.json` - 220,064 bytes. I inspected the head and
  it is **not** the schema itself; it is a description/localization strings bundle, with keys of the
  form `$$SkillDefinition_description$$`. It still refers to "Power Virtual Agents", the pre-2023
  product name.

So a schema is published. That is real. Its limits are covered in 4.3.

### 3.5 The unpacked solution format IS formally documented (TRUE, but wrong layer)

`https://learn.microsoft.com/en-us/power-platform/alm/solution-source-control-yaml-format`
(`ms.date: 2026-04-07`, `updated_at: 2026-04-10`, **`ms.topic: reference`**)

This is a genuine format reference: required folder structure, manifest file semantics
(`solution.yml`, `solutioncomponents.yml`, `rootcomponents.yml`, `missingdependencies.yml`,
`publisher.yml`), format auto-detection rules, and a component-type support table. It even states a
minimum tool version: "YAML source control format support in the `pac` CLI requires
Microsoft.PowerApps.CLI version 2.4.1 or later."

This is what a documented format looks like. It is the correct benchmark against which the
Copilot Studio workspace should be judged, and the workspace does not meet it. See section 4 for
why this layer does not rescue the design anyway.

---

## 4. Evidence FOR "incidental"

### 4.1 Microsoft says the workspace documentation does not exist yet (DECISIVE)

`microsoft/vscode-copilotstudio:docs/McsWorkspace.md:1-3`, quoted in full in section 1.

Commit history for that path, retrieved via `gh api`:

```
f578bee5  2026-03-19T19:20:02Z  Initial commit for vscodeOMSplit
```

One commit. Never revised. The repository itself was last pushed 2026-08-21, so the file is stale by
choice, not by neglect of the repo. Repository metadata: `microsoft/vscode-copilotstudio`, MIT,
created 2025-03-20, 106 stars.

The layout it gives is also *shorter* than the Learn tree - it lists only `agent.mcs.yml`,
`settings.mcs.yml`, `icon.png (optional)`, `actions/`, `knowledge/`, `knowledge/files/`, `topics/`.
No `workflows/`, no `trigger/`, no `connectioreferences.mcs.yml`.

### 4.2 Four Microsoft sources give four different renderings of the file names (STRONG)

| Source | Agent file | Topic file |
|---|---|---|
| Learn, edit-agent-components, "Agent file structure" tree | `agent.mcs.yaml` | `topics/greeting.mcs.yaml` |
| Learn, edit-agent-components, "Best practices" section | not stated | `.topic.yaml` suffix convention |
| Learn, visual-studio-code-extension-synchronization, Agent Changes pane | `agent.yaml` | `topics/greeting.topic.yaml` |
| `microsoft/vscode-copilotstudio:docs/McsWorkspace.md` | `agent.mcs.yml` | `topics/` (unnamed) |

The synchronization page is at
`https://learn.microsoft.com/en-us/microsoft-copilot-studio/visual-studio-code-extension-synchronization`
(`ms.date: 2026-01-13`, `updated_at: 2026-08-03`) and shows this tree:

```
AGENT CHANGES
+- Agent 1
   +- Local Changes (1)
   |  +- topics/greeting.topic.yaml
   +- Remote Changes (1)
      +- agent.yaml
```

Four renderings, three different extensions for the agent file (`.mcs.yaml`, `.mcs.yml`, `.yaml`).
A generator cannot be written against this. That is the practical meaning of "incidental": the
prose is illustrative, so nobody has been holding it to a contract, so it has drifted.

### 4.3 Microsoft explicitly disclaims schema stability (DECISIVE for L2)

`microsoft/skills-for-copilot-studio:README.md` (repo pushed 2026-08-24, 416 stars, MIT), section
"Disclaimer":

> "This plugin is an experimental research project, not an officially supported Microsoft product.
> The Copilot Studio YAML schema may change without notice. Always review and validate generated
> YAML before pushing to your environment - AI-generated output may contain errors or unsupported
> patterns."

Its successor repo `microsoft/copilot-studio-plugin` (created 2026-05-26, MIT, 53 stars) repeats it
verbatim and adds a sentence:

> "This plugin is not meant for production use."

"May change without notice" is the exact negation of a compatibility promise. Both repos are in the
`microsoft` GitHub org, and both ship the tooling that authors this YAML. This is Microsoft, in a
Microsoft-owned repo, telling you not to depend on the format.

Supporting detail: the schema file itself is unversioned. `bot.schema.yaml-authoring.json` has no
`$schema` key, no `$id`, and no version field - it begins directly with `definitions`. Its commit
history is:

```
1838950f  2026-03-31  Update bot schema
46eac0ab  2026-02-27  Update schema definition
d187ab51  2026-01-13  first commit
```

Three revisions in under three months, with no version bump and no changelog. Compare L4, where
`microsoft/AgentSchema` files *do* carry `$schema: https://json-schema.org/draft/2020-12/schema` and
`$id`, and live under a `schemas/v1.0/` directory. Microsoft clearly knows how to version a schema
when it intends the schema to be depended on. It has not done that here.

### 4.4 NOTABLE ABSENCE: no Learn page describes what `pac copilot init` writes

`https://learn.microsoft.com/en-us/power-platform/developer/cli/reference/copilot`
(`ms.date: 2026-02-25`, `updated_at: 2026-07-10`, `ms.topic: generated-reference`)

This page is thorough about behavior and says nothing about files. The strongest statement it makes
is: "Writes the template files into the project directory and stops." It never names a single file.
The "Remarks" for `init` cover the empty-directory requirement, schema name derivation, bootstrap
behavior, and a warm-up race condition - all behavioral, none structural.

I confirmed this absence mechanically against the public docs source repo:

- `gh api "search/code?q=repo:MicrosoftDocs/power-platform+%22mcs.yml%22"` returns **0 results**.
  The string `mcs.yml` does not appear anywhere in the public Power Platform documentation source.
- `gh api "search/code?q=repo:MicrosoftDocs/power-platform+%22agent+workspace%22"` returns 3 files,
  all of which I read: `power-platform/developer/cli/reference/copilot.md` and its two includes
  `includes/copilot-init-intro.md` and `includes/copilot-pack-intro.md`. None enumerates files.

So the CLI that creates the workspace has documentation that never mentions the workspace's
contents, and the term used for the files in the other half of the documentation set does not appear
in this half at all.

### 4.5 NOTABLE ABSENCE: the sync metadata is never named or described

The reference page depends on it repeatedly:

> "`pull` and `push` read the target environment from the workspace's sync metadata, so they don't
> take an `--environment` argument."

> "The sync metadata written when the workspace is created is what tells them which agent and
> environment to talk to, so running them anywhere else fails fast with a 'workspace not found'
> error."

Its filename, location, and contents are documented nowhere I could find - not on Learn, not in
`McsWorkspace.md` (which does not mention it at all), and not in the public docs source repo. This
is the clearest example of a load-bearing file that exists purely as an implementation detail.

### 4.6 Microsoft's general stance on hand-editing extracted component files is negative

`https://learn.microsoft.com/en-us/power-platform/alm/use-source-control-solution-files`
(`ms.date: 2026-04-09`, `updated_at: 2026-04-10`), in an Important callout:

> "Except for the sections described in When to edit the customizations file, manual editing of
> extracted component files and .zip files isn't supported."

and:

> "As further customizations and changes are necessary for the solution, developers should edit or
> customize components through existing means, export again to create a .zip file, and extract the
> compressed solution file into the same folder."

Scope caveat, stated honestly: this page is about SolutionPackager output, which is L3, not the
Copilot Studio workspace. It is not a statement about `.mcs.yml`. I include it because it
establishes the house default in Power Platform ALM - generated component files are round-tripped
through tools, not hand-written - and because the newer Copilot Studio guidance in 3.2 is a
departure from it that has not yet been backed by a format spec.

### 4.7 The "it is just a solution folder" hypothesis is FALSE

The brief asked me to test this. It does not hold.

1. `pac copilot pack` exists and its documented job is "Package a Copilot Studio agent workspace
   into a solution zip file". If the workspace were already a solution folder, this command would be
   `pac solution pack`. The existence of a converting command implies two distinct formats.
2. The Learn extension overview draws the distinction explicitly: the extension gives you "access to
   the full agent definition (**and not just the solution file**)". Emphasis mine.
3. The documented solution YAML component-support table at
   `solution-source-control-yaml-format` lists entities, classic workflows, modern flows, canvas
   apps, environment variable definitions and values, custom connectors, plug-in assemblies, web
   resources, security roles, global option sets, dashboards, site maps, ribbons, and entity
   relationships. **It does not list bot, botcomponent, or any Copilot Studio agent component.**
   There is a catch-all "[other component folders]" in the tree, so this is not proof of absence in
   the product, but it is proof of absence in the documentation.
4. The observed workspace layout (`agent.mcs.yml`, `topics/`, `actions/`) shares no structure with
   the documented solution layout (`solutions/<name>/solution.yml`, `publishers/`, `entities/`).

Consequence: the documented L3 format does not provide a back door. Agent Spark cannot sidestep the
undocumented workspace by generating a documented solution folder instead, because the documented
solution format does not describe how to express an agent.

### 4.8 `microsoft/AgentSchema` is a different format, not this one

Repo metadata: created 2025-11-01, last pushed 2026-07-10, MIT, 23 stars, docs site at
`https://microsoft.github.io/AgentSchema/`. README:

> "AgentSchema is a client facing spec designed to make creating agents easier in a code first YAML
> file format." ... "Serve as an exchange format between MCS and Foundry (and hopefully more
> platforms in the future)." ... "This spec is a collaboration between Microsoft Copilot Studio and
> Microsoft Foundry."

It is properly versioned and specified: `schemas/v1.0/` contains 40+ files, and
`schemas/v1.0/AgentDefinition.yaml` begins:

```yaml
$schema: https://json-schema.org/draft/2020-12/schema
$id: AgentDefinition.yaml
type: object
properties:
  kind:
    anyOf:
      - type: string
        const: prompt
      - type: string
        const: hosted
      - type: string
        const: workflow
```

But its vocabulary is `prompt` / `hosted` / `workflow`, plus types like `PromptAgent`,
`ContainerAgent`, `FoundryConnection`, `McpTool`. The Copilot Studio workspace vocabulary is
`GptComponentMetadata`, `AdaptiveDialog`, `TaskDialog`, `KnowledgeSourceConfiguration`. These are
disjoint. A code search for "mcs" across the whole `AgentSchema` repo returns 4 hits, of which one is
the README sentence above and three are incidental matches inside `package-lock.json` and
`astro.config.mjs`.

Conclusion: AgentSchema is a forward-looking convergence effort, not a description of what
`pac copilot init` writes today. It is the thing to watch, because if the workspace ever converges
on it, L1 and L2 would become documented and this verdict should be revisited. It is not usable as
justification today.

---

## 5. The command surface

Every command below is verified against
`https://learn.microsoft.com/en-us/power-platform/developer/cli/reference/copilot`
(`ms.date: 2026-02-25`, `updated_at: 2026-07-10`). Commands marked TENANT contact a Dataverse
environment and require an auth profile from `pac auth create`.

| Command | What it does | Disk | Tenant | Notes |
|---|---|---|---|---|
| `pac copilot init` (no `--environment`) | Scaffold agent workspace from template | Writes | **No** | Doc: "doesn't create anything in Dataverse and doesn't require sign-in". Target dir must be empty. The safe generator entry point. |
| `pac copilot init --environment` | Scaffold, pack, import, connect | Writes | **YES - creates agent** | "Bootstrap creates server-side objects." Fails if schema name already exists. |
| `pac copilot clone` | Download existing agent to a workspace | Writes | **YES - reads** | Writes to a subfolder named after sanitized display name; that folder must be empty. |
| `pac copilot pull` | Merge remote state into local workspace | Writes | **YES - reads** | Three-way merge. "It writes to your local files." Requires sync metadata; no `--environment` arg. |
| `pac copilot push` | Upload local changes | Reads | **YES - mutates live agent** | "A successful push mutates the live agent." Blocks on conflict and tells you to pull. No-op if nothing changed. |
| `pac copilot pack` | Workspace -> solution `.zip` | Reads + writes | **No** | "It's a local operation... needs no authentication and no environment, so it's safe to run in a build pipeline." |
| `pac copilot create` | Create agent from an extracted template `.yaml` | Reads template | **YES - creates agent** | Requires `--displayName`, `--schemaName`, `--solution`, `--templateFileName`. Not a workspace generator. |
| `pac copilot extract-template` | Export agent to a template `.yaml` | Writes | **YES - reads** | Has `--templateName` and `--templateVersion` (X.X.X). Output pairs with `create`. |
| `pac copilot list` | List agents in environment | No | **YES - reads** | |
| `pac copilot status` | Poll deployment status | No | **YES - reads** | |
| `pac copilot publish` | Publish an agent | No | **YES - mutates** | |
| `pac copilot delete` | Delete an agent | No | **YES - destructive** | Requires `--confirm`. |
| `pac copilot quarantine` | Get/set quarantine status | No | **YES - mutates** | `--status` true/false. |
| `pac copilot extract-translation` | Write localization files (resx or json) | Writes | **YES - reads** | `--sourcedir` can read a solution folder instead of the tenant. |
| `pac copilot merge-translation` | Merge localization files back | Reads | **YES - mutates** | Supports `--whatif` and `--verbose`. |
| `pac copilot mcp` | Run local MCP server | No | No | `--run` switch. |
| `pac copilot model list` | List AI Builder models | No | **YES - reads** | |
| `pac copilot model predict` | Send text/prompt to an AI model | No | **YES - reads, may bill** | |
| `pac copilot model prepare-fetch` | Rewrite LLM-produced FetchXML for the environment | Reads + writes | **YES - reads** | `--inputFile` / `--outputFile`. |

Corrections to the assumptions in the brief:

- `pac copilot clone`, `pull`, `push`, and `pack` **do** exist. The brief listed push/pull as
  unverified; they are real and they are the core of the workflow.
- `pac copilot create` does **not** create a workspace. It creates an agent in an environment from a
  template file produced by `extract-template`. It is a tenant operation. Any design that treats
  `init` and `create` as two halves of local generation is wrong on the `create` half.
- Additional commands not in the brief: `delete`, `publish`, `quarantine`, `status`,
  `extract-translation`, `merge-translation`, `mcp`.

The purely local surface is exactly three things: `pac copilot init` without `--environment`,
`pac copilot pack`, and `pac copilot mcp`. Everything else touches a tenant.

---

## 6. Open questions only an installed `pac` or a real tenant can answer

These are the gaps. Each one is stated with the exact command to run.

1. **What files does `pac copilot init` actually write?** This is the central unanswered question
   and no amount of documentation research closes it.
   ```
   mkdir spike && cd spike
   pac copilot init --name "Spike Agent" --publisher-prefix spk
   find . -type f | sort
   ```
   No auth needed. Compare the result against the four renderings in section 4.2.

2. **What is the sync metadata file called and where does it live?** Same spike directory:
   ```
   find . -name ".*" -type f -o -name "*.json" | sort
   ```
   `init` without `--environment` may not write it at all, since there is no environment to record.
   If so, repeat after `pac copilot clone` against a scratch environment. That is a tenant
   operation and needs an environment you are willing to touch.

3. **Do `--template default` and `--template minimal` differ, and how?**
   ```
   pac copilot init --name A --publisher-prefix spk --template default  --project-dir t-default
   pac copilot init --name B --publisher-prefix spk --template minimal  --project-dir t-minimal
   diff -r t-default t-minimal
   ```
   This bounds how much shape variation Agent Spark can get for free from supported commands, which
   directly sizes the gap in section 2 item 4.

4. **How different is `--authoring-mode cli-copilot` from `classic`?**
   ```
   pac copilot init --name C --publisher-prefix spk --authoring-mode cli-copilot --project-dir t-cli
   diff -r t-default t-cli
   ```
   If CliCopilot is a materially simpler shape, it may be the better target for a generator.

5. **Will `pac copilot pack` accept a workspace that Agent Spark modified?** After a supported
   `init`, edit a topic, then:
   ```
   pac copilot pack --publisher-prefix spk --project-dir t-default --output-path out
   ```
   Pack is local and safe. A successful pack is evidence that content edits survive validation. Note
   the L3 warning that pack success does not imply import success.

6. **Does `pac copilot init` emit a solution folder anywhere in its output?** Checks section 4.7
   empirically:
   ```
   find . -name "solution.yml" -o -name "Solution.xml" -o -type d -name "solutions"
   ```
   I expect nothing until `pac copilot pack` runs. If `solutions/` does appear, section 4.7 is
   wrong and the documented L3 format becomes relevant again.

7. **What exact capability strings does the installed CLI expose?** Needed for ADR-0002 rule 3.
   ```
   pac help copilot
   pac copilot init --help
   pac --version
   ```
   Record the raw output. ADR-0002's "Slower" consequence requires the help parser to have tests
   against recorded output from several versions, so start collecting it now.

8. **Is there a schema the installed tooling ships that Agent Spark can validate against?** Look in
   the installed VS Code extension directory for `BotSchema.json` or an equivalent, rather than
   vendoring `bot.schema.yaml-authoring.json` from an experimental repo. This is the difference
   between section 2 item 5 being defensible and being a rule-1 violation.

---

## 7. Sources

### Microsoft Learn - fetched and verified 2026-08-24

1. `https://learn.microsoft.com/en-us/power-platform/developer/cli/reference/copilot` -
   `pac copilot` command group. `ms.date: 2026-02-25`, `updated_at: 2026-07-10`,
   `ms.topic: generated-reference`. Source of the entire section 5 table. **Contains no file
   layout.**
2. `https://learn.microsoft.com/en-us/microsoft-copilot-studio/visual-studio-code-extension-edit-agent-components` -
   "Agent file structure" tree, topic YAML examples, invitation to hand-author.
   `ms.date: 2026-01-13`, `updated_at: 2026-08-03`, `ms.topic: how-to`. Internally inconsistent on
   file extensions.
3. `https://learn.microsoft.com/en-us/microsoft-copilot-studio/visual-studio-code-extension-overview` -
   GA statement, git/PR guidance, "agent definition language", "not just the solution file".
   `ms.date: 2026-07-24`, `updated_at: 2026-08-03`.
4. `https://learn.microsoft.com/en-us/microsoft-copilot-studio/visual-studio-code-extension-synchronization` -
   Preview/Get/Apply semantics; Agent Changes pane tree showing `agent.yaml` and
   `topics/greeting.topic.yaml`. `ms.date: 2026-01-13`, `updated_at: 2026-08-03`.
5. `https://learn.microsoft.com/en-us/power-platform/alm/solution-source-control-yaml-format` -
   Solution YAML format reference. `ms.date: 2026-04-07`, `updated_at: 2026-04-10`,
   `ms.topic: reference`. The benchmark for what "documented" looks like. No bot/botcomponent row.
6. `https://learn.microsoft.com/en-us/power-platform/alm/solution-packager-tool` -
   SolutionPackager arguments and the two source-control layouts. `ms.date: 2026-04-07`,
   `updated_at: 2026-04-10`. Notes SolutionPackager is superseded by `pac solution`.
7. `https://learn.microsoft.com/en-us/power-platform/alm/use-source-control-solution-files` -
   "manual editing of extracted component files and .zip files isn't supported".
   `ms.date: 2026-04-09`, `updated_at: 2026-04-10`.

### GitHub - queried via `gh api` 2026-08-24

8. `https://github.com/microsoft/vscode-copilotstudio` - MIT, created 2025-03-20, pushed
   2026-08-21, 106 stars.
9. `https://github.com/microsoft/vscode-copilotstudio/blob/main/docs/McsWorkspace.md` - **the
   placeholder admission.** Single commit `f578bee5`, 2026-03-19.
10. `https://github.com/microsoft/vscode-copilotstudio/blob/main/docs/McsLanguageServerSpecs.md` -
    LSP capabilities. Confirms a semantic model is built from the workspace directory, but
    documents the protocol, not the file format.
11. `https://raw.githubusercontent.com/microsoft/vscode-copilotstudio/main/assets/BotSchema.json` -
    220,064 bytes. Inspected: description/localization strings bundle, not a schema. Still says
    "Power Virtual Agents".
12. `https://github.com/microsoft/skills-for-copilot-studio` - MIT, created 2026-01-13, pushed
    2026-08-24, 416 stars. **Source of the "may change without notice" disclaimer.**
13. `https://raw.githubusercontent.com/microsoft/skills-for-copilot-studio/main/reference/bot.schema.yaml-authoring.json` -
    856,549 bytes. A real JSON Schema body, but no `$schema`, no `$id`, no version. Three
    unversioned revisions: 2026-01-13, 2026-02-27, 2026-03-31.
14. `https://github.com/microsoft/copilot-studio-plugin` - MIT, created 2026-05-26, pushed
    2026-08-11, 53 stars. Successor to #12. Same disclaimer plus "not meant for production use".
15. `https://github.com/microsoft/AgentSchema` - MIT, created 2025-11-01, pushed 2026-07-10, 23
    stars. Versioned `schemas/v1.0/`, proper `$schema`/`$id`. Different vocabulary from `.mcs.yml`.
16. `https://microsoft.github.io/AgentSchema/` - AgentSchema docs site (referenced from the README;
    not directly fetched in this pass).

### Negative results - searched, found nothing (this is the load-bearing evidence)

17. `gh api "search/code?q=repo:MicrosoftDocs/power-platform+%22mcs.yml%22"` -> **0 results.** The
    string does not appear in the public Power Platform docs source.
18. `gh api "search/code?q=repo:MicrosoftDocs/power-platform+%22agent+workspace%22"` -> 3 results,
    all read: `developer/cli/reference/copilot.md`, `includes/copilot-init-intro.md`,
    `includes/copilot-pack-intro.md`. **None enumerates a file.**
19. Searched Microsoft Learn for a `pac copilot` workspace file-format reference page. **Not
    found.** No page with `ms.topic: reference` describes the workspace.
20. Searched for a published, versioned JSON Schema for `.mcs.yml` at a stable Microsoft URL.
    **Not found.** The only schema bodies are the two GitHub blobs above.
21. Searched for any Microsoft compatibility, versioning, or deprecation promise covering the
    workspace layout or the `.mcs.yml` schema. **Not found.** The only statement on the subject is
    the negative one in #12 and #14.

### Not consulted / excluded

- Third-party wikis (DeepWiki), community blog posts, and marketplace skill listings appeared in
  search results. I excluded them from the evidence sections deliberately: they are derived
  observations of the same artifacts and cannot establish that a format is documented.
- I did not install `pac` and did not contact any tenant, per the brief. Section 6 lists exactly
  what that omission leaves open.

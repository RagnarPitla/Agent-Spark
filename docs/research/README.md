# Computer-use harnesses: research notebook

This notebook investigates a product hypothesis: a reliable execution loop, able to use both structured integrations and authorized graphical interfaces, may be more useful for some enterprise workflows than another standalone chat interface.

It is a technical position paper with a proposed study and a local teaching lab. It is not a peer-reviewed paper, a report of customer deployments, a model leaderboard, or an implementation of the proposed Agent Spark CLI.

## Read it

| Artifact | Purpose |
| --- | --- |
| [White paper](whitepaper.md) | Definitions, evidence, architecture, counterarguments, and a falsifiable research agenda |
| [Article](article.md) | A shorter, publication-ready argument for adaptation to LinkedIn |
| [Source register](sources.md) | What each public source supports and what it cannot establish |
| [Machine-readable sources](sources.json) | The source of truth for the annotated bibliography |
| [Hypotheses](hypotheses.json) | Proposed comparisons, measurements, and rejection criteria; no results |
| [Lab guide](lab.md) | Run the scripted local simulator and understand its limits |
| [Browser reading hub](../../site/research/index.html) | HTML reading copies, diagrams, source filters, and the lab |
| [Original figures](../../site/research/assets/) | Editable Excalidraw source plus SVG and PNG exports |

The HTML files are checked-in static output. They can be read locally without an account, model key, network connection, or build step. Source links require internet access. Publication to GitHub Pages still follows the repository's existing `main` deployment policy.

## Rebuild and develop

```bash
npm ci
npm run research:build
npm run research:test
python3 site/validate.py site
```

To serve the site locally:

```bash
python3 -m http.server 8767 --bind 127.0.0.1 --directory site
```

Then open `http://127.0.0.1:8767/research/`.

The Markdown files in this directory are the prose source of truth. `sources.json` generates `sources.md`, the HTML register, and the marked bibliography region at the end of each document. Edit prose outside those regions. `scripts/research-figures.mjs` generates SVG and Excalidraw files. `scripts/build-research.mjs` generates the reading pages and downloadable Markdown copies. The lab has its own source and generator, described in [lab.md](lab.md).

PNG exports are presentation assets, captured from the rendered original figures. Refresh them when changing a figure and preserve the SVG's exact pixel dimensions. The cover is exactly 1200 x 630 pixels. Do not substitute a screenshot of a vendor chart or present a conceptual diagram as measured data.

## What has and has not been built

The lab implements deterministic state transitions, interface routing, scoped approval, postcondition checks, and bounded recovery against synthetic local state. Its screen adapter is simulated. It does not inspect screenshots, control a browser or desktop, call a model, contact an enterprise system, or enforce production security.

The proposed empirical study has not been run. The interactive probability calculator is an arithmetic illustration with explicit independence assumptions, not an estimate of a model's performance.

Agent Spark's existing templates, skill, schemas, and generation proof remain separate. Their presence does not establish that the research architecture is deployed. No Copilot Studio agent, customer data, tenant setting, or live application is changed by this notebook.

## Evidence and publication rules

Use public sources only. Separate vendor-reported measurements, product documentation, academic benchmark results, artifact inspection, and proposed work. Record benchmark version, tool access, metric, and evaluation setup before quoting a number. Do not turn a partial-credit score into a workflow success rate.

The reviewed public model name is GPT-6 Astra; GPT-5.6 Sol is a different model named in the same announcement. Model and client availability can change. Re-read the linked product documentation before describing a feature as available to a particular customer.

The paper's Agent Spark case study is pinned to commit `0fa8c409a9ed79850b0159fca864ef0ac18e5dd1`. It describes that snapshot, not a claim that later repository changes have already shipped.

All prose and figures in this notebook are original. External material is cited and summarized, not republished. The byline identifies the author; it does not imply a university affiliation, endorsement, or imitation of another writer.

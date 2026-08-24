# Knowledge sources for {{displayName}}

Nothing is connected. Generation deliberately does not upload, link, or index any data, because
connecting a source has permission, DLP, and residency consequences that a generator cannot judge.

## Declared placeholder

| Field | Value |
| --- | --- |
| Name | {{knowledgeSourceName}} |
| Kind | placeholder |
| Classification | {{dataClassification}} |
| Status | not connected |

## Onboarding checklist

Work through this before {{audience}} sees the agent.

1. **Confirm the source is approved.** Someone must own the decision that this content is the
   authority for these questions. Record who.
2. **Check permissions.** Agent responses inherit the reach of the connection. Confirm that
   everyone in {{audience}} is entitled to see everything in {{knowledgeSourceName}}. If they are
   not, either narrow the source or narrow the audience.
3. **Check write access to the source.** Anyone who can edit a connected document can influence the
   agent's answers. Treat editor lists as part of the agent's trust boundary.
4. **Check DLP and residency.** Your administrator confirms the connector is permitted in the
   target environment. Agent Spark reports policy refusals. It cannot resolve them.
5. **Connect the source** in Copilot Studio.
6. **Ask the ten questions you expect most.** Confirm the answers cite the right documents. This
   catches indexing gaps that no schema check can find.
7. **Ask three questions the source does not cover.** Confirm the agent reports the gap and points
   at {{escalationPath}} rather than improvising.
8. **Run `evals/baseline.yaml`** and record the result.

## Adding more sources

Each additional source widens what the agent can say and who can influence it. For each one, repeat
steps 1 to 4 and update the reach table in `SECURITY-NOTES.md`.

Two sources that disagree produce a conflict the agent will surface rather than resolve. That is
intended behavior, not a defect. Fix it at the source by retiring the outdated document.

## What good looks like

The agent answers covered questions with a citation, and answers uncovered questions with a gap
report and a route to {{escalationPath}}. Both are successes.

An agent that answers everything is not working better. It is guessing.

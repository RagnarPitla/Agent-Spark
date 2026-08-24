# Support

## What support exists

Agent Spark is maintained on a best-effort basis by volunteers. There is no service level
agreement, no response time guarantee, and no paid support tier.

| You need | Go to |
| --- | --- |
| A bug in a template, skill, schema, or the validator | [Open an issue](../../issues/new/choose) |
| A new template or skill proposal | [Open an issue](../../issues/new/choose) using the template proposal form |
| A security vulnerability in Agent Spark | [SECURITY.md](SECURITY.md). Do not open a public issue. |
| A design question or an idea that is not yet a proposal | [Discussions](../../discussions) |

## What this project cannot help with

Agent Spark is not a Microsoft product and its maintainers cannot act on the platform itself. Route
these elsewhere:

| Problem | Correct destination |
| --- | --- |
| Copilot Studio behavior, bugs, or outages | Microsoft Support through your tenant, or the [Power Platform community](https://community.powerplatform.com/) |
| `pac` CLI defects | [microsoft/powerplatform-build-tools](https://github.com/microsoft/powerplatform-build-tools/issues) or Microsoft Support |
| Licensing, entitlement, or billing | Your Microsoft account team or admin center |
| Tenant policy, DLP, or environment access refusals | Your Power Platform administrator |
| A security issue in a Microsoft product | [MSRC](https://msrc.microsoft.com) |

If Agent Spark reported a policy or licensing blocker, that report is working as designed. Agent
Spark surfaces platform decisions. It cannot override them, and a request to make it do so will be
closed.

## Before you open an issue

Include these and the issue will be resolved much faster:

- Output of `npm run validate` if the problem is content or schema related.
- Operating system and version, Node version, and `pac --version` if the CLI is involved.
- The exact file and line, or the exact command and its full output.
- What you expected instead.

## Diagnostic bundles

Once the CLI exists, `agentspark report` will produce a redacted diagnostic bundle for attachment
to issues. It does not exist yet. Until then, paste the relevant output directly and remove tenant
identifiers, environment URLs, and user principal names yourself before posting.

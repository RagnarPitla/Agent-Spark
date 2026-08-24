# Security Policy

## Reporting a vulnerability

Do not open a public issue for a security problem. Use GitHub private vulnerability reporting on
this repository, or contact the maintainer listed in [GOVERNANCE.md](GOVERNANCE.md).

Include the affected file or command, the version or commit, reproduction steps, and what an
attacker gains. You will get an acknowledgement within five business days.

This project is not a Microsoft product. A vulnerability in Copilot Studio, Power Platform, or the
Power Platform CLI must go to the Microsoft Security Response Center at https://msrc.microsoft.com,
not here. Report to this repository only for defects in Agent Spark content or code.

## What counts as a vulnerability here

Agent Spark has a narrow attack surface today because it ships content, not a running service. The
findings that matter:

| Class | Example |
| --- | --- |
| Secret in content | A template, sample, or eval file containing a real key, token, or connection string |
| Unsafe generation | A template that writes outside the project directory, or a path traversal in a variable |
| Privilege escalation by default | Generated deployment settings that publish, grant, or write without confirmation |
| Prompt injection in shipped content | Instructions or skill text that a hostile knowledge source could hijack to exfiltrate data |
| Supply chain | A dependency, template source, or resource with unverified provenance |
| Misleading provenance | Content attributed to a source that did not produce it |

## Design commitments

These are enforced by the validator in `scripts/validate.mjs` and by review, not by good intentions.

- No secrets in source control. Templates reference environment variables or an approved secret
  store. `npm run validate` fails the build on likely secret patterns.
- Generation is separated from environment writes. Producing files never contacts a tenant.
- Publishing and destructive operations require explicit confirmation and display the target
  identity before acting.
- No silent elevation. Where administrator or root is needed, the reason is stated and a manual
  command is offered.
- No customer content in telemetry. See [docs/security-model.md](docs/security-model.md).
- Every template and skill carries an owner, a version, and a provenance statement.

## Scope exclusions

- Findings that require an already-compromised developer machine.
- The absence of a feature that is documented as not implemented, including the entire `cli/`
  and `packages/` tree.
- Policy decisions enforced by Microsoft, such as DLP or licensing. Agent Spark reports these. It
  is not a control point for them.

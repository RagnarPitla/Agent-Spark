# Packages

**Nothing here is implemented.** Each directory holds a README describing a boundary. There is no
code, no `package.json`, and no build.

These exist as written boundaries rather than empty folders because the split is a design decision
worth recording before it is worth building. Where the seams go determines what can be tested without
a tenant, which is the difference between a project with a test suite and a project with a
demo.

| Package | Responsibility | Talks to the network |
| --- | --- | --- |
| [core](core/) | Planning, orchestration, checkpoints | no |
| [config-schema](config-schema/) | Schema definitions and validation | no |
| [template-engine](template-engine/) | Variable resolution and rendering | no |
| [pac-adapter](pac-adapter/) | The only component that runs PAC CLI | yes |
| [diagnostics](diagnostics/) | Preflight checks and error translation | through pac-adapter |
| [telemetry](telemetry/) | Opt-in local logging | no |

## The rule the split exists to enforce

**`pac-adapter` is the only package that touches the network or the tenant.** Everything else is
pure: same inputs, same outputs, no side effects, testable without an environment, a licence, or a
login.

This is what makes `core` testable at all. Planning is where the consequential logic lives, and if
planning had to reach a tenant, it could only be tested by someone with a tenant, which means it
would be tested rarely and by one person.

The dependency direction is one way. `pac-adapter` may depend on `config-schema`. Nothing depends on
`pac-adapter` except through an interface it can substitute in tests.

## Not decided

Whether these ship as separate npm packages or as internal modules in one package. Publishing six
packages for one CLI is a maintenance cost that only pays off if someone consumes them separately,
and nobody does yet. The boundaries hold either way, which is the point of writing them down before
choosing the packaging.

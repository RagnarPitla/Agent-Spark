# template-engine

**Not implemented.** Contract only.

Variable resolution and rendering. Turns a template directory plus a set of variable values into a
project directory.

## Responsibility

Read `template.yaml`, collect values for `spec.variables` from defaults, a config file, or the
wizard, then render every file in the template with those values substituted.

## Constraints

**Substitution only.** No conditionals, no loops, no expressions, no includes. `{{variable}}` is
replaced by a string and that is the whole language.

This is a deliberate ceiling. Template languages grow logic because a single case seems to need it,
and the result is a program written in a language with no debugger, no types, and no tests. A
template that needs branching is two templates, and saying so is cheaper than building an interpreter
nobody wanted.

**Undeclared variables are an error, not a blank.** Rendering fails if a file uses a variable that
`spec.variables` does not declare. This already caught a real bug: the `knowledge-assistant` README
used `{{variable}}` in prose as an illustration, which the validator correctly refused.

**Unresolved variables are an error.** A rendered project containing `{{` means rendering failed. CI
greps `samples/` for it independently.

**Pure.** Given a template and a set of values, the output is the same every time. No network, no
tenant, no timestamps in generated content.

**Rendering never connects anything.** Knowledge sources render as placeholders with instructions,
because connecting a data source has permission, DLP, and residency consequences that a rendering
engine has no basis to judge.

## Shape

```
render(templateDir, values) -> FileSet
```

Returns a file set rather than writing to disk, so `core` can put the writes in a plan and show them
before they happen.

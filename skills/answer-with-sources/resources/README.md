# Resources

Static files a skill needs at runtime: lookup tables, prompt fragments, JSON schemas for tool
payloads, reference documents.

`answer-with-sources` needs none. The directory is kept so the reference skill shows the full
expected shape.

## Rules for resources

- No customer data, no tenant identifiers, no real employee names.
- No secrets. `npm run validate` fails the build on likely credential patterns.
- Every resource that came from somewhere else needs its source and license recorded in the
  `provenance` field of `SKILL.md`.
- Large binaries do not belong here. Reference them by URL and record the checksum.

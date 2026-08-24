# Governance

## Current model

Agent Spark is a single-maintainer project in its concept phase.

| Role | Who | Responsibility |
| --- | --- | --- |
| Maintainer | [@RagnarPitla](https://github.com/RagnarPitla) | Direction, merges, releases, security response |

This will not scale, and it is not meant to. The model below describes what replaces it once there
are contributors who are not the maintainer.

## Affiliation and independence

The maintainer works at Microsoft. Agent Spark is a personal open-source project. It is not a
Microsoft product, is not endorsed by Microsoft, and carries no Microsoft support commitment.
Nothing in this repository originates from internal, confidential, or NDA material.

Practical consequence: no internal roadmap detail, no unreleased feature names, no internal
documentation, and no customer information enters this repository. When internal knowledge and
public documentation disagree, this repository follows the public documentation and says so.

## Decisions

| Decision type | How it is made |
| --- | --- |
| Bug fix, doc fix, new example | Maintainer merge after review |
| New template or skill | Maintainer review against the CONTRIBUTING checklist |
| Schema change, breaking change | Requires an ADR in `docs/adr/` and a CHANGELOG entry |
| Architecture, scope, naming | Requires an ADR, discussed in an issue first |
| Security response | Maintainer, following [SECURITY.md](SECURITY.md) |

Architecture Decision Records are the memory of this project. If a decision is worth arguing about
twice, it is worth an ADR. See [docs/adr/](docs/adr/).

## Adding maintainers

A contributor becomes a maintainer by sustained review-quality contribution, not by volume. The
bar: several merged non-trivial PRs, demonstrated judgment in review of other people's work, and
willingness to answer issues for content they own. The maintainer proposes, existing maintainers
agree, the change is recorded in this file.

## Template and skill ownership

Every template and skill names an owner in its manifest. The owner answers issues about it and
re-checks it by the declared review date.

Content whose review date has passed by more than six months is marked `stale` in the catalog.
Stale content that no one claims is deprecated in the next minor release and removed in the next
major one. Removal is announced in `CHANGELOG.md` at least one release ahead.

## Releases

Semantic versioning. Schemas version independently of the repository, because a project generated
against `v1alpha1` must keep validating after the repository moves on.

Pre-1.0, the `alpha` in `agentspark.dev/v1alpha1` means exactly what it says: the schema can break.
Breaking changes will be listed in `CHANGELOG.md` with a migration note. They will not be silent.

## Ending the project

If the project is abandoned, the maintainer will archive the repository with a README note stating
the last verified platform version and pointing at any successor. Silent abandonment is the worst
outcome for anyone who built on it.

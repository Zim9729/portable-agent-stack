---
name: release-doc-sync
description: Check or update official documentation against a completed code diff. Use when public APIs, CLI behavior, configuration, installation, migrations, operations, or user-visible behavior changed.
license: MIT
compatibility: Requires Git and repository file access. CodeGraph, documentation validators, Trellis, Headroom, and gstack are optional.
metadata:
  version: "1.0.0"
---

# Release documentation sync

Keep official documentation aligned with the implemented diff without taking ownership of task state, domain language, or architecture decisions.

## Ownership boundaries

May update when made stale by the diff:

- README and getting-started material
- CHANGELOG or release notes
- CONTRIBUTING and developer setup
- architecture overviews
- API, CLI, configuration, migration, and operational references
- tutorials, how-to guides, runbooks, examples, and sample configuration

Do not modify without explicit direction:

- `.trellis/`
- `CONTEXT.md`
- `docs/adr/`
- legal, compliance, or policy text
- generated output whose canonical source is elsewhere
- release tags or version numbers

## Modes

- `check`: report documentation drift without editing; default
- `apply`: update only documents demonstrably stale because of the diff
- `release`: perform broader public-surface, release-note, and documentation coverage checks

Read `.agent-stack/config.yml` and the active task before selecting a mode.

## Backend

1. Delegate to gstack `document-release` only when allowed and available.
2. Otherwise use repository-native documentation, link, example, and schema validators.
3. Use Git diff plus CodeGraph to inventory public changes and validate stable module or flow references.

Do not install a documentation framework without approval. When delegating, retain the protected-path rules and normalize results into this skill's evidence contract.

## Procedure

1. Determine the comparison base using repository/PR conventions or merge base, and record both commits.
2. Build a public-surface inventory using `references/public-surface-checklist.md`.
3. Map each changed surface to its authoritative documentation.
4. In `check` mode, report stale, missing, misleading, or unverifiable documentation.
5. In `apply` or `release` mode, make the smallest accurate edits. Preserve local voice and structure.
6. Validate commands, paths, examples, links, schemas, and generated references with existing project tools when practical.
7. Report documentation debt separately from changes required for the current release.

Do not copy transient CodeGraph output into permanent docs unless it represents a stable, reviewed relationship.

## Evidence

Preferred location:

```text
.trellis/tasks/<task-id>/evidence/release-doc-sync/
```

Fallback:

```text
docs/agent-evidence/YYYY-MM-DD-release-doc-sync/
```

Create `report.md` from `references/report-template.md`. Create `coverage.json` from `references/coverage.schema.json` when machine-readable evidence is enabled.

Headroom may summarize large diffs, but preserve changed filenames, public signatures, commands, configuration keys, endpoints, and validation failures.

## Completion

Report:

- comparison range
- public surfaces added, changed, deprecated, or removed
- documents checked and modified
- validation commands and results
- protected files left untouched
- unresolved documentation debt
- status: `PASS`, `FAIL`, `PARTIAL`, or `BLOCKED`

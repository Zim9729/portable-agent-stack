# Architecture

## Design principle

One responsibility has one owner. Integration contracts are stable even when optional backends change.

```text
Repository-backed layer                         Local rebuildable layer
────────────────────────────────────────────    ─────────────────────────
Trellis tasks/specs/workspace                    CodeGraph index
AGENTS.md and Agent Skills                       Headroom proxy/memory
CONTEXT.md and ADRs                              Agent-specific configuration
Verification evidence                            temporary logs and caches
```

## Memory model

1. **Task memory:** current goal, acceptance criteria, progress, and verification evidence.
2. **Workspace memory:** temporary investigations, failed attempts, and session continuity.
3. **Durable project knowledge:** specs, domain language, and ADRs.
4. **Personal local memory:** preferences and reusable personal corrections.

Only the first three are authoritative for the project and should be reviewable in Git.

## Supplemental skill contract

Each shipped skill has:

- a portable name and description
- strict side-effect boundaries
- a lightweight default mode
- optional deeper backend delegation
- normalized human-readable evidence
- optional machine-readable JSON schema
- explicit blocked, partial, and residual-risk reporting

The skills do not own tasks, memories, issues, or releases.

## Update ownership

The CLI manages:

- marked blocks in `AGENTS.md` and `.gitignore`
- files recorded in `.agent-stack/manifest.json`

It does not own arbitrary project content. On conflict, it emits `.pas-new` instead of overwriting local changes.

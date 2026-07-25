<!-- portable-agent-stack:start -->
## Portable agent engineering contract

- Trellis owns task lifecycle, project specs, and repository-backed working memory.
- CodeGraph owns structural code discovery: symbols, call paths, dependencies, and change impact.
- Engineering skills provide methods; they do not create a second task system.
- Matt Pocock skills provide engineering methods only: domain modeling, research, prototyping, TDD, diagnosis, codebase design, architecture improvement, code review, and merge-conflict resolution. They must not create a parallel task lifecycle or issue workflow.
- Headroom may compress context and retain personal preferences, but it is not authoritative project memory.
- Compiler, type checker, linter, deterministic scanners, and tests decide correctness.

### Workflow

1. Read the active task, relevant project specs, `CONTEXT.md`, and applicable ADRs.
2. Use CodeGraph first for structural code questions; use shell search only when the graph is unavailable or insufficient.
3. Activate the smallest relevant skill instead of loading broad procedures into every prompt.
4. Run fresh deterministic verification before claiming completion.
5. Store evidence with the active task or under `docs/agent-evidence/` when no task exists.
6. Promote durable knowledge to project specs, `CONTEXT.md`, or `docs/adr/`; keep temporary investigation notes out of permanent guidance.

Read `.agent-stack/config.yml` for profile-specific evidence and delegation policy.

### Destructive operations

Without explicit approval, do not force-push, hard-reset, destructively clean, recursively delete non-temporary data, run irreversible database operations, mutate production systems, delete cloud resources, or rotate secrets.

Before a destructive operation, show the exact command, affected scope, rollback plan, and obtain explicit approval.

### Completion gate

Report commands run, outcomes, remaining risks, and checks that could not be performed. Do not claim completion from reasoning alone.
<!-- portable-agent-stack:end -->

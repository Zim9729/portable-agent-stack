# Agent stack operating model

## Ownership

| Concern | Owner |
|---|---|
| Tasks, specs, and project memory | Trellis |
| Code relationships and impact | CodeGraph |
| Engineering procedures | Agent Skills |
| Context compression | Headroom |
| Durable cross-agent state | Git-tracked files |
| Correctness | Build, tests, lint, scanners, and review |

## Knowledge destinations

| Knowledge | Destination |
|---|---|
| Current progress and verification | active task evidence |
| Temporary investigation notes | workspace journal |
| Stable project rule | project spec |
| Canonical domain term | `CONTEXT.md` |
| Durable architecture decision | `docs/adr/` |
| Personal cross-project preference | local Headroom memory |

Do not preserve the only copy of project knowledge in a local Agent database or chat transcript.

# Integrations

Upstream commands can change. Prefer official documentation and pin versions in regulated or reproducible environments.

## Trellis

Trellis is the recommended task/spec/memory owner. The explicit installer runs:

```bash
npm install -g @mindfoldhq/trellis@latest
trellis init -u <name> --codex --devin
```

Trellis creates its own platform adapters while preserving the shared `.trellis/` core.

## CodeGraph

```bash
npm install -g @colbymchenry/codegraph
codegraph install
codegraph init
```

Use CodeGraph for code structure, call paths, and impact. Do not commit `.codegraph/`; cloud agents should rebuild it in their environment.

## Headroom

A typical local installation is:

```bash
uv tool install --python 3.13 "headroom-ai[all]"
```

Codex can be launched through Headroom's supported wrapper:

```bash
headroom wrap codex
```

Any MCP-capable agent can use Headroom's MCP server when configured by that agent. Project-critical knowledge must still be written to Git-tracked files.

## Matt Pocock skills

```bash
npx skills@latest add mattpocock/skills
```

Recommended engineering-method subset:

```text
domain-modeling
research
prototype
tdd
diagnosing-bugs
codebase-design
improve-codebase-architecture
code-review
resolving-merge-conflicts
```

Trellis remains the task owner. Avoid making `triage`, `to-spec`, `to-tickets`, `implement`, `wayfinder`, or `handoff` the default lifecycle unless you deliberately replace Trellis.

## gstack

The three portable skills can delegate to gstack's matching capabilities when the host supports them:

| Portable skill | Optional gstack backend |
|---|---|
| `browser-acceptance` | `qa-only` |
| `security-audit` | `cso` |
| `release-doc-sync` | `document-release` |

Delegation defaults to `never` except in the `full` profile. gstack state and memory are not imported.

## Codex

Codex reads `AGENTS.md` and supports MCP and skills. CodeGraph's installer can configure supported local agents. Use short MCP server names so the agent can choose correctly.

## Devin

Devin discovers open Agent Skills from `.agents/skills/<name>/SKILL.md`. Trellis can generate a Devin adapter. For CodeGraph and Headroom, use Devin's current MCP configuration mechanism or shell CLI fallback. Cloud Devin must install tools and rebuild indexes inside its own environment.

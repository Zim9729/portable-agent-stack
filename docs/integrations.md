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

Recommended engineering-method subset (11 skills):

```text
setup-matt-pocock-skills
grill-with-docs
prototype
diagnosing-bugs
research
tdd
domain-modeling
codebase-design
improve-codebase-architecture
code-review
resolving-merge-conflicts
```

Non-interactive installation with `pas`:

```bash
pas tools install --yes --agents codex,devin --matt-skills default
```

Or with a custom subset:

```bash
pas tools install --yes --agents codex,devin --matt-skills tdd,code-review,research
```

After installation, run `/setup-matt-pocock-skills` in your agent. Recommended answers:

- **Issue tracker:** Local Markdown, but do not create a separate task lifecycle; Trellis is the sole owner.
- **Domain documents:** `CONTEXT.md` and `docs/adr/`.
- **Triage labels:** Do not configure (triage is not installed).

Trellis remains the task owner. Do not install `triage`, `to-spec`, `to-tickets`, `implement`, `wayfinder`, or `handoff` unless you deliberately replace Trellis. Also avoid `ask-matt`, `grill-me`, `git-guardrails-claude-code`, `setup-pre-commit`, and anything under `personal/`, `in-progress/`, or `deprecated/`.

For PAS maintainers, `writing-great-skills` can be added alongside the default set:

```bash
pas tools install --yes --agents codex,devin --matt-skills default,writing-great-skills
```

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

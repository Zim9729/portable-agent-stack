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

`pas tools install` automatically registers Headroom as an MCP server for each specified agent that supports local MCP configuration:

| Agent | Config file | Format |
|---|---|---|
| Codex | `~/.codex/config.toml` | TOML `[mcp_servers.headroom]` |
| Claude Code | `~/.claude.json` | JSON `mcpServers.headroom` |
| Cursor | `~/.cursor/mcp.json` | JSON `mcpServers.headroom` |
| Gemini | `~/.gemini/settings.json` | JSON `mcpServers.headroom` |
| OpenCode | `~/.opencode/config.json` | JSON `mcpServers.headroom` |
| Kiro | `~/.kiro/config.json` | JSON `mcpServers.headroom` |
| Devin | Cloud dashboard | Manual configuration required |

To register Headroom MCP without installing tools (e.g. after installing Headroom separately):

```bash
pas mcp register --agents codex,devin
```

The registered MCP server runs `headroom mcp serve` and exposes compression tools (`headroom_compress`, `headroom_retrieve`, `headroom_stats`) to the agent. The agent can call these tools on demand to compress long outputs and retrieve them later.

Codex can also be launched through Headroom's wrapper for automatic I/O compression:

```bash
headroom wrap codex --code-memory none
```

Use `--code-memory none` because code understanding is already handled by CodeGraph. Any MCP-capable agent can use Headroom's MCP server when configured by that agent. Project-critical knowledge must still be written to Git-tracked files.

### Auto-compress (MCP auto-trigger)

Since v1.2.0, Portable Agent Stack supports automatic Headroom compression via MCP. The configuration lives in `.agent-stack/config.yml`:

```yaml
headroom:
  auto_compress:
    enabled: true
    threshold_lines: 150
    threshold_chars: 6000
    preserve:
      - failed_test_names
      - error_stack_traces
      - file_paths
      - security_evidence
      - scanner_rule_ids
      - reproduction_steps
```

How it works:

1. `AGENTS.md` managed block includes auto-compress instructions that the agent reads and follows.
2. When any tool output exceeds `threshold_lines` or `threshold_chars`, the agent automatically calls `headroom_compress`.
3. The returned hash replaces the verbose output in context; `headroom_retrieve` recovers the original when needed.
4. Content types listed under `preserve` are never compressed.

Profile defaults:

| Profile | Auto-compress | Lines | Chars |
|---|---|---|---|
| minimal | off | 200 | 8000 |
| standard | on | 150 | 6000 |
| web | on | 150 | 6000 |
| full | on | 100 | 4000 |

CLI overrides during init or update:

```bash
pas init --profile standard --headroom-auto-compress true --headroom-threshold-lines 200 --headroom-threshold-chars 10000
pas update --profile full --headroom-auto-compress false
```

Check auto-compress status with `pas doctor` — it verifies headroom is installed, thresholds are configured, and AGENTS.md instructions are present.

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

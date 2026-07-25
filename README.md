# Portable Agent Stack

[简体中文](README.zh-CN.md)

A repo-local engineering stack that lets teams reuse the same workflow, knowledge, and quality gates across Codex, Devin, and other Agent Skills-compatible coding agents.

Portable Agent Stack is an integration layer, not another all-owning agent framework. It keeps one owner for each responsibility:

```text
Git repository
├── Trellis              tasks, specs, and project memory
├── CodeGraph            code relationships and change impact
├── Agent Skills         engineering and verification procedures
├── Headroom             optional context compression and local preferences
└── build/test tools     correctness
```

The repository ships three original, portable skills:

- `browser-acceptance`
- `security-audit`
- `release-doc-sync`

They work without gstack and can optionally delegate to matching gstack skills when the `full` profile enables it.

## Why this project

- **Cross-agent:** project state lives in Git, not one chat or local memory database.
- **Safe by default:** `init` only writes repo-local files. Global tools require a separate command and `--yes`.
- **Profile-based:** install only the governance your project needs.
- **Conflict-aware updates:** locally modified managed files are preserved and new versions are written as `.pas-new`.
- **Open Agent Skills:** skills use the portable `SKILL.md` format and keep detailed material in `references/`.
- **No vendored upstream code:** Trellis, CodeGraph, Headroom, Matt Pocock skills, and gstack retain their own licenses and release cycles.

## Requirements

- Git
- Node.js 18 or newer

The optional upstream stack may also require npm, Python, `uv`, and Agent-specific CLIs.

## Installation

### Option A — Clone from GitHub (no global install)

```bash
git clone https://github.com/Zim9729/portable-agent-stack.git ~/.local/share/portable-agent-stack
```

Then run `pas` via node:

```bash
cd /path/to/your-project
node ~/.local/share/portable-agent-stack/bin/pas.mjs init --profile standard --agents codex,devin
```

Or use the platform-specific helper script:

```bash
# Linux / macOS
~/.local/share/portable-agent-stack/install.sh --profile standard --agents codex,devin

# Windows PowerShell
powershell -ExecutionPolicy Bypass -File "$HOME/.local/share/portable-agent-stack/install.ps1" --profile standard --agents codex,devin
```

### Option B — Install from npm

```bash
npm install -g portable-agent-stack
```

After global install, the `pas` command is available everywhere:

```bash
cd /path/to/your-project
pas init --profile standard --agents codex,devin
```

You can also use `npx` without a global install:

```bash
cd /path/to/your-project
npx portable-agent-stack init --profile standard --agents codex,devin
```

### Step 1 — Initialize project files

`init` only writes repo-local files (`.agent-stack/`, `.agents/skills/`, `AGENTS.md`, etc.). It does **not** install any global software.

```bash
pas init --profile standard --agents codex,devin
```

| Option | Description | Default |
|---|---|---|
| `--profile <name>` | `minimal` / `standard` / `web` / `full` | `standard` |
| `--agents <list>` | Comma-separated agent names | `codex,devin` |
| `--target <path>` | Target Git repository | current directory |
| `--force` | Overwrite conflicting managed files | off |
| `--dry-run` | Print changes without writing | off |

### Step 2 — Install upstream dependencies (optional)

To install and configure the optional upstream tools, run:

```bash
pas tools install --yes --agents codex,devin --with-matt
```

`--yes` is required to acknowledge that global installations will be performed. Review [THIRD_PARTY.md](THIRD_PARTY.md) first, especially Trellis's AGPL-3.0 license.

#### Installed tools

| Tool | Role | Install method | Requires |
|---|---|---|---|
| [Trellis](https://github.com/mindfold-ai/Trellis) | Task workflow, specs, project memory | `npm install -g @mindfoldhq/trellis@latest` + `trellis init` | npm |
| [CodeGraph](https://github.com/colbymchenry/codegraph) | Code graph, call paths, impact analysis | `npm install -g @colbymchenry/codegraph` + `codegraph install` + `codegraph init` | npm |
| [Headroom](https://github.com/headroomlabs-ai/headroom) | Context and tool-output compression | `uv tool install --python 3.13 "headroom-ai[all]"` | [uv](https://docs.astral.sh/uv/) (Python) |
| [Matt Pocock skills](https://github.com/mattpocock/skills) | Engineering methods and reusable skills | `npx skills@latest add mattpocock/skills` | npx (bundled with npm) |

#### Prerequisites

- **Git** and **Node.js 18+** are required for `pas` itself.
- **npm** is required for Trellis and CodeGraph (bundled with Node.js).
- **[uv](https://docs.astral.sh/uv/)** is required for Headroom. Install it separately:
  ```bash
  # Linux / macOS
  curl -LsSf https://astral.sh/uv/install.sh | sh

  # Windows PowerShell
  powershell -ExecutionPolicy Bypass -c "irm https://astral.sh/uv/install.ps1 | iex"
  ```
  If `uv` is not installed, Headroom is skipped with a warning — other tools still install.
- **npx** is required for Matt Pocock skills (bundled with npm). Add `--with-matt` to enable.

#### Options

| Option | Description |
|---|---|
| `--yes` | Required acknowledgment for global installations |
| `--agents <list>` | Comma-separated agent names (default: `codex,devin`) |
| `--with-matt` | Also install Matt Pocock skills |
| `--skip <list>` | Skip specific tools: `trellis,codegraph,headroom,matt` |
| `--user <name>` | Git user name for Trellis init (default: `git config user.name`) |
| `--dry-run` | Print commands without executing |

#### Examples

```bash
# Install everything
pas tools install --yes --agents codex,devin --with-matt

# Skip Headroom and Matt skills
pas tools install --yes --agents codex,devin --skip headroom,matt

# Preview what would be installed
pas tools install --yes --agents codex,devin --with-matt --dry-run
```

#### Verify installation

```bash
pas doctor
```

Use `--strict` to treat missing optional tools as failures:

```bash
pas doctor --strict
```

## Profiles

| Profile | Installed supplemental skills | Intended use |
|---|---|---|
| `minimal` | none | Existing teams that only need the shared contract and memory skeleton |
| `standard` | security audit, release docs | General backend, library, CLI, and service projects |
| `web` | browser acceptance, security audit, release docs | Web products and user-facing applications |
| `full` | all three, richer evidence, optional gstack delegation | Mature multi-agent delivery pipelines |

The default is `standard`. See [docs/profiles.md](docs/profiles.md).

## CLI

```text
pas init       install repo-local assets
pas update     update managed assets without overwriting local edits
pas doctor     validate the repository setup
pas tools install
               explicitly install/configure optional upstream tools
pas profiles   list profiles
pas version    print the version
```

Examples:

```bash
pas init --profile web --agents codex,devin
pas update --profile full --prune
pas doctor
pas doctor --strict
```

## What gets added to a project

```text
.agent-stack/
├── config.yml
├── config.example.yml
└── manifest.json
.agents/skills/
├── browser-acceptance/      # profile-dependent
├── security-audit/          # profile-dependent
└── release-doc-sync/        # profile-dependent
AGENTS.md                    # managed block, existing content preserved
CONTEXT.md                   # created only when absent
docs/adr/README.md           # created only when absent
docs/agents/STACK.md
.gitignore                   # managed block, existing content preserved
```

The initializer never overwrites an unrelated `AGENTS.md`. It owns only the text between its markers.

## Recommended upstream composition

Use exactly one owner for each layer:

| Layer | Recommended owner |
|---|---|
| Task workflow and repository memory | Trellis |
| Code graph and impact analysis | CodeGraph |
| Engineering methods | Selected Matt Pocock skills |
| Context compression | Headroom |
| Deep optional QA/security/docs backend | gstack |

Recommended Matt skills include `domain-modeling`, `research`, `prototype`, `tdd`, `diagnosing-bugs`, `codebase-design`, `improve-codebase-architecture`, `code-review`, and `resolving-merge-conflicts`. Avoid enabling a second task lifecycle when Trellis is the system of record.

## Daily workflow

1. Resume the active Trellis task and read only relevant specs, domain terms, and ADRs.
2. Use CodeGraph first for structural code questions and blast radius.
3. Activate the smallest applicable engineering skill.
4. Run build, typecheck, lint, tests, and deterministic scanners.
5. Run the applicable supplemental gate:
   - browser acceptance for user-facing web changes
   - security audit for sensitive changes
   - release documentation sync for public-surface changes
6. Store evidence with the task and promote only durable knowledge.

See [docs/architecture.md](docs/architecture.md) and [docs/integrations.md](docs/integrations.md).

## Updating

Update this source repository, then update a project:

```bash
git -C ~/.local/share/portable-agent-stack pull
cd /path/to/project
node ~/.local/share/portable-agent-stack/bin/pas.mjs update
```

When a managed file was customized, the updater preserves it and writes the new upstream candidate beside it as `FILE.pas-new`.

## Development

```bash
npm run check
npm run pack:check
```

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

Portable Agent Stack is MIT licensed. Upstream integrations have independent licenses; see [THIRD_PARTY.md](THIRD_PARTY.md).

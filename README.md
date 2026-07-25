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

## Quick start

Clone this repository once, then initialize any Git project:

```bash
git clone https://github.com/Zim9729/portable-agent-stack.git ~/.local/share/portable-agent-stack
cd /path/to/your-project
node ~/.local/share/portable-agent-stack/bin/pas.mjs init --profile standard --agents codex,devin
```

After publishing the package or installing it globally, use:

```bash
pas init --profile standard --agents codex,devin
```

`init` does **not** install global software. To explicitly install and initialize the optional upstream tools:

```bash
pas tools install --yes --agents codex,devin --with-matt
```

Review [THIRD_PARTY.md](THIRD_PARTY.md) first, especially Trellis's AGPL-3.0 license.

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

# Changelog

All notable changes follow Keep a Changelog conventions. This project uses semantic versioning.

## [Unreleased]

### Added

- `pas mcp register` command to register Headroom as an MCP server for specified agents without installing tools.
- Automatic Headroom MCP registration during `pas tools install` for agents with local MCP config files: Codex (`~/.codex/config.toml`), Claude Code (`~/.claude.json`), Cursor, Gemini, OpenCode, and Kiro. Devin requires manual cloud-dashboard configuration.
- `--matt-skills` CLI option for non-interactive Matt Pocock skill installation: `--matt-skills default` installs the 11 recommended engineering-method skills; custom subsets and `writing-great-skills` are also supported.
- Comprehensive Matt Pocock skills recommendation section in README.md and README.zh-CN.md: default 11 skills, exclusion list with conflict rationale, maintainer-only `writing-great-skills`, post-install `/setup-matt-pocock-skills` configuration guide, and final responsibility map.
- Matt Skills ownership rule added to the AGENTS.md managed block.
- `docs/USAGE.zh-CN.md` complete Chinese usage guide covering architecture, tool responsibilities, workflows, and command reference.

### Changed

- Updated `docs/integrations.md` Headroom section with MCP auto-registration table, `pas mcp register` command, and agent-specific config file paths.
- Updated `docs/integrations.md` Matt Pocock section with the full 11-skill recommendation, non-interactive `pas` commands, and post-install configuration guidance.
- `installTools` now prints recommended skill names when launching the interactive Matt installer.
- Devin note updated to reflect that Headroom MCP is auto-registered for local agents but skipped for Devin.

## [1.1.0] - 2026-07-25

### Fixed

- Windows compatibility: `spawnSync` now uses shell mode on win32 so `npm`, `uv`, and other `.cmd`-based commands are found correctly.

### Changed

- Rewrote Quick start as a comprehensive Installation section in both README.md and README.zh-CN.md, covering GitHub clone, npm global install, npx, full upstream dependency table, prerequisites, and all CLI options.

## [1.0.0] - 2026-07-25

### Added

- Safe, repo-local initializer with `minimal`, `standard`, `web`, and `full` profiles.
- Cross-platform Node.js CLI: `init`, `update`, `doctor`, and `tools install`.
- Three portable Agent Skills: browser acceptance, security audit, and release documentation sync.
- Idempotent `AGENTS.md` and `.gitignore` managed blocks.
- Conflict-aware updates using installation checksums and `.pas-new` side files.
- English and Simplified Chinese documentation.
- CI validation, tests, issue templates, contribution guide, and security policy.
- Optional integration guidance for Trellis, CodeGraph, Headroom, Matt Pocock skills, and gstack.

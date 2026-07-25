# Changelog

All notable changes follow Keep a Changelog conventions. This project uses semantic versioning.

## [Unreleased]

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

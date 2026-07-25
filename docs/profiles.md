# Profiles

## Minimal

Installs the operating contract, configuration, memory skeleton, and documentation only. Use when the project already has equivalent QA/security/release procedures.

## Standard

Adds:

- `security-audit`
- `release-doc-sync`

This is the default because these skills apply to most software projects without assuming a browser.

## Web

Adds all standard skills plus `browser-acceptance`. Use for web products, dashboards, portals, and other browser-facing systems.

## Full

Installs all three skills, always requests machine-readable summaries, and permits optional gstack delegation. Use only when the team wants evidence automation and understands the extra process.

## Changing profile

```bash
pas update --profile web
pas update --profile minimal --prune
```

Without `--prune`, previously installed skills remain. With `--prune`, only unmodified managed files are removed. Customized files are preserved.

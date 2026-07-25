# Contributing

## Development setup

Requirements: Git and Node.js 18 or newer.

```bash
npm install
npm run check
```

This project intentionally has no runtime npm dependencies.

## Design rules

- Keep `AGENTS.md` guidance small; put conditional procedures in skills.
- Keep each responsibility owned by one layer.
- Do not vendor Trellis, CodeGraph, Headroom, Matt skills, or gstack.
- New behavior must include tests or validation fixtures.
- Skill instructions should be portable across Agent Skills clients.
- Prefer a short `SKILL.md` with detailed checklists in `references/`.
- Never make destructive global installation the default behavior.

## Pull requests

Explain the user problem, affected profile, compatibility impact, tests run, and any third-party license implications. Update the changelog for user-visible changes.

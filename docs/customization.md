# Customization

## Configuration

Edit `.agent-stack/config.yml`. The updater keeps local changes and writes new defaults to `.agent-stack/config.example.yml` when necessary.

Recommended default:

```yaml
gstack:
  delegation: never

evidence:
  machine_readable_summary: auto
```

## Skill customization

Repo-local skills are intended to be customized. When a future update detects modifications, it writes the upstream candidate as `.pas-new`.

Keep custom skills portable:

- use only standard `name`, `description`, `license`, `compatibility`, and `metadata` frontmatter unless a host-specific extension is essential
- state prerequisites rather than assuming tools exist
- keep `SKILL.md` concise and put long checklists/templates in `references/`
- identify side effects and required approvals
- produce evidence that another agent can understand without the original chat

## Replacing Trellis

The supplemental skills do not require Trellis. Set the evidence fallback and use another task system, but keep a single system of record. Update the `AGENTS.md` managed block locally if responsibility ownership changes.

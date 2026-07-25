# Migrating from the enhanced v2 starter

The open-source v1 CLI replaces the older copy-and-run bootstrap layout.

1. Back up local changes in `.agents/skills/` and `.agent-stack/config.yml`.
2. Run the new initializer with the matching profile:

```bash
pas init --profile web
```

3. When conflicts exist, compare the generated `.pas-new` files.
4. Remove the old copied `scripts/bootstrap.*`, `scripts/doctor.sh`, and `scripts/update-stack.sh` from the target project if they are no longer needed.
5. Keep `.trellis/`, `CONTEXT.md`, ADRs, and task evidence.

The new `init` command does not install global tools. Use `pas tools install --yes` only when desired.

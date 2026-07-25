---
name: security-audit
description: Perform an evidence-based security review of a diff, feature, release, or AI/MCP integration. Use for authentication, authorization, external input, dependencies, secrets, CI/CD, data migration, tool permissions, or other security-sensitive changes.
license: MIT
compatibility: Requires repository access and preferably shell execution. CodeGraph, deterministic scanners, Trellis, Headroom, and gstack are optional.
metadata:
  version: "1.0.0"
---

# Security audit

Produce actionable, evidence-backed findings. This skill is defensive and does not authorize destructive testing, credential use, production attacks, persistence, or data access.

## Resolve scope

Read `.agent-stack/config.yml`, the active task, relevant specs and ADRs, and the comparison diff. Choose the lightest applicable mode:

- `diff`: changed code and directly affected paths
- `feature`: end-to-end trust boundaries for one feature
- `deep`: broader release or subsystem review
- `ai-mcp`: prompts, tools, MCP servers, data access, model boundaries, and agent supply chain

Record assumptions, excluded systems, base/current commits, and whether validation is static, local, staging, or otherwise authorized.

## Backend and tools

1. Use CodeGraph to map entry points, callers, callees, sensitive sinks, and change impact when available.
2. Run existing repository scanners and dependency/secret checks where relevant.
3. Delegate to gstack `cso` only when `.agent-stack/config.yml` allows it and the host exposes the skill.
4. Do not install scanners, transmit source, run intrusive probes, or access production without approval.

Treat scanner output as leads, not confirmed vulnerabilities. Preserve raw evidence for failures and confirmed findings.

## Review procedure

1. Build a compact threat map: actors, assets, entry points, trust boundaries, privileged actions, and sensitive sinks.
2. Review only applicable areas from `references/checklist.md`.
3. Trace plausible source-to-sink paths and verify actual guards, validation, authorization, and failure behavior.
4. Assign each candidate a status:
   - `CONFIRMED`: reproducible or directly established from code/configuration
   - `LIKELY`: strong evidence with a remaining verification gap
   - `TENTATIVE`: plausible but incomplete; not release-blocking by default
   - `DISMISSED`: false positive or mitigated path
5. For confirmed findings, search for variants sharing the same root cause.
6. Recommend the smallest effective remediation and a regression test or scanner rule when practical.

Never inflate severity to make a report look useful. If evidence is insufficient, say so.

## Evidence

Preferred location:

```text
.trellis/tasks/<task-id>/evidence/security-audit/
```

Fallback:

```text
docs/agent-evidence/YYYY-MM-DD-security-audit/
```

Create `report.md` from `references/report-template.md`. Create `findings.json` using `references/findings.schema.json` when machine-readable evidence is enabled.

Headroom may compress repetitive clean output. It must preserve affected paths, dangerous data flow, exact commands, scanner rule IDs, reproduction details, and raw evidence locations.

## Release gate

Use the repository policy in `.agent-stack/config.yml`. By default, unresolved confirmed `critical` or `high` findings produce `NO-GO`. Explicitly report:

- findings by severity and status
- tools and commands run
- paths or environments not reviewed
- residual risk
- release recommendation: `GO`, `NO-GO`, or `GO-WITH-RISK`

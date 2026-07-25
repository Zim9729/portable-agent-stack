# Security review checklist

Apply only relevant sections.

## Identity and access

- authentication/session lifecycle
- authorization at every privileged action
- tenant and object ownership boundaries
- privilege escalation and confused-deputy paths

## Inputs and execution

- injection into SQL, shell, templates, queries, or interpreters
- file paths, uploads, archives, and content types
- SSRF, redirects, webhooks, and outbound requests
- deserialization and dynamic loading

## Data and secrets

- sensitive data exposure in logs, errors, analytics, caches, and responses
- encryption and key/secret handling
- retention, deletion, backups, and migrations

## Supply chain and delivery

- dependency and lockfile changes
- build scripts, CI permissions, release credentials, and artifact provenance
- third-party actions, plugins, skills, and MCP servers

## AI, agents, and MCP

- prompt injection and untrusted retrieved content
- tool authorization and least privilege
- data exfiltration through tools, logs, or model providers
- model output used as code, commands, policy, or authorization
- cross-tenant memory and context isolation

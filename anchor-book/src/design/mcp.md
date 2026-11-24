# MCP Capabilities

Plugins can contribute MCP servers alongside skills and hooks. The active plugin
graph determines applicable servers; agent adapters own their configuration
representation and the delivery ledger owns removal.

## Anchors

> **`A-mcp-owned-registration`** (draft): **MCP registration preserves scope and user servers**
> Property: Only applicable plugin servers are registered, using the selected agent's supported configuration shape and effective scope. Removal affects recorded Symposium entries without deleting unrelated or still-shared servers.
> Authority: `R-consistent-capabilities`; `R-preserve-user-artifacts`
> - Criterion `shape-and-scope` [test]: Register stdio and supported remote fixtures for each adapter at global and project scope; assert the documented file, command/environment representation, and user-scope fallback.
> - Criterion `owned-removal` [test]: Withdraw and revoke plugins with overlapping server names across scopes; assert ledger-driven removal, preservation of unrelated entries, and retention of names still required by active plugins.
> - Criterion `package-context` [test]: Launch a package server with root/data placeholders and relative resources; assert package-root resolution and stable data identity across version changes on supported launch platforms.


## Server descriptions and package context

Normalized server descriptions distinguish stdio from supported remote transports.
Environment variables and headers are maps, not ACP-style lists. Invalid entries
produce diagnostics without discarding otherwise valid plugin skills.

An Agent Plugins package can contribute `mcp.json`. Resolve package-root
placeholders against its installed directory and data placeholders against
persistent canonical package identity. Stdio servers that rely on relative
resources must run in the package's intended context. On Unix the adapter can
express this through a shell wrapper with positional arguments; user arguments
are never interpolated into shell source.

## Agent configuration

| Agent | Project | User | Shape |
| --- | --- | --- | --- |
| Claude | `.mcp.json` | `~/.claude.json` | `mcpServers`; command and args |
| Antigravity | `.agents/mcp_config.json` | `~/.gemini/config/mcp_config.json` | `mcpServers` |
| OpenCode | `opencode.json` | `~/.config/opencode/opencode.json` | `mcp`; command array, environment map |
| Codex | Falls back to user | `~/.codex/config.toml` | `mcp_servers` tables |
| Copilot CLI | Falls back to user | `~/.copilot/mcp-config.json` | `mcpServers` with explicit transport type |
| Kiro | `.kiro/settings/mcp.json` | `~/.kiro/settings/mcp.json` | `mcpServers` |
| Goose | Falls back to user | `~/.config/goose/config.yaml` | `extensions`; cmd, args, envs, enabled |

Paths describe default roots; adapter environment overrides still apply.
Writing MCP entries to a hook settings file is not a successful installation.
Codex, Copilot, and Goose project requests use their supported user file and
record that actual destination in the ledger. Goose remote transport uses
streamable HTTP rather than inventing an SSE variant.

## Lifecycle

Sync registers applicable servers after resolution. Init registers hooks but
does not infer workspace-specific MCP applicability. Refresh preserves explicit
disabled states where the host supports them. Removal and incomplete-source
holdback follow [Delivery](delivery.md), including revocation's broader cleanup.

Progressive disclosure through a single Symposium meta-server is a separate
coherent accepted-source proposal. Its architecture, registration conflict, and
remaining adoption work are retained in the
[migration experiment](../implementation-roadmaps/source-coverage.md#mcp-meta-server-proposal).

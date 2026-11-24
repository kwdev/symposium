# Agent Adapters

An adapter is a set of independent capabilities: detecting configuration,
registering hooks, translating events, placing skills, delivering plugins, and
serializing MCP settings. A native agent feature is not automatically a supported
Symposium integration.

## Anchors

> **`A-agent-registration-ownership`** (draft): **Registration preserves unrelated settings and user switches**
> Property: Registering, refreshing, and removing Symposium integrations changes only its owned entries in the files the selected agent actually reads, preserving unrelated settings and explicit disabled states.
> Authority: `R-preserve-user-artifacts`
> - Criterion `round-trip-settings` [test]: For each adapter, register twice, refresh, and remove against fixtures with unrelated hooks/MCP entries and explicit disabled Symposium entries; assert idempotency and preservation.
> - Criterion `real-config-targets` [test]: For adapters with a CLI inspection interface, run its own config/MCP listing command against isolated settings and assert the registered entry is recognized. Cover documented fallback scope; report unsupported inspection platforms separately.
> - Criterion `symlink-and-mode` [test]: Update settings through a symlink and an existing private file; assert the symlink and target permissions survive. Reject dangling links without replacing them.


## Capability matrix

| Agent | Shell hooks | Plugin delivery | Individual skill placement |
| --- | --- | --- | --- |
| Claude Code | Session, prompt, pre/post tool, stop | Global and project Claude package | `.claude/skills` |
| Codex CLI | Session, prompt, pre/post tool, stop | Global Agent Plugins marketplace registration | `.agents/skills` |
| GitHub Copilot CLI | Session, prompt, pre/post tool | Global Agent Plugins registration | Project `.agents/skills` |
| Antigravity CLI | Session, prompt, pre/post tool, stop | Global native package | Project `.agents/skills`; user Gemini configuration skills |
| Kiro | Session, prompt, pre/post tool | Use individual skills | `.kiro/skills` |
| OpenCode | No Symposium shell-hook registration | Use individual skills | Project `.opencode/skills`; user `.agents/skills` |
| Goose | No Symposium shell-hook registration | Global Open Plugins copy in `~/.agents/plugins` | Package skills; project per-skill fallback through `.agents/skills` |

OpenCode has a native JavaScript extension mechanism; that is distinct from a
registered Symposium shell-hook integration. For agents without project plugin
delivery, use per-skill fallback and suppress only content actually delivered
through another route. Agent-specific configuration roots honor supported
environment overrides through the same resolver used by detection.

## Native wire differences

The canonical events are session start, prompt submit, pre-tool, post-tool, and
stop where supported. Adapters translate spelling and payload shape: Copilot
tool arguments arrive as a JSON string; Claude/Codex use object fields;
Antigravity nests a tool call; Kiro's stdout is plain context.

Blocking support is event-specific. A pre-tool gate can deny where the host
supports it; post-tool and session responses do not gain blocking power merely
because another host has it. Native payload preservation and response semantics
are owned by [Hooks](hooks.md).

## Registration and user choices

Initialization detects agents through their actual user configuration roots.
Explicit choices survive changes in detection. Newly detected agents can be
offered as defaults; accepting an automatic default is distinguishable from
making an explicit selection. Removing all agents from an existing setup is
an uninstall operation; an unconfigured first run needs a valid selection.

Unknown configured agent names are retained for forward compatibility and skipped
with a warning. They can be removed explicitly. Removal deletes only Symposium's
hook entries, retaining a nonempty matcher group and unrelated handlers.

Agent MCP settings often live in a different file from hook settings. The table
in [MCP](mcp.md) owns these locations. User-disabled OpenCode/Goose MCP entries
and Antigravity's named hook remain disabled while other fields are refreshed.
Configuration writes preserve symlink targets, existing permissions, formatting,
and unrelated keys; new files follow the platform's creation mode and umask.

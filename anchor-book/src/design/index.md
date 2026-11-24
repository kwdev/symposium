# Design

Start with [System Architecture](system.md) for the end-to-end flow and ownership
of the system's correctness guarantees. Capability chapters define the target
behavior, with anchors near the top and detailed responsibilities below.

| Chapter | Scope |
| --- | --- |
| [System Architecture](system.md) | Components, trust boundaries, shared flow and guarantee ownership |
| [Configuration Loading](configuration-loading.md) | Startup directories, safe defaults and protected user choices |
| [Plugin Model](plugin-model.md) | Normalization, package identity and imported-content boundaries |
| [Package Managers](package-managers.md) | Ecosystem protocol, workspace context and failure semantics |
| [Activation and Consent](activation.md) | Enablement, gates, shared graph and user decisions |
| [State and Caching](state-and-caching.md) | Refresh levels, watch inputs and invalidation |
| [Skill and Plugin Delivery](delivery.md) | Compilation, atomic installation, ownership and cleanup |
| [Package Audits and Revocation](audits.md) | Audit identity, eligibility and revocation enforcement |
| [Agent Adapters](agents.md) | Independent agent capabilities, registration and user settings |
| [Hooks](hooks.md) | Format selection, budgets, process lifetime and responses |
| [MCP Capabilities](mcp.md) | Server context, native configuration and removal |
| [Commands and Acquisition](commands.md) | Setup, shared installation, argv forwarding and reports |
| [Telemetry](telemetry.md) | Consent, privacy, scoped identity, aggregates and storage |
| [Evaluation and Verification](evaluation.md) | Trusted tasks, isolated grading and meaningful evidence |

These are draft interpretations of the upstream design. Acceptance, source
conflicts, remaining detailed conversion, and test coverage are recorded in the
[migration source coverage](../implementation-roadmaps/source-coverage.md).
Git history retains superseded designs.

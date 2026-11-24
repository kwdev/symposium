# Skill and Plugin Delivery

Delivery materializes selected content in an agent's supported installation unit.
Symposium owns the artifacts it creates, while preserving the user's files,
configuration, and independently installed extensions.

## Anchors

> **`A-delivery-owned-content`** (draft): **Refreshing extensions preserves user work and complete installations**
> Property: Sync, local trials, and removal mutate only Symposium-owned artifacts, recorded entries, and trial-created enablement; failed replacement preserves the previous complete installation.
> Authority: `R-preserve-user-artifacts`
> - Criterion `ownership-and-aliases` [test]: Sync and remove beside unmarked directories, destination symlinks, canonical path aliases, and unrelated agent configuration; assert all user content and still-active shared entries remain unchanged.
> - Criterion `atomic-replacement` [test]: Inject traversal, staging, and replacement failures; assert the old complete content remains usable and no partial tree is published.
> - Criterion `trial-withdrawal` [test]: Try and remove a plugin with pre-existing global use, trial-created use, a later explicit user re-addition, and a deleted source manifest; assert only trial-owned choices and ledger-owned servers are removed, preserving active shared names.
> - Criterion `concurrent-sync` [test]: Run two sync processes with conflicting candidate sets; assert serialized installation/configuration mutations and internally consistent final owned artifacts.

> **`A-delivery-incomplete-sources`** (draft): **Uncertain absence never authorizes destructive cleanup**
> Property: A failed manager or incomplete registry scan retains previously owned content across every delivery surface, while explicit revocation still removes revoked owned content.
> Authority: `R-preserve-user-artifacts`; `R-enforce-revocation`
> - Criterion `retained-surfaces` [test]: Fail one source while a healthy source changes; assert healthy delivery continues and prior skills, compiled plugins, removed-agent artifacts, and MCP entries are retained.
> - Criterion `revoked-exception` [test]: With the same source failure, revoke a previously installed package; assert its owned artifacts are removed across recorded scopes without fetching or executing it, preserving shared active MCP names.


## Packaging and scope

The selected plugin can be compiled once into a directory containing both
Agent Plugins and Claude manifests plus the selected skill trees. Names are
normalized for agent constraints with deterministic collision handling.
Version selection uses manifest metadata, then a resolved package version, then
a valid fallback. Packaging does not change canonical plugin identity.

Global compilation uses explicit global selections independently of whichever
workspace happens to run sync. Project compilation uses that workspace's
applicable content. An adapter reports the capabilities actually delivered as
a plugin unit; only those suppress individual-skill delivery. Unsupported plugin
delivery falls back to the agent's skill interface. Global and project delivery
must not install duplicate copies through both routes.

Agent Plugins, Claude packages, and native per-skill sources retain their
[distinct traversal boundaries](plugin-model.md). Comparison and copy use the
same file-selection rules, so an ignored file cannot cause perpetual refresh.

## Installation ownership

An installed skill or compiled package carries a `.symposium` file marker.
Project artifacts carry a local `.gitignore` containing `*` inside the owned
directory, not a broad ignore rule for the user's parent directory.
A directory at the expected destination without ownership evidence is user
content and cannot be reaped. Destination symlinks are not permission to delete
their targets.

Build a replacement in staging and replace the owned destination atomically.
A failed copy leaves the previous complete installation available. Cleanup
recognizes canonical aliases of agent paths so one route cannot remove content
another route still needs.

Resolution happens before acquiring the blocking user-cache `sync.lock`.
Installation, stale cleanup, and related agent configuration changes share
the lock, preventing concurrent syncs from interleaving those mutations.

## Incomplete sources and removal

A failed package manager or an incomplete registry scan makes absence uncertain.
One shared cleanup decision protects stale skills, compiled packages, retained
agents, and MCP registrations; it is not independently recomputed by each output
path. Healthy contributions can still be delivered.

Revocation is different from absence. It removes the revoked package's owned
skills and MCP entries even when other sources are unavailable. Identify these
artifacts without executing revoked predicates or fetching revoked code.
Shared MCP names still required by an active package are retained.

Ordinary explicit withdrawal affects global and current-workspace registrations
in the command's scope. Revocation cleanup can span all recorded scopes. An
installation ledger records actual configuration files and names used by adapters,
including agents whose project MCP setting falls back to a user file.
Uninstall only recorded owned entries, preserving unrelated keys and content.

Agent JSON updates preserve key order, indentation, and symlink targets; they
replace the target atomically and preserve its existing permissions. New files
follow the platform creation mode and umask. A dangling configuration symlink is an error, not a request to
replace the link. Parsed TOML/YAML updates avoid rewriting an unchanged value.

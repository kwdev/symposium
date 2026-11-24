# Plugin Model

A plugin is an identity-bearing package of skills, hooks, MCP servers, subcommands,
installations, predicates, and chained plugin references. Normalization separates
accepted file syntax from the runtime model so every consumer sees the same
validated meanings.

## Anchors

> **`A-plugin-package-boundary`** (draft): **Imported packages retain identity and containment**
> Property: Agent Plugins input cannot escape its package through manifest or skill paths, and one package is never rediscovered as unrelated child skills.
> Authority: `R-package-boundaries`
> - Criterion `contained-input` [test]: Load Agent Plugins fixtures with parent traversal and escaping symlinks in manifests and skill trees; reject or skip the escaping content with a diagnostic while retaining valid in-package content.
> - Criterion `package-unit` [test]: Scan a registry package containing several skills and verify one canonical plugin with those skills, with no separately discovered child plugin.


## Loading and normalization

Registry traversal claims a directory at its first recognized root:
`Symposium.toml`, otherwise `plugin.json`, otherwise `SKILL.md`.
It does not descend into a claimed plugin and rediscover each skill as an
unrelated package. Installed directories bearing Symposium's marker are excluded.
A standalone Claude-specific package needs explicit import rather than accidental
recursive discovery.

For Cargo packages, package metadata and a manifest contribute ordered layers:
lists append, keyed values use the later definition, and gates combine with AND.
A malformed layer is diagnosed and excluded. Package defaults find shipped
skills; workspace-member defaults may additionally find local agent skills,
but these do not become capabilities offered to dependency consumers.

Raw structures model aliases and file layout; validation creates the runtime
structures. Inline installation declarations become named runtime installations.
An executable and script are mutually exclusive across the merged declaration;
arguments have one supplying layer. Matchers are validated before dispatch.
Skill sources choose one path or git source. Chained package references use
`source.cargo`, separately from a skill's content source.

Relative scripts and path-like executables resolve against their declaring
manifest, never a later ambient working directory. A bare executable such as
`rustc` remains a PATH lookup. Absolute paths retain their meaning. Invalid or
nonrepresentable resolved paths are reported before execution.

## Agent Plugins input

An Agent Plugins package retains package identity and version. Its immediate
`skills/<name>/SKILL.md` children become skills of that package; malformed
entries are diagnosed independently. Native metadata can supply descriptive
fields while `dev.symposium` supplies Symposium-specific gating. A malformed
dependency package does not silently become an unrelated set of bare skills.

Agent Plugins input requires canonical containment of the manifest and skill
content within the package. This boundary differs from native Symposium skill
sources: those can deliberately refer to external paths and dereference symlinks,
subject to safe traversal. Broken links, cycles, and special files cannot produce
unbounded traversal. This distinction also affects
[audit digest eligibility](audits.md).

A package's `mcp.json` contributes MCP servers. A malformed file excludes its
MCP contribution; one malformed server excludes that entry without discarding
valid skills. `PLUGIN_ROOT` names the installed package and `PLUGIN_DATA`
names durable per-package data, whose identity survives version changes.
[MCP](mcp.md) owns runtime selection and registration.

## Shared identity and predicates

Package-manager-qualified canonical identities drive graph traversal, ownership,
audits, and provenance. A display name is insufficient to merge different
ecosystems. Plugin, group, and capability predicates combine; a chained reference
retains its own declaring context instead of inheriting unrelated sibling gates.
Consent is an activation policy, not a predicate a plugin can redefine.

The normalized graph is consumed by [Activation](activation.md). Compiling it
for an agent changes packaging and placement, not trust or enablement.

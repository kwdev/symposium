# Package Managers

Package managers connect ecosystem packages to Symposium without owning activation
policy. Each configured instance discovers a workspace, identifies packages,
loads plugin descriptions, and obtains package content in its own ecosystem.

## Anchors

> **`A-pm-context-integrity`** (draft): **Package-manager answers cannot change identity or conceal failure**
> Property: Only validated identities and workspace roots enter the plugin graph; resolved versions satisfy the requested ecosystem requirement, and unavailable or interrupted managers remain distinguishable from successful empty discovery.
> Authority: `R-package-boundaries`; `R-preserve-user-artifacts`
> - Criterion `response-validation` [test]: Exercise external managers returning foreign identities, relative roots, out-of-root members, and disagreeing workspace roots; assert rejection before activation or writes.
> - Criterion `failure-is-not-empty` [test]: Inject transport, normalization, and handshake failures and a healthy empty answer; assert that only the healthy result permits absence-based cleanup.
> - Criterion `package-identity` [test]: Exercise canonical-name aliases and version ranges through in-process and remote managers; assert stable idempotent names, reply order and cardinality, exact versions satisfying each request, and content roots valid for the connection lifetime.
> - Criterion `cancelled-connection` [test]: Cancel a request with a delayed reply and child process; assert that the connection is not reused, the child tree is reaped, and the reply cannot satisfy a later request.


## Interface and context

The SDK defines a common interface for in-process and external implementations.
External managers use newline-delimited JSON-RPC 2.0 on stdio, with sequential
requests and no Content-Length framing. Canonical-name replies preserve input
order and length; normalization is stable and idempotent. Initialization establishes protocol compatibility and manager identity;
the operations include canonical names, active plugins, plugin loading,
dependency listing, project information, search, fetch, and refresh.

A manager returns an identity, content root, and raw manifest, which it may
synthesize from an ecosystem-specific format. Core validation, defaults,
normalization, and trust rules still apply. Returned content is read-only to
Symposium and remains valid for the connection lifetime. A manager's cache must
be rebuildable; its content is not durable user state.

An instance owns its configuration, cache, and working context. Its returned
plugin identities must belong to that manager; foreign identities are rejected.
Paths used as package or workspace roots must be absolute. Healthy managers must
agree on the selected workspace root; a returned member outside that root is
invalid. The core validates responses before using them in selection or cleanup.

A successful empty answer, a package without a plugin, and an unavailable manager
are distinct outcomes. Malformed responses, failed normalization, transport
failure, and cancellation retain unavailability evidence. They cannot be
flattened into an authoritative empty set.

## Process lifetime and deadlines

A remote instance starts lazily and completes a checked handshake. A failed
connection remains unavailable for the invocation rather than repeatedly
spawning on each operation. Canonical-name mappings may be cached for that
connection's lifetime.

The connection is made unavailable before an interrupted request can leave an
unmatched reply for a later request. Dropping or expiring a connection terminates
and reaps its process tree. Ordinary requests have a 30-second deadline.
All remote package-manager work during one hook shares a two-second absolute
deadline, including startup and multiple managers. Healthy local contributions
remain available after a remote deadline. This deadline is separate from the
plugin execution budget in [Hooks](hooks.md).

## Cargo

The Cargo manager reports direct dependencies from workspace metadata, including
development dependencies and the union across members; transitive packages do
not automatically become direct dependency candidates. Workspace members are
distinguished from dependency packages. One lazily populated workspace context
is reused within an invocation. Across invocations, freshness includes the
lockfile and the manifests that determine the selected workspace, including
missing candidate manifests whose later appearance can change that choice.

The built-in manager and an externally configured Cargo manager use the same SDK
boundary; replacing the built-in instance does not duplicate its identities.
Package inspection uses embedded, cached content for dependency discovery rather
than issuing a registry search for every dependency. Acquisition fetches a
requested package when an explicit selection or refresh requires it.

Requests carry ecosystem-defined version requirements; successful replies carry
exact resolved versions satisfying them. With update none, load/fetch serves
cached content without network access. Immutable package versions occupy separate cache locations. Git acquisition also
tracks the requested reference and resolved commit. Metadata failures are visible
to explicit workspace commands; hook/help paths may degrade while preserving
failure evidence for [delivery cleanup](delivery.md).

Version constraints and additional registries belong to package resolution, not
to string comparisons by downstream capability consumers. Their source
interpretations and implementation assessment are tracked in the migration work.

# State and Caching

Caches avoid repeating expensive package and predicate work on every agent event.
They are disposable derived state. Losing a cache may require recomputation; it
must not grant consent, revoke ownership, or change the meaning of configuration.

## Anchors

> **`A-cache-declared-validity`** (draft): **Cached applicability respects every declared dependency**
> Property: Predicate and workspace results are reused only while their context, cache version, and complete declared inputs remain valid; loss of derived state never creates user policy.
> Authority: `R-fresh-applicability`; `D-declared-cache-inputs`
> - Criterion `watch-invalidation` [test]: Vary file existence, mtime, size, environment value or absence, and each time deadline independently; assert recomputation whenever any watch changes.
> - Criterion `cache-boundaries` [test]: Exercise empty watches, zero-duration watches, relative paths in two workspaces, and cache-version changes; assert the documented reuse or invalidation and unchanged consent.
> - Criterion `workspace-inputs` [test]: Create a previously missing candidate manifest and change an existing workspace input; assert the next eligible sync selects the new workspace/plugin set despite debounce.


## State ownership

User configuration stores durable choices. Per-directory state stores synchronization
inputs and notices already delivered. Package and registry caches hold acquired
content. Predicate caches hold results with their declared dependencies.
Installation records identify artifacts Symposium owns. These records have
different invalidation rules and must not be substituted for one another.

Workspace state is keyed by normalized directory identity so moving between
members does not confuse their event context. Shared workspace discovery can be
reused within one invocation. A cache parse or schema-version failure discards
derived state and recomputes it, rather than interpreting it as user policy.

The user-state file also records detection history, explicit agent choices,
update-check time, the MCP ledger, and trial-created enablement. A malformed
user-state file loads defaults, which loses history but supplies no new ownership.
A ledger entry is removed only after its external configuration removal succeeds;
a failure retains it for retry. Legacy entries with no ledger evidence are not
removed by name alone.

## Refresh levels

Ordinary hooks use cached dependency inspection and `UpdateLevel::None`.
Session start bypasses the ordinary sync freshness gate and requests
`Check`, while respecting each registry's automatic-update setting. It refreshes
already installed hook sources without eagerly installing every possible hook
tool. Explicit fetch can reacquire content even when the version is unchanged.

Sync's short debounce avoids redundant writes, but changed selected content must
bypass it. Workspace freshness covers every input capable of changing the
selected root or plugin set, including the appearance of a previously absent
candidate manifest. A remote lookup failure supplies no new freshness evidence.

## Predicate dependencies

A predicate result consists of its exit status and declared watch inputs:

| Watch | Cache remains valid while |
| --- | --- |
| File | Existence, modification time, and size match |
| Environment | The value or absence matches |
| Time | The shortest declared deadline has not elapsed |

Watches combine as a union: changing any dependency invalidates the result.
Relative file watches resolve against the predicate's workspace context.
An empty watch set means no declared invalidator and may be cached indefinitely
within the same cache version; a zero time watch forbids reuse. Unknown shell
dependencies cannot be guessed into a reusable result. Cheap context predicates
may use invocation-local memory.

The on-disk predicate cache is per workspace and versioned. A format change
invalidates old entries. It stores only the dependencies required for correctness;
telemetry must not copy their raw paths or environment values.

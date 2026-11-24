# Telemetry

Telemetry measures opted-in reach, public extension resolution, skill activation,
and hook reliability. Recording is local and best effort. It must not collect
user content or turn a recording failure into a failed command or agent event.

## Anchors

> **`A-telemetry-consent`** (draft): **Only current consent enables recording**
> Property: Disabled or stale-consent configurations create no telemetry files or identity state. Only current explicit consent activates the disclosed local catalogue; disable stops future recording without deleting retained files.
> Authority: `R-telemetry-privacy`
> - Criterion `consent-states` [test]: Exercise missing, false, unversioned true, stale, and current consent through hooks, sync, and commands; assert no state or files except in Enabled.
> - Criterion `controls-and-disclosure` [test]: Exercise interactive default-no and explicit noninteractive acknowledgement, disable, clear, and reset-identifiers; assert identical init/enable disclosure and the documented independent effects on consent, files, keys, cohorts, and day high-water mark.
> - Criterion `failure-isolation` [test]: Inject lock contention, malformed identity state, unsupported state versions, I/O failures, and oversized input; assert unchanged user-operation results, no overwrite of invalid existing state, and bounded non-waiting recording.

> **`A-telemetry-data-boundary`** (draft): **Only closed, provenance-checked data reaches telemetry**
> Property: Telemetry accepts typed bounded observations, never raw user or plugin payloads. Names require allowlisted public provenance and exact valid coordinates; private content remains unnamed or opaque, and routine activity becomes aggregates rather than invocation rows.
> Authority: `R-telemetry-privacy`
> - Criterion `forbidden-data` [test]: Feed distinctive secrets through prompts, tool arguments, errors, paths, environment values, private names, raw session IDs, and plugin metadata; assert none occurs in stored or shown event bytes and no arbitrary-field serialization route exists.
> - Criterion `provenance-and-witnesses` [test]: Vary public, private-registry, git, path, workspace, unknown, and invalid coordinates; assert permitted names only, fixed unnamed reasons, successful-branch evidence, and depth/leaf/byte bounds without predicate reexecution.
> - Criterion `invocation-attribution` [test]: Exercise valid, stale, corrupt, absent, ambiguous, private, and overflow installation mappings; assert only fingerprint-verified public skills are named and unsupported agent signals produce no invented invocation count.

> **`A-telemetry-scoped-identity`** (draft): **Correlation remains purpose-scoped and time-bounded**
> Property: Derived identifiers are separated by measurement domain and declared dimensions, rotate at their specified window, and never expose a global installation/workspace identifier or raw vendor session ID. Identity transitions cannot move behind the durable opened-day mark.
> Authority: `R-telemetry-privacy`
> - Criterion `domain-and-window` [test]: Check fixed derivation vectors, framed field boundaries, distinct domains/dimensions, stable days 0–29, rollover on day 30, and the independent D0–D30 retention cohort.
> - Criterion `reset-and-clock` [test]: Exercise concurrent session recording, renewed consent, identifier reset, missing/invalid state, and clock rollback; assert atomic consistent transitions, no reopened day, and no disclosure of the private key.

> **`A-telemetry-bounded-storage`** (draft): **Stored observations remain bounded and truthful about incompleteness**
> Property: Recording uses whole batches and atomic aggregate snapshots under one non-waiting lock, bounded daily retention and size, and monotonic closed days. Incomplete distinct-session counts cannot appear complete.
> Authority: `R-telemetry-privacy`
> - Criterion `atomicity-and-contention` [test]: Run competing recorders and inject failure between state replacement and event/snapshot writes; assert no interleaved batches, valid old-or-new snapshots, and permanently incomplete affected session counts.
> - Criterion `limits-and-retention` [test]: Reach the daily event and metric allowances, named-bucket and session-set limits, arithmetic overflow, and D30/D31 boundaries; assert whole-batch drops, bounded overflow buckets, correct storage marker behavior, and deletion only after D30.
> - Criterion `inspection-and-closed-days` [test]: Read malformed, unknown-version, cross-day, oversized, and truncated files; assert byte-preserving raw inspection and only complete valid closed-day results from the typed reader.


## Questions and event catalogue

Resolution means an extension was selected; activation means an agent invoked it;
neither proves that it improved a task. Observed sessions require a registered
session-start hook and differ from configured agents. All measurements describe
participating installations and are lower bounds when recording can be lost.

| Event kind | Observation |
| --- | --- |
| session_start | Completed registered session start and optional return cohort |
| agent_configuration | Daily configured-agent snapshot |
| resolution_summary | Completed full sync summary |
| package_resolution | Eligible public coordinate and extension-match class |
| extension_resolution | Public extension and bounded safe selection path |
| hook_metrics | Daily agent/hook outcome counters and latency histogram |
| plugin_hook_metrics | Daily bounded plugin reliability aggregates |
| extension_invocation_metrics | Daily bounded structured skill activation aggregates |
| command | Completed eligible top-level command without arguments |
| storage_limit | At most one daily low-volume storage-limit marker |

Discovery records nothing. Ordinary hook lookup does not emit resolution rows.
Telemetry management, internal hook dispatch, and ineligible external commands
do not emit command-use rows. Counters use checked unsigned arithmetic; overflow
drops the whole affected observation.

Rows have a fixed kind, per-kind schema version, random row ID, UTC day, and
Symposium version. Only completed session-start and command rows have wall-clock
timestamps, truncated to seconds. Routine tool, prompt, and skill events never
become individual activity rows, though daily counts still disclose aggregate
activity.

## Consent and producer boundary

The effective states are Disabled, ConsentRequired, and Enabled.
An absent or false boolean disables recording; a true boolean with missing or
stale consent version requires renewed consent. Init and telemetry enable use
the same disclosure and default to no. A noninteractive enablement requires
explicit acknowledgement. Privacy expansions require a new consent version;
an editorial correction preserving meaning does not.

Operations return typed observations. A Recorder enforces consent, public identity,
correlation, and limits before reaching storage. Producers do not serialize
arbitrary maps, raw errors, or vendor payloads. Only an enabled recorder owns
the sink and identity components. Hook responses are prepared before recording.

## Identity and provenance

A private random 32-byte key lives separately from inspectable telemetry data.
Purpose-scoped identifiers use the first 128 bits of HMAC-SHA-256 over a frozen
domain, the locally anchored window, and length-framed typed dimensions.
Ordinary windows span days 0–29. The return-cohort subject is the sole cross-agent
exception, used only for session-return measurement through D30.

There is no global installation or workspace ID. Raw vendor session IDs are
inputs to keyed derivation only, never stored or unkeyed-hashed. The key is private
state and is never printed. Renewed consent and reset replace it; disable and clear
preserve it. Malformed existing state stops recording, while an unsupported
version is preserved for an appropriate binary.

Package managers carry provenance; the core maps allowlisted public registries
to ecosystem labels. A public name additionally requires a valid name and exact
version. Private registries, git, paths, workspace sources, unknown origins, and
invalid public coordinates become fixed unnamed reasons. Raw URLs and private
names never enter events.

Selection witnesses come from the original successful predicate pass, not a second
evaluation. They retain safe public nodes and successful branches, replacing
private/non-package details or limits with opaque markers. A negation never
reveals its child. Paths are bounded to depth 8, 16 leaves, and 4 KiB of compact
UTF-8 JSON. These are evidence paths, not filesystem paths.

## Attribution and aggregation

Sync atomically writes an installation index mapping actual agent-facing skill
identifiers to installed content, marker fingerprints, and safe attribution.
This is functional installation state and may exist while telemetry is disabled.
Invocation attribution checks the index and fingerprint; it never guesses
from a path or skill text when the index is missing or stale.

The first adapter is Claude's structured Skill attempted/completed/failed signal.
Other agents' absence means unknown, not zero. Each phase is an independent
lower bound; completed plus failed need not equal attempts when updates are lost.

Daily hook histograms use fixed millisecond bounds
`[5, 10, 25, 50, 100, 250, 500, 1000]`. Identified-session sets are all-or-nothing
and capped at 256. A missing ID, overflow, or state/snapshot divergence discards
the sets and marks that day's count incomplete. Public plugin rows and public
skill rows each have a separate limit of 128 per day; later identities merge
into overflow buckets. First-observed named subsets are biased toward earlier
observations.

## Storage and controls

Low-volume rows append to `events-YYYY-MM-DD.jsonl`; daily aggregates replace
`metrics-YYYY-MM-DD.jsonl` atomically. A sibling private state file holds the key,
anchors, day high-water mark, and temporary aggregate sets. One non-waiting lock
guards both. Contention drops a batch or observation without delaying another
recorder. Atomic replacement does not promise fsync durability.

The opened-day high-water mark never decreases. An older-dated observation is
dropped; a clock rollback cannot reopen closed files. Typed archive reading
validates complete, closed, unexpired days; raw show preserves even malformed
and unknown-version bytes.

Events, metrics, and the reserved marker share 8 MiB per day; aggregates receive
at most 512 KiB, a marker at most 2 KiB, and private-state reads a 16 MiB ceiling.
A relationship batch is never split. A full event allowance stops low-volume
appends for the day while bounded metrics may continue. Files survive D30 and
first become eligible for lazy deletion on D31.

Disable preserves files. Clear removes recorded files and pending aggregate sets
while preserving consent, identity/cohort anchors, and high-water mark. Reset rotates
future identifiers without rewriting old files or moving time backward. No upload,
arbitrary plugin telemetry, or subjective outcome signal belongs to this catalogue.
Exact field schemas and derivation constants remain pinned in the
[source contract](https://github.com/symposium-dev/symposium/blob/3516c051c07838bdde94ea780138a8ac1c3a79a1/md/rfds/telemetry-recording/contract/recorded-data.md).

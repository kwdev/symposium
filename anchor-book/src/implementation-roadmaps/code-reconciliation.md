# Code Reconciliation

The architectural draft has been compared with the implementation and test
boundaries for all 14 design chapters, 24 anchors, and 65 criteria. The shared
architecture largely exists, but several guarantees are stronger than the code.
Four targeted probes reproduce mismatches even though the existing test suite
passes. This assessment prepares design review; it does not accept the draft
records or complete their implementation.

## Baseline and method

Reviewed on 2026-11-24 at merge
`10f7d4e46123e3590b56d493de390e14ef01d4e3`, with the uncommitted Book and
branch-ownership changes. Production behavior comes from upstream
`3516c051c07838bdde94ea780138a8ac1c3a79a1`; the existing trial and fixture/link
changes are retained. Code paths below name this checkout. Source policy was
checked against the pinned source, including its common-issues and audit design.

For each guarantee, trace the implementing boundary, find relevant tests, and
separate an implementation match from complete assertion coverage. The matrix
below names every criterion. It is an assessment, not new engine test associations.
Passing existing tests do not make an unlinked criterion verified.

[System Architecture](../design/system.md) supplies the cross-capability view:
CLI and hooks resolve package/registry inputs, select an active graph, and deliver
through agent adapters. Its guarantee map delegates to the owning anchors below.
The resolver, context, cleanup, and telemetry findings assess those interactions,
including boundaries whose modules exist but are not yet wired together.

## Confirmed and inspected differences

### Disablement is not enforced on all activation routes

**Reproduced.** `discovery::enabled_dependencies` filters disabled dependencies,
but `plugins::resolve_active_plugins` seeds registry/workspace definitions and
loads chains without applying the same disable check. `Plugin::applies` checks
dormancy and predicates, not disablement.

The probes confirm both a disabled registry plugin and a disabled chained Cargo
package remain in the active set. The registry probe first verifies that
`PluginsConfig::is_disabled` recognizes that exact identity, excluding a naming
mismatch as the explanation. This conflicts with `A-activation-consent`, whose
disablement guarantee is supported by the upstream discovery policy and
common-issues guidance. Preserve the guarantee. Existing upstream tracking and
the open fix are identified below; these probes add independent confirmation,
not a new failure mode.

### Predicate caches bypass declared invalidation

**Reproduced.** `predicate::evaluate_custom` returns an in-memory result before
checking its watch set. A predicate emitting `watchTime: 0` executes once across
two evaluations in the same context, where the SDK and Book require no reuse.

A second probe persists a relative file watch, creates that file in the context's
workspace, and evaluates in a fresh context. It again executes only once:
`Fingerprints::capture` interprets stored relative paths against the process
directory, not `PredicateContext::cwd`. Custom command execution also does not
receive that context's cwd. These are gaps in `A-cache-declared-validity`.
Other in-memory watch changes and command-definition changes require follow-up
assessment; the two probes establish only the cases above.

### Staging does not make replacement atomic

**Inspected implementation gap; replacement failure not injected.**
`sync::install_staged` fills a temporary directory, deletes the old destination,
then renames the staging directory. A failed copy preserves the old tree, as
`sync_preserves_installed_skill_after_failed_update` tests. A failure or
interruption after deletion does not have a rollback path. Readers can also
observe a missing destination between those operations.

The broader replacement guarantee in `A-delivery-owned-content#atomic-replacement`
therefore remains unmet. The source supports staged-copy protection; review and
implement the stronger atomic replacement/rollback obligation before claiming it.
Do not relabel the narrower passing copy-failure test as full coverage.

### Malformed package responses can lose failure evidence

**Inspected call-path gap; cleanup consequence not reproduced.**
`RemotePm::call` restores a usable connection before deserializing the result.
A result-shape error lacks the transport `Unavailable` marker.
`PmInstance::load_plugin` also drops invalid manifests, foreign identities, or
relative roots through `validate_all` without marking the manager failed.
Successful `active_plugins` listings can carry errors which the convenience
method discards.

Transport failure and canonical-name failure do retain evidence, and the existing
remote-manager tests exercise those cases. They do not establish that every
malformed-load path protects cleanup. This is a gap against
`A-pm-context-integrity#failure-is-not-empty` and
`A-delivery-incomplete-sources`; use a healthy-install/invalid-next-load regression
before changing failure classification. A legitimate package-not-found response
must remain distinct and must not disable cleanup indefinitely.

### A shared resolver does not guarantee identical predicate contexts

**Inspected implementation gap.** Sync supplies registry custom predicates and a
disk cache through `PredicateContext::with_custom_predicates`. Hook dispatch and
subcommand/help selection construct plain contexts. Subcommand selection also
re-evaluates gates in a fresh context without the supplied workspace cwd.

Thus the shared `active_plugins` function exists, but a custom predicate that
admits a skill during sync need not admit its hook or command.
`A-activation-shared-graph#facet-consistency` requires an end-to-end fixture across
all consumers. Package-defined custom predicates are explicitly warned as
undispatched by `warn_undispatched_crate_features`, a separate known limitation.

### Chained version requirements are discarded

**Inspected implementation gap.** The normalized chained declaration retains a
version requirement, but `plugins::record_active` enqueues
`CargoPm::id_for(&edge.name, None)`. Direct PM fetch accepts a supplied version;
the chain path drops it before that boundary.

Preserve the PM requirement-resolution goal and add a chain-specific incompatible
version case. Name canonicalization and version satisfaction are separate
obligations within `A-pm-context-integrity#package-identity`.

### Plugin commands capture output instead of inheriting stdio

**Inspected implementation gap.** `subcommand_dispatch::spawn` calls
`Command::output()`. Output is buffered and forwarded after exit, and stdin is
not inherited. Arguments are correctly appended as structured argv, and exit
codes are propagated, but interactive input and live output do not satisfy
`A-command-transparent-dispatch#argv-and-exit`.

The upstream subcommand design explicitly promises inherited stdio. Keep that
goal and test the actual binary with stdin and streaming output before changing
dispatch. Current dispatch tests cover command selection and result text, not
this entire contract.

### Telemetry foundations are ahead of runtime integration

**Inspected implementation gap.** Typed schema, identifier derivation, bounded
storage, and aggregate state modules exist with substantial unit tests.
They are deliberately inert pending the recorder. The runtime configuration
still has only `TelemetryConfig.enabled`; CLI enable sets that boolean, and
show reserializes legacy `TelemetryEvent` rows. It has no versioned consent,
clear/reset controls, or byte-preserving archive reader.

A code-wide call-site search finds the legacy recording functions used by their
tests, not production hook/sync producers. There is no Recorder, public-identity
policy, resolution witness producer, or installed-extension attribution index
wired into those operations. No production collection is inferred from the old
event types' presence.

The telemetry chapter remains the intended accepted-source design.
Its four anchors need runtime integration evidence, not just schema/storage tests.
The missing versioned consent flow and producer boundary must precede activation.

### Configuration findings need a narrower claim

**Inspected.** `save_config` correctly refuses an unreadable configuration, but
serializes a fresh TOML document for readable files. This does not yet fulfill
`D-raw-and-normalized-configuration`'s formatting-preservation choice.

The earlier roadmap correctly observed that `resolve_logs_dir` returns a
relative override. However, the binary initializes logging once before hook
dispatch, opening a file handle then. A child process's cwd does not relocate
that open file. This review therefore does **not** establish the previously
suggested end-to-end log-relocation bug. Retain the startup-rooting criterion and
test gap; treat construction-to-logging cwd changes and absolute-path failure
handling as cases needing a focused reproduction.

### Vendor and sandbox evidence is narrower than the draft

Adapter configuration and wire fixtures cover many cases. They do not launch
the actual vendors for every supported agent/version. In particular,
`mcp_config_paths_match_what_each_agent_reads` asserts paths; its name and comment
are not a new vendor-execution result.

Real `srt` grading tests are explicitly ignored and did not run in the ordinary
suite. Their source tests sandbox denials against unsandboxed positive controls,
which is useful candidate evidence, but a skipped test supplies no result.
Windows behavior and real-agent execution likewise remain unverified here.
The source also records Copilot reading Claude hooks, causing duplicate delivery,
and Goose discovering Claude's copies despite a disabled Goose plugin; these
vendor interactions need conformance work.

## Corrections made to the Book

- The imported revocation wording incorrectly included registry/workspace
  definitions themselves. The upstream audit design covers loaded Cargo packages.
  Updated System, Activation, Audits, and `R-enforce-revocation` to preserve that
  scope, including Cargo packages reached through registry chains. Existing IDs
  remain; no code was changed to make this correction.
- Hook format criteria now refer to payload values instead of exact JSON bytes.
  The adapter parses and serializes native JSON; whitespace preservation was an
  unsupported addition in the draft.
- The configuration roadmap now distinguishes the relative-path observation
  from a demonstrated CLI defect.

Other mismatches above remain explicit implementation or design-review work.
The Book was not rewritten to make the current code satisfy its guarantees.

## Existing upstream tracking

Checked on 2026-11-24: all 163 issues and 361 PRs, open and closed, plus 237
discussion comments and the predicate-caching PR's review comments. Upstream
`main` still names the baseline `3516c051` used for this assessment.

| Reproduced finding | Tracking and disposition |
| --- | --- |
| Registry and chained plugin disablement | Open [issue #290](https://github.com/symposium-dev/symposium/issues/290) and [PR #423](https://github.com/symposium-dev/symposium/pull/423). The PR's head `4c1731f562b73dcc55705afe610dfd243d348f8b` contains the disable check and regression tests for both routes. Its [discussion](https://github.com/symposium-dev/symposium/pull/423#issuecomment-6796461993) already reproduces both failures. Reuse that tracking; no duplicate issue or additional diagnostic claim is warranted. This assessment inspected the patch but did not execute that PR's tests. |
| Zero-TTL memory-cache reuse | Filed [bug #530](https://github.com/symposium-dev/symposium/issues/530) after finding no matching report. [Implementation PR #268](https://github.com/symposium-dev/symposium/pull/268) and [RFD #262](https://github.com/symposium-dev/symposium/pull/262) state that `WatchTime(0)` disables caching. |
| Relative file-watch invalidation | Filed [bug #531](https://github.com/symposium-dev/symposium/issues/531) after finding no matching report, with the workspace-cwd reproduction. |

Both reports follow Symposium's bug form, have type Bug and the bug label, and
cite the published branch and Book-led investigation. Their exact assertion
failures were reproduced again on `12df46340d2e125b61577bbc427d256ea4ab11b0`;
the reports pin the probes and Book evidence to that commit. Project-board
placement remains pending. Filing reports does not accept or verify draft anchors.

## Criterion assessment

“Related tests” below are places to assess assertions and add associations, not
a claim of full criterion coverage. The ordinary suite ran on Linux; vendor,
Windows, ignored-sandbox, and future-runtime obligations remain separate.

### Configuration Loading

[Owning design](../design/configuration-loading.md). `config::{load_config_from,save_config,init_logging}`; `dirs`.

| Anchor / criterion | Code and evidence assessment |
| --- | --- |
| [A-config-directory-resolution](../design/configuration-loading.md#A-config-directory-resolution) · `precedence` | Partial linked evidence; only XDG logs are linked. Full override/fallback matrix remains. |
| [A-config-directory-resolution](../design/configuration-loading.md#A-config-directory-resolution) · `empty-and-relative` | Partial Unix CLI evidence in `empty_env_dirs_are_ignored`; cache/state matrix remains. |
| [A-config-directory-resolution](../design/configuration-loading.md#A-config-directory-resolution) · `startup-relative` | Config/cache rooting exists; logging observation qualified above. End-to-end path assertions remain. |
| [A-config-unreadable-file-unchanged](../design/configuration-loading.md#A-config-unreadable-file-unchanged) · `save-refused` | Existing tests check error/path/bytes; invalid UTF-8 represents unreadability, not permission-denied I/O. |
| [A-config-unreadable-file-unchanged](../design/configuration-loading.md#A-config-unreadable-file-unchanged) · `commands-refuse` | Init refusal is linked; other saving commands and artifact preservation need full assertions. |
| [A-config-unreadable-file-unchanged](../design/configuration-loading.md#A-config-unreadable-file-unchanged) · `missing-file-saved` | Parsing/creation tests exist; actual empty file and full save/load equivalence remain. |
| [A-config-unreadable-run-continues](../design/configuration-loading.md#A-config-unreadable-run-continues) · `auto-update-off` | Mock update nonexecution is linked; full defaults and warning assertions remain. |
| [A-config-unreadable-run-continues](../design/configuration-loading.md#A-config-unreadable-run-continues) · `hooks-continue` | Fallback path exists; no complete comparison of invalid versus absent config hook output is linked. |

### Plugin Model

[Owning design](../design/plugin-model.md). `plugins::{validate_manifest,validate_plugin,resolve_plugin_paths}`; `plugins/agent_plugin.rs`; `pm/layout.rs`.

| Anchor / criterion | Code and evidence assessment |
| --- | --- |
| [A-plugin-package-boundary](../design/plugin-model.md#A-plugin-package-boundary) · `contained-input` | Canonical containment checks exist; `agent_plugin_read` and loader unit tests cover escapes. Review every manifest/skill boundary before linking. |
| [A-plugin-package-boundary](../design/plugin-model.md#A-plugin-package-boundary) · `package-unit` | Layout stops at recognized roots; registry/package fixtures exercise grouped skills. Complete identity/dedup assertions need association. |

### Package Managers

[Owning design](../design/package-managers.md). `pm::{PmInstance,PmRegistry,Workspace}`; `pm/remote.rs`; `symposium-pm-cargo/src/lib.rs`.

| Anchor / criterion | Code and evidence assessment |
| --- | --- |
| [A-pm-context-integrity](../design/package-managers.md#A-pm-context-integrity) · `response-validation` | Ownership and absolute-root checks exist; PM unit/remote tests cover cases. Invalid-load failure propagation remains a separate gap. |
| [A-pm-context-integrity](../design/package-managers.md#A-pm-context-integrity) · `failure-is-not-empty` | Transport and canonical-name tests support those paths; malformed load/manifest paths can lose failure evidence. |
| [A-pm-context-integrity](../design/package-managers.md#A-pm-context-integrity) · `package-identity` | Canonical names and cardinality validation exist; chains discard version requirements. Lifetime and full version matrix unverified. |
| [A-pm-context-integrity](../design/package-managers.md#A-pm-context-integrity) · `cancelled-connection` | Dead-before-await state and owned process tree exist; `remote_pm_cancellation` exercises Unix cancellation. Windows evidence remains. |

### Activation and Consent

[Owning design](../design/activation.md). `plugins::{resolve_active_plugins,record_active}`; `discovery::{decide,apply_consent,enabled_dependencies}`.

| Anchor / criterion | Code and evidence assessment |
| --- | --- |
| [A-activation-consent](../design/activation.md#A-activation-consent) · `routes-and-overrides` | Mismatch reproduced for disabled registry and chained packages. Cargo revocation remains a different policy. |
| [A-activation-consent](../design/activation.md#A-activation-consent) · `prompt-persistence` | `discovery` unit tests and non-Cargo consent reload tests are candidates; full interactive dismissal/noninteractive matrix unverified. |
| [A-activation-shared-graph](../design/activation.md#A-activation-shared-graph) · `facet-consistency` | Shared resolver exists; custom-predicate contexts differ across sync, hooks, help, and dispatch. |
| [A-activation-shared-graph](../design/activation.md#A-activation-shared-graph) · `chains-and-context` | Canonical visited set exists; `init_sync` cycle, diamond, and name-alias cases pass. Multi-ecosystem/sibling-context assertion review remains. |
| [A-activation-shared-graph](../design/activation.md#A-activation-shared-graph) · `workspace-scope` | `UseEntry::applies_in` checks absolute scope; local/global tests exist. Full cross-workspace matrix not yet associated. |

### State and Caching

[Owning design](../design/state-and-caching.md). `predicate::{evaluate_custom,run_custom_predicate}`; `predicate_cache`; PM workspace state.

| Anchor / criterion | Code and evidence assessment |
| --- | --- |
| [A-cache-declared-validity](../design/state-and-caching.md#A-cache-declared-validity) · `watch-invalidation` | Watch/fingerprint primitives exist; unconditional memory hits bypass revalidation. Disk watch cases have candidate unit tests. |
| [A-cache-declared-validity](../design/state-and-caching.md#A-cache-declared-validity) · `cache-boundaries` | Two reproduced mismatches: zero TTL reused in memory, relative watched file rooted in the wrong context. |
| [A-cache-declared-validity](../design/state-and-caching.md#A-cache-declared-validity) · `workspace-inputs` | PM inputs include absent candidate manifests; remote no-change and auto-sync freshness tests exist. Full required matrix not linked. |

### Skill and Plugin Delivery

[Owning design](../design/delivery.md). `sync::{install_staged,cleanup_held_back,lock_sync,unregister_recorded_mcp_servers}`; `compile`; trial state.

| Anchor / criterion | Code and evidence assessment |
| --- | --- |
| [A-delivery-owned-content](../design/delivery.md#A-delivery-owned-content) · `ownership-and-aliases` | Marker, symlink, collision and canonical-target handling exist; `init_sync` has relevant preservation tests. |
| [A-delivery-owned-content](../design/delivery.md#A-delivery-owned-content) · `atomic-replacement` | Copy-failure retention is tested. Delete-before-rename violates the broader replacement/rollback guarantee. |
| [A-delivery-owned-content](../design/delivery.md#A-delivery-owned-content) · `trial-withdrawal` | `plugin_try` covers pre-existing/recreated use and missing-source removal; review ledger/shared-name cross-product before linking. |
| [A-delivery-owned-content](../design/delivery.md#A-delivery-owned-content) · `concurrent-sync` | `sync.lock` exists; `concurrent_syncs_keep_every_skill` tests skills. Full artifact/config consistency remains unverified. |
| [A-delivery-incomplete-sources](../design/delivery.md#A-delivery-incomplete-sources) · `retained-surfaces` | Shared holdback and transport-failure tests exist; malformed-load paths and full surface matrix remain gaps. |
| [A-delivery-incomplete-sources](../design/delivery.md#A-delivery-incomplete-sources) · `revoked-exception` | Revoked cleanup bypasses holdback and retains shared names; complete failure-plus-revocation matrix not associated. |

### Package Audits and Revocation

[Owning design](../design/audits.md). `audits::{AuditIndex,digest}`; package worklist in `plugins`; revoked cleanup in `sync`.

| Anchor / criterion | Code and evidence assessment |
| --- | --- |
| [A-audit-revocation](../design/audits.md#A-audit-revocation) · `revocation-before-execution` | Cargo revocation precedes package gates; corrected trust-root scope. Audit lookup and activation cases are candidates; all no-execution assertions need review. |
| [A-audit-revocation](../design/audits.md#A-audit-revocation) · `audit-is-not-consent` | Typed verdict remains separate from enablement; `discovery` and audit tests support this boundary. |
| [A-audit-payload-identity](../design/audits.md#A-audit-payload-identity) · `content-and-framing` | Golden digest, metadata, resource and rename/order tests exist; unrelated source code is explicitly excluded from the payload. |
| [A-audit-payload-identity](../design/audits.md#A-audit-payload-identity) · `ineligible-inputs` | `ineligible_payloads` covers external/broken/cyclic/unsupported content cases. Platform and resource-limit assertion completeness remains. |

### Agent Adapters

[Owning design](../design/agents.md). `agents/mod.rs`; `agents/mcp_server_registration.rs`; plugin registration adapters.

| Anchor / criterion | Code and evidence assessment |
| --- | --- |
| [A-agent-registration-ownership](../design/agents.md#A-agent-registration-ownership) · `round-trip-settings` | Per-adapter registration tests cover preservation and no-write second registration; full disabled-state/removal matrix remains. |
| [A-agent-registration-ownership](../design/agents.md#A-agent-registration-ownership) · `real-config-targets` | No new real-vendor execution. Path fixtures and source's historical vendor observations do not satisfy this criterion. |
| [A-agent-registration-ownership](../design/agents.md#A-agent-registration-ownership) · `symlink-and-mode` | JSON target resolution/mode preservation implemented and tested; all adapter formats/platforms still need scoped assessment. |

### Hooks

[Owning design](../design/hooks.md). `hook::{execute_hook_inner,dispatch_plugin_hooks,run_with_deadline}`; hook schemas; installation/process-tree boundary.

| Anchor / criterion | Code and evidence assessment |
| --- | --- |
| [A-hook-format-selection](../design/hooks.md#A-hook-format-selection) · `candidate-priority` | `hook_format_priority` checks native/fallback/agent/gate selection; multiple-handler order and complete payload assertions need association. |
| [A-hook-format-selection](../design/hooks.md#A-hook-format-selection) · `canonical-boundary` | Wire/format and non-occurrence fixtures exist. Exact JSON formatting is no longer an invented obligation. |
| [A-hook-cancellation](../design/hooks.md#A-hook-cancellation) · `execution-budget` | Five/eight-second dispatch limits and process-tree cleanup exist; timeout tests pass. Windows and full failure-path scope remain. |
| [A-hook-cancellation](../design/hooks.md#A-hook-cancellation) · `acquisition-budget` | `hook_setup_respects_the_total_budget` covers setup; install/git process-tree tests are candidates, not full combined evidence. |
| [A-hook-cancellation](../design/hooks.md#A-hook-cancellation) · `remote-deadline` | `remote_pm_hook_deadline` exercises shared budget, handshake and local responses. No whole-hook bound is inferred for unbounded predicates before dispatch. |
| [A-hook-agent-response](../design/hooks.md#A-hook-agent-response) · `blocking-wire` | `hook_decisions`, Antigravity and schema tests cover host-actionable output. These are fixtures, not every real vendor/version. |
| [A-hook-agent-response](../design/hooks.md#A-hook-agent-response) · `context-merge` | `hook_context`, `hook_stdout`, and Antigravity fixtures cover joined context, invalid output, and protocol stdout. |
| [A-hook-agent-response](../design/hooks.md#A-hook-agent-response) · `notice-delivery` | `plugin_notice` covers blocked/unsupported responses and subsequent notices; full criterion association remains. |

### MCP Capabilities

[Owning design](../design/mcp.md). Agent serializers and paths; `sync::{package_mcp_servers,plugin_data_dir,unregister_withdrawn_mcp_servers}`.

| Anchor / criterion | Code and evidence assessment |
| --- | --- |
| [A-mcp-owned-registration](../design/mcp.md#A-mcp-owned-registration) · `shape-and-scope` | Current per-agent native serializers/fallbacks match the chapter. Meta-server replacement is absent and remains a proposal. |
| [A-mcp-owned-registration](../design/mcp.md#A-mcp-owned-registration) · `owned-removal` | Ledger-based removal/retry and shared-name retention exist; `init_sync`, remote failure and trial tests cover subsets. |
| [A-mcp-owned-registration](../design/mcp.md#A-mcp-owned-registration) · `package-context` | `agent_plugin_mcp_cwd` exercises Unix launch/private path. Windows package cwd and across-version data identity lack full evidence. |

### Commands and Acquisition

[Owning design](../design/commands.md). `subcommand_dispatch`; `installation`; CLI and report layer.

| Anchor / criterion | Code and evidence assessment |
| --- | --- |
| [A-command-transparent-dispatch](../design/commands.md#A-command-transparent-dispatch) · `argv-and-exit` | Structured argv and exit propagation exist. `Command::output()` does not supply inherited stdin or streaming output. |
| [A-command-transparent-dispatch](../design/commands.md#A-command-transparent-dispatch) · `selection-and-collision` | Reserved names and ambiguous-command errors exist; dispatch/unit tests cover selection. Custom-gate context inconsistency remains. |

### Telemetry

[Owning design](../design/telemetry.md). `telemetry/{schema,identity,state,storage}` foundations; legacy `telemetry/mod.rs`, config and CLI.

| Anchor / criterion | Code and evidence assessment |
| --- | --- |
| [A-telemetry-consent](../design/telemetry.md#A-telemetry-consent) · `consent-states` | Runtime versioned consent/Recorder absent. Existing boolean is insufficient for this goal. |
| [A-telemetry-consent](../design/telemetry.md#A-telemetry-consent) · `controls-and-disclosure` | Enable/disable/status/show exist in legacy form; disclosure acknowledgement, clear and reset are not integrated. |
| [A-telemetry-consent](../design/telemetry.md#A-telemetry-consent) · `failure-isolation` | Non-waiting storage primitives tested; no Recorder call-site evidence for the full user-operation guarantee. |
| [A-telemetry-data-boundary](../design/telemetry.md#A-telemetry-data-boundary) · `forbidden-data` | Closed typed schema exists; producer/Recorder boundary is missing. Legacy row types must not be wired as a substitute. |
| [A-telemetry-data-boundary](../design/telemetry.md#A-telemetry-data-boundary) · `provenance-and-witnesses` | No integrated public-identity policy or one-pass witness producer; schema tests cover representation only. |
| [A-telemetry-data-boundary](../design/telemetry.md#A-telemetry-data-boundary) · `invocation-attribution` | Aggregate vocabulary exists; installation index and agent-to-recorder attribution are not integrated. |
| [A-telemetry-scoped-identity](../design/telemetry.md#A-telemetry-scoped-identity) · `domain-and-window` | Identity/state tests exercise typed vectors and windows; runtime lifecycle integration remains. |
| [A-telemetry-scoped-identity](../design/telemetry.md#A-telemetry-scoped-identity) · `reset-and-clock` | High-water/cohort state primitives exist; CLI reset and concurrent production recorder path are absent. |
| [A-telemetry-bounded-storage](../design/telemetry.md#A-telemetry-bounded-storage) · `atomicity-and-contention` | Lock, batch and snapshot primitives plus failure-injection tests exist; no complete producer/storage path. |
| [A-telemetry-bounded-storage](../design/telemetry.md#A-telemetry-bounded-storage) · `limits-and-retention` | Storage/aggregate limits and lifecycle tests exist; full user-level retention/control behavior remains future work. |
| [A-telemetry-bounded-storage](../design/telemetry.md#A-telemetry-bounded-storage) · `inspection-and-closed-days` | Legacy show parses/reserializes recognized rows; byte-preserving raw inspection and typed closed-day archive reader are not integrated. |

### Evaluation and Verification

[Owning design](../design/evaluation.md). `symposium-eval` task validation, grade import/hidden/process, run policy/grading and trial phases.

| Anchor / criterion | Code and evidence assessment |
| --- | --- |
| [A-evaluation-trusted-grading](../design/evaluation.md#A-evaluation-trusted-grading) · `editable-import` | Trusted-copy import and protected-file checks exist; import/containment tests exercise edits and hostile file types. |
| [A-evaluation-trusted-grading](../design/evaluation.md#A-evaluation-trusted-grading) · `grading-isolation` | Real srt adversarial tests exist but are ignored; ordinary-suite success provides no real-sandbox result. |
| [A-evaluation-trusted-grading](../design/evaluation.md#A-evaluation-trusted-grading) · `hidden-check-execution` | Listing/exit/final-summary checks implemented; `grade::hidden` and task tests are candidates. Forged stdout remains the documented limit. |
| [A-evaluation-evidence-integrity](../design/evaluation.md#A-evaluation-evidence-integrity) · `failure-classification` | Typed setup/session/infrastructure/grade outcomes preserve partial reports; full criterion assertions need association. |
| [A-evaluation-evidence-integrity](../design/evaluation.md#A-evaluation-evidence-integrity) · `process-containment` | Trial phases stop before path reads if containment is uncertain; supervisor tests exist. Real sandbox/platform evidence remains separate. |
| [A-evaluation-evidence-integrity](../design/evaluation.md#A-evaluation-evidence-integrity) · `trial-separation` | Separate batch inputs/trial homes/policies exist with model-free fixtures; real isolation tests were not run. |

## Execution evidence

Linux x86_64, Rust 1.99.1, nextest 0.9.151; agent testing disabled.

| Check | Result and limits |
| --- | --- |
| `cargo nextest run --workspace --locked --offline --no-fail-fast` | 2,160 passed, 29 skipped across 51 binaries; run `a093f5b1-7d3b-4b6b-a329-4aa3447d1d1d`. No real-agent, ignored-srt, Windows or doctest evidence is added by this run. |
| Reconciliation probes | Four failures against intended assertions: disabled registry plugin, disabled chained package, zero-TTL memory reuse, relative-workspace file invalidation. Each reached its intended assertion; no harness/setup failure is counted as a mismatch. |
| `anchorbook check --config anchorbook.toml`; `mdbook build anchor-book` | Passed structural/v1 and rendering. All 29 generated HTML pages have valid local file/fragment references. Mermaid emits the existing mdBook 0.5.0/0.5.4 compatibility warning. Structure and links do not establish semantic completeness. |
| `anchorbook verify --config anchorbook.toml --method test` | Eight existing linked tests passed. The engine reports one satisfied, two partial, and 21 unlinked anchors; six satisfied and 59 unlinked criteria. These execution states retain the assertion-coverage limits in the matrix; no new associations or full-coverage claims were added. |
| Diagnostic restoration and patch checks | The durable probe runner reproduced all four intended failures, restored `src/lib.rs`, and removed its temporary test target. `git diff --check` passed. |

The anchor run identifies criteria `9548cb3384aadf5f`, configuration
`83100b730874d29a`, code `fba37844e5f719af`, and the uncommitted baseline
above. The code identity is unchanged from the initial architectural draft.

The probes live in `anchor-book/reconciliation/probes.rs`, outside normal test
discovery. Reproduce in an idle checkout:

```sh
python3 anchor-book/reconciliation/run-probes.py
```

The runner temporarily exposes the existing predicate module, installs one
integration-test target, runs it, and restores visibility/removes the target in
a finally block. It changes no implementation logic. The activation fixtures use
local path dependencies, with gate/dependency preconditions asserted and Cargo
network access disabled. This avoids an unavailable registry dependency making a
disabled-plugin assertion pass merely because its gate could not be satisfied.
The reviewed baseline exits
101 with four failed intended-behavior assertions; that is recorded negative
evidence, not a passing conformance run. Persistent tests belong with the fixes,
with their expected assertions unchanged.

## Work before an integration PR

This assigned reconciliation is complete for the architectural/criterion scope
above; the wider source migration and verification remain open. Under
`book-migration-1`, the next work is to review these interpretations, turn the
confirmed mismatches into scoped implementation milestones, and map tests only
where their full assertions support the criteria. The configuration roadmap
retains its existing milestone. No bug is silently made part of the goal.

The documentation integration need not implement every future capability first.
It must distinguish the intended system from implemented and verified behavior,
retain this gap record, and settle governing source conflicts before accepting
affected records. In particular, the MCP meta-server and telemetry activation
cannot be represented as already available.

Prepare the upstream patch separately from the trial branch's removal of all
`md/` content: preserve usable user documentation and its publishing workflow,
and review which old design pages become links or are retired. That integration
choice and an actual PR are subsequent work; this assessment creates neither.

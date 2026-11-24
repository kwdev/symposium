# Book Migration

**Roadmap identifier:** `book-migration`

## Goal

Repeatedly adapt Symposium's evolving design into Anchor Book, preserving its
deliberate edits, record identities, and scoped evidence, then perform a final
reconciliation when maintainers adopt it. This branch maintains only the Anchor
Book; the source Book and user documentation remain upstream. The
[semantic coverage](source-coverage.md) records the interpreted source and remaining work.
The [code reconciliation](code-reconciliation.md) assesses the draft against
implementation and executable evidence before an integration PR.

## Source map

The original port at `982198760d67b1c236f049869575b8122a70adc4` used source
`cb858e53ee1e211f4616fe56566851d8a72e6d80`. It was also applied at
`cf3ab45dc80ed528fcb6ebec5b67f0c26d9fea8b`, on upstream base
`ca1ed19176125cf42e44e6b5b61a3a5f61130ef9`. Before this refresh, no later
per-area reconciled source revision was recorded; applying the port was not
evidence of such review.

**Current import source:** `3516c051c07838bdde94ea780138a8ac1c3a79a1`.
**Integrated code:** merge `10f7d4e4`, retaining the trial commits.
All `md/` paths below refer to that upstream Git tree, not this checkout.
A row advances only for its explicitly reviewed scope. The
[semantic source coverage](source-coverage.md) expands this map with the broad
architecture migration, precise limits of review, and unresolved source conflicts.

| Source material | Anchor Book destination or disposition | Last reconciled source / remaining work |
| --- | --- | --- |
| `md/design/configuration-loading.md`; loading introduction and Directory resolution in `md/reference/configuration.md` | [Configuration Loading](../design/configuration-loading.md): all three existing anchors, `R-predictable-directories`, `D-xdg-directory-resolution`, and `configuration-loading-1`; new criterion `startup-relative` | `3516c051c07838bdde94ea780138a8ac1c3a79a1`. Relative-home choice reconciled; test coverage and qualified log-path observations remain in the configuration roadmap. |
| `md/design/tenets.md` | [System Architecture](../design/system.md) and cross-capability requirements, preserving the four configuration requirements | Current import revision for architectural interpretation; draft acceptance remains. |
| `md/rfds/config-normalization/README.md` | Exact source attribution for `D-raw-and-normalized-configuration`; deferred editing-helper obligation recorded in `configuration-loading-1` | Source read at `3516c051c07838bdde94ea780138a8ac1c3a79a1`; full semantic reconciliation Not recorded. Parser boundaries, formatting-preservation coverage, and the pilot remain pending. |
| Remaining design areas in `md/design/`, including agent details and evaluations | Thirteen additional design chapters including the system overview; [expanded map](source-coverage.md#design-sources) names every source file | Architectural synthesis at the current import revision; detailed per-agent, module, and evaluation sections remain explicitly partial. |
| Contributor guidance in `md/design/`, including tests, common issues, governance, and tickets | Working on Symposium and skills read exact upstream Git sources | Pointers and test commands refreshed at the current import revision. Full guidance conversion Not recorded; source remains upstream. |
| Other accepted and completed RFDs | Capability chapters and retained coherent proposal contexts in [RFD coverage](source-coverage.md#rfd-sources) | Common architecture synthesized; exact schema, conflicting proposals, supporting-page detail, and implementation evidence remain scoped work. |
| Draft RFDs | Retain upstream proposal identities under the [RFD migration plan](#rfd-migration-plan); may inform assigned prototypes | Not recorded. Do not treat draft choices as agreed requirements. |
| User guides, crate-author guides, references, and other user-facing material | Retain upstream; exclude their local Book presentation from this branch. Map governing claims to affected design areas. | Branch ownership settled. Architectural claims for audits, plugin enablement/delivery, Agent Plugins, and telemetry now have destinations. Full reference-by-reference reconciliation remains pending. |
| `md/SUMMARY.md` and remaining files under `md/` | Upstream inventory/navigation input; user assets and history remain upstream | Inventory refreshed at the current import revision; full semantic dispositions remain pending. Local removal is not semantic conversion. |
| `md/reference/hook-events.md`; `md/rfds/telemetry-recording/contract/recorded-data.md` | Exact test inputs in `tests/fixtures/upstream-docs/`, with source links; consumers retain their assertions | Snapshots at `3516c051c07838bdde94ea780138a8ac1c3a79a1`. Hook and telemetry architecture now have owning chapters; exact contracts remain pinned inputs and detailed reconciliation work. |

Rows overlap where sources serve several purposes. The grouped pending rows
are an initial inventory, not full coverage. Each reconciled area must identify
precise source paths or sections, destination records, and a full reviewed hash.

### Current comparison

The 2026-11-24 sync merged current import source `3516c051` into the trial.
Against pre-merge `167b9a42`, 73 source Book files changed: 25 design files,
four RFD files, and 44 other source files, including navigation and references.
The earlier 2026-11-13 inventory at
`b55d74c9577668c251a384c3d9e8e5e44626bf7d` counted 48 changed files against
`ca1ed19176125cf42e44e6b5b61a3a5f61130ef9`; it was preparation, not a
completed semantic refresh.

The configuration design chapter remains unchanged, while the reference now
specifies startup-relative SYMPOSIUM_HOME. This refresh incorporates that intended
behavior into the draft requirement, decision, anchor, and roadmap. Existing IDs
and test links are preserved; the new `startup-relative` criterion is unlinked.
The log resolver and absolute-path failure handling remain assessment and
verification work, qualified by the later code reconciliation in the configuration roadmap. The upstream rename
from `cargo agents` to `symposium` is reflected in current guidance; the retained
configuration design names commands without tying them to either binary.

### Branch ownership change

The assigned branch change removes all 142 tracked `md/` source files, including
user guides, references, and artwork, plus the root Book configuration, renderer
assets, and source Book publishing workflow. Their content remains available
through upstream Git objects and the upstream site. Anchor Book becomes the only
maintained Book here. Source RFDs keep their identities and dispositions upstream.

The two source documents embedded by tests are preserved byte-for-byte as pinned
fixtures. Their include paths, contributor skills, source-reading guidance, and
code/documentation links are updated. The source orphan checker is retired;
Anchor Book's structural check and build replace the source Book CI path.
These branch removals must remain distinct from the upstream adoption patch,
which preserves user documentation and its publishing workflow.

**Validation (2026-11-24):** Linux x86_64, Rust 1.99.1, working tree based on
`10f7d4e46123e3590b56d493de390e14ef01d4e3`. Agent testing was disabled.
The anchor run identifies criteria `e97bf17ab0e3b3e2`, configuration
`83100b730874d29a`, and code `fba37844e5f719af`.

| Check | Result and limitation |
| --- | --- |
| `anchorbook check --config anchorbook.toml`; `mdbook build anchor-book` | Passed structural/v1 and rendering. Rendered local links and fragments resolve. The Mermaid preprocessor reports its existing mdBook 0.5.0/0.5.4 version warning. This establishes no semantic completeness. |
| `cargo fmt --all`; `cargo clippy --all --workspace --locked --offline` | Passed; Clippy reports eight existing SDK macro warnings. |
| `cargo test --all --workspace --locked --no-fail-fast` | Passed, including doctests and documentation-fixture consumers; 29 ignored. No actual agent-execution evidence is claimed. |
| `cargo xtask agent-eval --check-tasks` | Passed both repository tasks after removing the source orphan-check command. |
| `anchorbook verify --config anchorbook.toml --method test` with nextest 0.9.151 | Eight linked tests passed: six criteria satisfied, `startup-relative` and `hooks-continue` unlinked. The directory and run-continuation anchors remain partial. Existing assertion gaps remain in the configuration roadmap. |
| Fixture and guidance checks | Both fixture files equal their exact upstream Git blobs; all three include paths resolve. Both updated skills pass the skill-creator validator. Workflow YAML parses; hosted CI has not run for these uncommitted changes. |

This change does not complete the full port or the repeated-refresh demonstrations.
Historical evidence remains scoped to its original revision and assertions.

## RFD migration plan

The current source navigation contains eight RFDs: five under Accepted, two
under Completed, and one draft. Their listed dispositions match the earlier
`b55d74c9` planning pass, which used RFD overviews, implementation sections, and
an inventory of supporting files. The [expanded coverage map](source-coverage.md) records the authored draft
destinations and their remaining limits. Agent Plugins, evaluation, and the
telemetry contract changed upstream; detailed reconciliation is still partial.
Source navigation and inventories do not establish complete conversion.

The engine direction is now first-class RFD support: an optional Book section,
conditional contract guidance, and typed relationships to design, authority,
anchors, criteria, and work. Preserve each RFD as a coherent proposal while
mapping its effects. The pinned trial engine does not support that section or
relationship model yet; adopt the supported format after the engine implements
and exercises it. Do not add unsupported configuration to this trial.

### Separate the contents of each RFD

| RFD content | Destination |
| --- | --- |
| Intended behavior and architecture | Capability design chapters, with anchors for properties that must hold |
| Required outcomes and constraints | Requirements, where the source establishes a requirement |
| Governing choices, rationale, alternatives, and reconsideration conditions | Decisions citing the RFD's exact revision and section |
| Examples and acceptance cases | Supporting design and verification criteria; review scope before using them as test expectations |
| Implementation steps, deferred work, and unresolved questions | Roadmaps and scoped design questions, preserving dependencies and reasons for deferral |
| Recorded results and implementation claims | Roadmap evidence with original scope and revisions; identify missing evidence instead of inferring it from checkmarks |
| Proposed user documentation | Reconcile with current user/reference pages; keep one maintained user-facing version |
| Discussion and superseded alternatives | Retain in the source RFD as history, linked from resulting records |

An RFD describes a coherent proposed change; design chapters describe the system's
capabilities. One RFD can change several chapters, and one chapter can incorporate
decisions from several RFDs. Map each source claim to its full set of affected
design sections, authority records, anchors, criteria, and roadmap work. An RFD's
conversion is not complete when only its main topic has been covered.

For example, the telemetry RFD reaches configuration consent, package-manager
provenance, predicate evidence, hook observations, and telemetry storage. Those
effects belong in the respective capability designs, with shared governing
decisions recorded once and cited wherever they apply. A property spanning
capabilities has one anchor definition and links from the participating designs.
Coordinated work can use a milestone spanning those capabilities or explicitly
dependent milestones; neither chapters nor roadmaps need a one-to-one RFD mapping.

Preserve upstream acceptance as a source fact; imported Anchor Book records remain draft
until their interpretation is reviewed. Neither an Accepted nor a Completed
heading establishes current verification evidence. Do not invent missing
requirements, alternatives, or acceptance decisions to fill a record.

### Disposition of all eight RFDs

Source names refer to `md/rfds/<name>/` at the target revision, including every
supporting file in that directory. Draft capability destinations are now authored as recorded in
[semantic coverage](source-coverage.md); unresolved proposals remain separate
from the live design. The table below preserves each RFD's conversion obligations.

| RFD / source directory | Listed status | Proposed destination and handling |
| --- | --- | --- |
| Configuration parsing and normalization — `config-normalization` | Completed | Reconcile `D-raw-and-normalized-configuration`; map parser boundaries, validation, and formatting preservation to configuration design and criteria. Preserve the conditional deferral of the TOML editing helper instead of marking it done. |
| Registry-centric plugin distribution — `registry-centric-plugins` | Accepted | Split into plugin identity/model, PM interface and Cargo PM, discovery/consent/sync, and user-managed enablement. Include all five subchapters. Share records with caching and Agent Plugins. Carry remaining ecosystems, version enforcement, custom-predicate dispatch, and other deferred scope into roadmaps. |
| Predicate caching — `predicate-caching` | Accepted | Define validity and invalidation properties, watch inputs, expiry, empty-watch behavior, and version changes. Reconcile PM-derived caching with the registry RFD; preserve explicit deferrals. |
| Agent Plugins interoperability — `agent-plugins` | Accepted | Define package loading, compilation, ownership, installation scope, and agent delivery guarantees. Reconcile both proposed reference/install pages with published references and agent details. Keep linked PRs, observed versions, unsupported cases, and future work distinct from current evidence. |
| MCP meta-server — `mcp-meta-server` | Accepted | Define progressive tool discovery, gated execution, server lifecycle, and freshness; convert implementation steps into proposed milestones. Reconcile planned single-server registration with the existing path that Agent Plugins preserves, keeping their scopes explicit. |
| Telemetry recording — `telemetry-recording` | Accepted | Carry consent, allowed data, identity boundaries, aggregation, storage, and activation into design, authority, and criteria. Include `contract/recorded-data.md` and both reference pages. Preserve seven-step dependencies and the final activation condition; source checklists do not establish production recording. |
| Evaluating agent tasks — `skill-evaluation` | Draft | Adopt the RFD and reference as draft proposal content when engine support is available, without making them agreed goal design; record prospective work and assigned prototypes. On acceptance, reconcile task validity, isolation, grading, and comparison behavior. Check the current design and code before importing progress. |
| RFD Process — `rfd-process` | Completed | Move applicable contribution/review rules into Working on Symposium or retained guidance. Propose the future RFD lifecycle below for maintainer agreement. Process instructions alone do not require product anchors. |

### Conversion order and review

1. **Pilot with configuration normalization.** Reconcile the existing decision,
   add precise source mapping, and account for the deferred editing helper.
   Repeat at the same source revision and confirm that no further edits are needed.
2. **Convert the shared plugin design together.** Take registry distribution,
   predicate caching, and Agent Plugins in that order. Reconcile shared identity,
   gating, scope, and ownership as each is added.
3. **Add MCP and telemetry.** Preserve intended future behavior and dependencies.
   Review overlaps with plugin delivery, PM provenance, predicates, and hooks.
   Keep goal design, current implementation, and evidence separate.
4. **Account for evaluation and process.** Keep evaluation pending acceptance or
   an assigned prototype. Maintainers decide how the RFD process changes at adoption.

For each conversion, expand the map with source sections and full revision,
all affected chapter/record/criterion IDs and roadmap dependencies, retained or deferred content, and
unresolved interpretations. Every governing claim and outstanding task needs a
destination or explicit disposition. Check and render the Book, review source
fidelity and links, and run relevant verification when criteria or test links
change. Preserve earlier evidence; changed criteria require reassessment.
Unresolved governing-source conflicts prevent a full-coverage claim. Coding can
use an agreed, bounded area before the whole port finishes.

### Repeated updates and the final RFD lifecycle

Each refresh compares RFD directories, status in `md/SUMMARY.md`, published
design/reference counterparts, and superseding RFDs with the last reconciled
revision. Added subchapters and changed status matter even when the main RFD is
unchanged. Reconcile shared claims across all affected records and roadmaps;
keep source and migration-review status separate.

During the trial, upstream RFDs keep their existing role and are read through
pinned Git revisions without local copies. At final adoption, the
proposed rule is: RFDs remain first-class proposals in the optional RFD section;
their identities, dispositions, and relationships participate in the Book model.
Accepting one updates
all affected Anchor Book design, authority, and roadmaps in the same reviewed change.
Implementation progress then lives in the roadmap. The accepted RFD retains its
discussion and links to the destination instead of maintaining a second active
implementation plan. Later design changes follow the same path.

Before switching, reconcile active RFDs at the final upstream revision, give
outstanding tasks destinations, and preserve source URLs. Update the RFD
index/template, contributor and agent guidance, RFD-authoring guidance, and
code-review instructions to agree on ownership. Pending drafts retain their
status. This is a proposed maintainer decision; the trial does not replace the
current upstream RFD process. Removing the local source Book does not remove
upstream RFDs or authorize their retirement.

## Milestone 1. Repeated refreshes preserve the design port {#book-migration-1}

**Outcome:** The source map accounts for design and governing material at an exact revision, and repeatable reconciliation preserves Book edits and evidence while exposing changed goals and unresolved conflicts.

**Status:** Proposed

**Identifier:** `book-migration-1`

**Dependencies:** Existing trial Book and pinned engine. Branch source removal, configuration reconciliation, broad semantic design migration, and pre-PR code reconciliation are assigned. Source conflicts require design review before final adoption; production implementation is outside this migration assignment.

**Design basis:** [System Architecture](../design/system.md), [mapped source material](source-coverage.md), and the contract's design and roadmap reconciliation rules.

**Tasks**

- [x] Establish pinned source provenance, semantic reconciliation, and validation practices.
- [x] Identify source provenance and the current target; record the inventory and configuration-reference difference.
- [x] Plan destinations, conversion order, refresh handling, and final ownership for all eight RFDs and supporting material.
- [x] Remove the local source Book and use pinned upstream Git objects for imports, preserving documentation-backed test inputs.
- [x] Reconcile configuration loading, keeping IDs and recording the added criterion and remaining implementation/verification gaps.
- [ ] Perform the configuration-normalization RFD pilot and ordered conversions above, recording source mappings and unresolved interpretations.
- [x] Draft the system architecture and capability chapters with requirements, decisions, correctness anchors, and a source disposition for every design/RFD file.
- [x] Reconcile all 14 design chapters and 65 criteria against code and test boundaries; record four reproduced failures, inspected gaps, and corrected source interpretations in [Code Reconciliation](code-reconciliation.md).
- [ ] Complete the detailed source reconciliations and conflicts explicitly retained in [semantic coverage](source-coverage.md).
- [ ] Assess and link evidence for the new criteria; retain unlinked status until assertion coverage is established.
- [ ] Demonstrate an unchanged repeat and a later update, including conflicting source and Anchor Book edits.

### Completion criteria

#### Traceable coverage {#book-migration-1-coverage}

Every design area and governing source has a reviewed destination or disposition,
an exact reconciled revision, and explicit remaining work. Added, removed, and
renamed material is accounted for. The Book checks and renders, and content review
confirms preservation of intended behavior and source status.
For RFDs, governing claims and outstanding tasks have their full set of affected
destinations or explicit dispositions, including effects across capabilities and
roadmap dependencies. Supporting chapters are covered, and source status remains separate
from migration review and verification evidence.

- **Anchor coverage:** None — migration of project content.
- **Evidence:** Architectural draft and [coverage assessment](source-coverage.md) at the current import revision. Fourteen design chapters, including configuration, now define 24 anchors. [Code reconciliation](code-reconciliation.md) accounts for all 65 criteria and records executed evidence and its limits. Detailed source reconciliation and conflicts remain, so this criterion is not complete.

#### Repeatable reconciliation {#book-migration-1-repeatable}

A completed refresh repeats without edits on identical inputs. A later refresh
accounts for changed source, including changes outside the main design chapter.
Book edits, IDs, test links, and historical evidence survive; conflicting goals
are resolved explicitly and affected evidence and completion claims reassessed.

- **Anchor coverage:** None — authoring workflow acceptance.
- **Evidence:** Pending. Comparing revisions is not a completed semantic refresh.

### Completion record

Pending. Source provenance, the broad architectural draft, and scoped code reconciliation are available. Detailed
source reconciliation, conflict resolution, criterion evidence, and repeated
semantic-refresh demonstrations remain.

## Milestone 2. Maintainers adopt the final design port {#book-migration-2}

**Outcome:** A final refresh is integrated upstream with explicit design ownership, preserved user documentation, and reproducible contributor setup.

**Status:** Proposed

**Identifier:** `book-migration-2`

**Dependencies:** Milestone 1, maintainer review, and the engine adoption work for native checks, current results, and reproducible setup.

**Design basis:** The reviewed [source coverage](source-coverage.md), [code reconciliation](code-reconciliation.md), and maintainer agreement on final ownership.

**Tasks**

- [ ] Reconcile against the final upstream integration base and resolve conflicts affecting adoption.
- [ ] Agree content ownership, preserve existing links, and update both navigation and agent guidance.
- [ ] Agree and apply the final RFD lifecycle, including the template, authoring guidance, and code-review instructions; link accepted RFDs to the maintained Book design and roadmaps.
- [ ] Integrate through the maintainers' workflow; record source and integrated revisions.
- [ ] Reproduce setup, the adopted Book builds, project checks, and scoped verification from a fresh checkout.

### Completion criteria

#### Final ownership and adoption {#book-migration-2-adoption}

The integrated source map accounts for the final documentation revision. Every
design area has an owner, conflicts affecting adoption are resolved, user
documentation remains usable, and duplicate design maintenance ends. A fresh
checkout reproduces the documented development commands; evidence identifies
revisions, tools, outcomes, and limitations.

- **Anchor coverage:** None — project adoption and content ownership.
- **Evidence:** Pending.

### Completion record

Pending. Trial preparation does not establish upstream adoption.

# Semantic Source Coverage

This is supporting research for [Book Migration](book-migration.md), not a
second definition of the system. The design chapters own the resulting goal;
this chapter records provenance, conflicts, and work still needed.

**Source revision:** `3516c051c07838bdde94ea780138a8ac1c3a79a1`.
Every source path below refers to that Git tree.
**Code baseline:** merge `10f7d4e46123e3590b56d493de390e14ef01d4e3`.
The broad migration is an uncommitted draft on this baseline. Upstream acceptance
and completion labels do not accept local records or establish test coverage.
The subsequent [code reconciliation](code-reconciliation.md) covers all 65
criteria, records reproduced failures, and qualifies the implementation questions
below. It does not complete the remaining source-by-source conversion.

## Design sources

The source has 29 design Markdown files. The table maps every file; grouped rows
name their scope. A destination means the stated architectural content was
synthesized, not that every vendor detail or implementation paragraph is now
fully reconciled.

| Source under md/design | Destination and incorporated scope | Remaining reconciliation |
| --- | --- | --- |
| welcome.md; tenets.md; repositories.md | [System Architecture](../design/system.md): purpose, neutrality, ecosystem distribution, safety and ownership; cross-capability requirements | Repository-specific contribution mechanics stay upstream |
| important-flows.md | System, [Activation](../design/activation.md), [Commands](../design/commands.md): shared graph, chains, help/dispatch | Code reconciliation identifies discarded chained versions and differing custom-predicate contexts; fixes and complete assertion coverage remain |
| module-structure.md | System, [Plugin Model](../design/plugin-model.md), [Package Managers](../design/package-managers.md), [Delivery](../design/delivery.md), [Audits](../design/audits.md): component responsibilities and principal trust/failure boundaries | Detailed telemetry implementation, import/try/self-update internals and remaining module paragraphs require line-by-line reconciliation |
| configuration-loading.md | Existing [Configuration Loading](../design/configuration-loading.md), retaining its IDs | Existing roadmap records incomplete assertions and qualifies the relative log-path observation; no CLI relocation defect demonstrated |
| agents.md; agent-details/README.md | [Agent Adapters](../design/agents.md), [MCP](../design/mcp.md): independent capabilities, registration, configuration shapes, ownership | Individual adapter behavior needs primary-source/version confirmation |
| agent-details/antigravity-cli.md; claude-code.md; codex-cli.md; copilot.md; goose.md; kiro.md; opencode.md | Agent chapter and MCP table provide shared destinations | Individual pages' complete wire examples, versions, and source links remain upstream; not yet a full per-page conversion |
| hooks.md; hook-flow.md | [Hooks](../design/hooks.md): candidate priority, payloads, deadlines, process trees, blocking, context, notices | Link assertion-complete tests; preserve actual host-event support limits |
| init-user-flow.md | Agents and Commands: detection versus explicit choices, noninteractive behavior, removals, unknown agents | Full init fixtures need mapping |
| sync-agent-flow.md | Delivery: acquisition, scopes, compiled plugins, ownership, cleanup and lock | Detailed flow-to-code comparison remains |
| state.md | [State and Caching](../design/state-and-caching.md), Delivery and MCP: distinct state lifetimes and ownership ledger | Detection, ledger retry, and trial ownership semantics incorporated; state-format compatibility assessment remains |
| subcommands.md; report-layer.md | Commands: argv/stdio/exit ownership, conflicts, help, typed reports | Script portability and local plugin trial/import guarantees remain work |
| telemetry.md | [Telemetry](../design/telemetry.md) uses the newer recording RFD's closed catalogue | Code reconciliation confirms typed foundations but no runtime Recorder/consent integration; full source conversion and implementation remain |
| agent-eval.md | [Evaluation and Verification](../design/evaluation.md): task validation, trusted grading, sandbox boundaries, outcome evidence | Trial/client/report/expectation details beyond inspected task and grading sections remain |
| running-tests.md; testing-guidelines.md; common-issues.md | Working guidance plus Evaluation's verification boundary | Detailed contributor guidance stays upstream and must be read before coding |
| contributing-tickets.md; governance.md | Working guidance and contribution skills point to pinned source | Organizational guidance stays upstream; no product anchor is invented |

The design source index and key module/flow sections supplied the initial
architectural synthesis. The remaining items above are explicit limits of this
pass, not assertions that their content was unnecessary.

## RFD sources

All 23 RFD Markdown files are accounted for by the eight proposal directories and
four navigation/template files below. Full source links retain each coherent
proposal while its architectural effects span capabilities.

| RFD directory / source disposition | Design destinations and migrated meaning | Remaining work |
| --- | --- | --- |
| [config-normalization](https://github.com/symposium-dev/symposium/blob/3516c051c07838bdde94ea780138a8ac1c3a79a1/md/rfds/config-normalization/README.md), Completed | Configuration and Plugin Model; existing `D-raw-and-normalized-configuration` | Full parser boundary and formatting-preservation assessment; source editing-helper step is explicitly deferred |
| [registry-centric-plugins](https://github.com/symposium-dev/symposium/blob/3516c051c07838bdde94ea780138a8ac1c3a79a1/md/rfds/registry-centric-plugins/README.md), Accepted | Plugin Model, PMs, Activation, Delivery, Commands; all five supporting topics have destinations: cargo-pm, discovery-sync, plugin-model, pm-interface, user-managed-plugins | Resolve contradictory syntax/enablement claims below; finish overview reconciliation; assess version requirements, other ecosystems/registries, custom predicates |
| [predicate-caching](https://github.com/symposium-dev/symposium/blob/3516c051c07838bdde94ea780138a8ac1c3a79a1/md/rfds/predicate-caching/README.md), Accepted | State and Caching; `D-declared-cache-inputs`, `A-cache-declared-validity` | PM-derived/custom predicate cache integration remains distinct work |
| [agent-plugins](https://github.com/symposium-dev/symposium/blob/3516c051c07838bdde94ea780138a8ac1c3a79a1/md/rfds/agent-plugins/README.md), Accepted | Plugin Model, Delivery, Agents, MCP: package units, compilation, native/fallback paths, ownership | Reconcile all install-contract paragraphs and proposed-install/proposed-reference with current references; individual agent/version verification remains |
| [mcp-meta-server](https://github.com/symposium-dev/symposium/blob/3516c051c07838bdde94ea780138a8ac1c3a79a1/md/rfds/mcp-meta-server/README.md), Accepted | Common MCP selection/ownership in MCP; coherent replacement proposal retained below | Registration conflict must be settled before incorporating the replacement as live goal; all five implementation steps lack new evidence here |
| [telemetry-recording](https://github.com/symposium-dev/symposium/blob/3516c051c07838bdde94ea780138a8ac1c3a79a1/md/rfds/telemetry-recording/README.md), Accepted | Telemetry plus PM provenance, activation witnesses, installation attribution, hook observation boundaries; four telemetry anchors | Exact recorded-data field/enum/derivation contract remains pinned source; both reference pages and seven-step implementation evidence need full reconciliation; activation needs disclosure wording and hook-cost evidence |
| [skill-evaluation](https://github.com/symposium-dev/symposium/blob/3516c051c07838bdde94ea780138a8ac1c3a79a1/md/rfds/skill-evaluation/README.md), Draft in navigation | Evaluation reconstructs the current design's task/grading boundary; draft RFD and reference retain proposal identity | Source design calls it approved while navigation lists it Draft. Resolve disposition and fully reconcile trial/client/comparison semantics before claiming adoption |
| [rfd-process](https://github.com/symposium-dev/symposium/blob/3516c051c07838bdde94ea780138a8ac1c3a79a1/md/rfds/rfd-process/README.md), Completed | Working guidance and retained upstream proposal lifecycle | Maintainer adoption and engine-supported RFD integration remain proposed |
| rfds/README.md, accepted.md, completed.md, TEMPLATE/README.md | Source navigation/status/template remain upstream | No executable guarantee arises from a navigation label |

The eight directories contain 19 content files; the four navigation/template
files complete the 23-file inventory.

## Supporting references

Published reference claims govern the interpretation of directory resolution,
audits, plugin syntax, enablement, and delivery where read alongside design.
References remain upstream as user documentation; only their governing meaning
belongs here. The hook event and recorded-data documents retained under
`tests/fixtures/upstream-docs/` are byte-exact test inputs, not a second maintained
design.

The exact telemetry schema, full vendor wire protocols, and full CLI option
reference have not been copied into this Book. Their detailed conversion or
continued external ownership must be resolved before claiming self-contained
full coverage. Artwork, blogs, videos, installation walkthroughs, crate-author
tutorials, and source navigation keep their upstream user-facing ownership.

## Conflicts and consequential gaps

| Topic | Source disagreement or implementation question | Disposition in this draft |
| --- | --- | --- |
| Automatic sync and consent | Discovery RFD has language allowing auto-sync to autoapprove, but its later consent rules and Safety tenet require explicit permission | Common safety guarantee is explicit consent. Automatic acceptance wording is not imported; resolve the contradictory source before final adoption |
| Plugin schema | Registry plugin-model examples use older mcp/installable spellings and a FAQ permits path chains, while its explicit rules and current model use MCP server/installations and package chains | Normalize the conceptual model; retain detailed syntax reconciliation as open work rather than authoring a competing reference |
| User-managed identity | RFD proposes PM-qualified pairs and ambiguity errors; published configuration/routing uses different shorthand and registry precedence | Canonical identity and scope are carried over; final user syntax and collision policy are not selected here |
| PM request policy | Protocol text requires sequential requests but lifecycle text permits multiple in flight; named-code backoff and binary acquisition remain unchecked steps | Keep sequential transport and invocation-bounded failure handling; preserve retries/acquisition as deferred source work |
| Version constraints | RFD load_plugin resolves requested requirements to exact versions; code reconciliation finds chained requirements discarded before PM fetch | Preserve requirement semantics as the goal; record chain-specific regression work rather than making non-enforcement policy |
| Native package containment | Agent Plugins requires package containment; native Symposium sources deliberately allow external paths/symlinks | Keep distinct input-format contracts; audit digest eligibility stays stricter than general loading |
| MCP replacement | Meta-server RFD says one mediated entry and no per-plugin entries; later Agent Plugins/current agent design preserves direct servers and corrects older config paths | Retain current shared design and keep the replacement proposal coherent below, pending scope agreement |
| Agent support | Summary matrices and individual pages differ, including Goose skill surfaces and duplicate loading through Claude's global skill tree; Kiro MCP lacks CLI verification and Windows script/package-cwd handling is limited | Do not claim every adapter supports every route. Per-agent conformance remains unverified |
| Evaluation approval | Current design says approved; source navigation says Draft | No inferred acceptance. Current task/grading design is reconstructed as draft; proposal disposition stays unresolved |
| Telemetry activation | Typed foundations exist, but runtime versioned consent and the Recorder/producer boundary are not integrated; exact disclosure and performance inputs are separate | Preserve activation prerequisites and new unlinked criteria; schema tests do not establish runtime collection |
| Configuration | Startup-relative home must root logs too; the resolver returns a relative path but the binary opens its log before dispatch | Existing configuration roadmap retains focused reproduction and assertion work, without claiming a demonstrated CLI relocation bug |

### MCP meta-server proposal

The accepted-source proposal would expose one stdio Symposium MCP service with
`list_tools` and `execute`. A small capability index directs the agent to
TypeScript declarations generated from eligible servers' JSON Schema. An embedded
QuickJS runtime supplies asynchronous server namespaces, with no ambient
filesystem or network capability, bounded memory, and a default 30-second script
timeout. Tool failures become catchable JavaScript errors.

Backing servers start lazily on declaration lookup or use. Their states are
Cold, Starting, Ready, and Dead; queued calls wait for startup, a later call can
restart a dead server, and session shutdown stops owned servers. The proposal
bridges declared stdio/HTTP/SSE transports. Duplicate namespace names use its
stated first-registration rule with a warning; that rule must be reviewed with
current identity/collision policies.

Its five steps are: single-entry registration, stdio two-tool skeleton, gated
schema discovery, bounded JavaScript execution, then freshness. Freshness is
gated by auto-sync; the source's lockfile-only trigger must be reconciled with
the fuller PM input model. Elicitation and notifications remain future scope.

Registration cannot be switched safely merely by writing a command that does
not exist, despite the source's proposed ordering. Before implementation, settle
the overlap with directly delivered package servers, adopt coherent owning
design/authority, and define executable criteria for sandbox isolation,
applicability, lifecycle/cancellation, schema conversion, and freshness.
This proposal is retained in the assigned migration experiment rather than
silently overriding the newer delivery design.

## Verification disposition

The existing configuration records and test links retain their identities.
Every new anchor in System's capability map and the new agent, MCP, command,
evaluation, and telemetry chapters is draft with executable test criteria.
**No new test association is asserted by this migration.** Existing upstream test
names and passing workspace tests are not evidence that these broader criteria
are covered.

The [code reconciliation](code-reconciliation.md#criterion-assessment) now locates
implementation and test boundaries for every criterion and records known gaps.
Under `book-migration-1`, finish assessing complete assertion coverage,
split independently missing obligations where necessary, then associate only the
covered scope. Required evidence includes real process/sandbox tests, adapter
conformance, concurrency and failure injection, and telemetry negative-data tests.
These production-code and verification changes are deferred: the assignment
migrates design, and source conflicts must be resolved before implementing a new
interpretation. No milestone is completed by this draft or by a structural pass.

## Validation of the initial draft

Validated on 2026-11-24 against the uncommitted baseline named above:

- `anchorbook check --config anchorbook.toml`: structural/v1 passed.
- `mdbook build anchor-book`: passed; 28 generated HTML pages have no broken
  local file or fragment links. The removed updating chapter has no source,
  navigation entry, generated page, or remaining Book reference.
- The preview serves `/design/system.html` with HTTP 200 on port 3000.
- `anchorbook verify --config anchorbook.toml --method test`, nextest 0.9.151:
  eight existing tests passed; 24 anchors comprise one satisfied, two partial,
  and 21 unlinked. Of 65 criteria, six are satisfied and 59 unlinked. The run
  identifies criteria `c3bc10773094e464`, configuration `83100b730874d29a`,
  and code `fba37844e5f719af`.

These results establish structure, rendering/link integrity, and the existing
linked test results, not full semantic conversion or new criterion coverage.
The source conflicts and detailed review limits above remain open. The full
workspace checks recorded in the parent roadmap predate this prose-only design
expansion; no new production behavior is claimed.
The later [code reconciliation evidence](code-reconciliation.md#execution-evidence)
records the fresh workspace suite, negative probes, and checks after its scoped
Book corrections; those results supersede these initial-draft checks for current inputs.

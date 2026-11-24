# Activation and Consent

Activation turns discovered plugins into the capabilities permitted in a particular
workspace and invocation. Discovery answers what is available; it does not grant
permission to execute dependency content.

## Anchors

> **`A-activation-consent`** (draft): **Dependency content cannot obtain its own permission**
> Property: Unconsented dependency plugins remain inactive; explicit disablement overrides every enablement route and Cargo-package revocation overrides every route loading that package, and noninteractive discovery cannot persist consent.
> Authority: `R-explicit-plugin-consent`
> - Criterion `routes-and-overrides` [test]: Exercise registry chains, workspace, use, and auto-enable routes with enabled, pending, and disabled plugins, and revoked Cargo packages on each package-loading route; assert the permitted active identities and zero execution for excluded packages.
> - Criterion `prompt-persistence` [test]: Drive acceptance, explicit rejection, dismissal, and noninteractive sync; assert only the explicit choices alter user policy and that pending dependencies do not execute.

> **`A-activation-shared-graph`** (draft): **All capability consumers share a terminating applicable graph**
> Property: For the same workspace and event context, skills, hooks, MCP, subcommands, and help use the same consented and gated plugin graph; canonical identity deduplication terminates cycles without losing eligible contributions.
> Authority: `R-consistent-capabilities`; `D-shared-plugin-resolution`
> - Criterion `facet-consistency` [test]: Use a fixture plugin with all facets and layered gates; change enablement and each gate and assert corresponding inclusion or exclusion across all five consumers.
> - Criterion `chains-and-context` [test]: Resolve cyclic and diamond chains across distinct manager identities; assert termination, one contribution per canonical identity, and preservation of declaring context without sibling predicate leakage.
> - Criterion `workspace-scope` [test]: Enable a plugin for one absolute workspace root and assert it is absent in another workspace while independent global enablement remains applicable.


## Sources of enablement

Curated registries are configured trust roots. Their plugin definitions may select
packages through chained references. An explicit user selection can enable a
plugin globally or for one resolved workspace. Workspace-owned content has
workspace context. A dependency containing a plugin enters discovery as a
candidate and remains pending until the user's enablement policy covers it.

Disablement overrides explicit use and automatic enablement. A configured Cargo-package
revocation overrides every route loading that package, including chains from
curated registries. It does not revoke the registry or workspace definition
that forms a separate trust root.
Audit approval does not itself grant consent. A registry package with no
applicable dependency reference remains dormant unless an explicit selection
activates it.

A selection denotes canonical package identity, not an accidental display name.
Workspace scope is the absolute resolved root. A removal applies to the selected
scope and does not erase independent disablement or another scope's choice.
Moving a workspace does not automatically transfer its old scoped selection.

## Consent interaction

Manual sync may ask about pending dependency plugins when it has an interactive
terminal. Acceptance persists the selected enablement; an explicit rejection can
persist disablement. Dismissing the prompt or choosing to decide later makes no
durable choice. Hooks do not prompt, and automatic synchronization does not turn
an unanswered question into consent.

A pending-plugin hint tells the agent which packages need a user decision and
points to sync or explicit use. An audit answer, when available, is explanatory.
Hints do not authorize execution. Notice deduplication records a candidate only
when the agent's rendered response actually carries the notice without blocking;
otherwise a later eligible event can present it again.

## Applicable graph

Selection traverses chained references from eligible roots, applying revocation
before executing package-controlled predicates. Each canonical package identity
is visited once, terminating cycles and collapsing diamonds. Provenance records
why a node was reached; each edge retains its declaring predicate context.

Predicates at plugin, group, and capability levels combine with AND. Workspace
and event context are shared by all consumers. A capability is presented only
when its full chain of enablement and gates permits it. Skills, hooks, MCP,
subcommands, and help project this same graph, rather than discovering different
sets independently. A capability that has no corresponding facet contributes
nothing to that particular projection.

[State and Caching](state-and-caching.md) defines when an earlier result remains
usable. [Delivery](delivery.md) distinguishes globally installed content from the
workspace gates applied when executable capabilities are selected.

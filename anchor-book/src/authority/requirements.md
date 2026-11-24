# Requirements

Requirements state required outcomes and constraints, with their source.

## Cross-capability outcomes

Sources are pinned in the [migration source map](../implementation-roadmaps/source-coverage.md). Imported interpretations remain draft.

> **`R-explicit-plugin-consent`** (draft): **Dependency extensions require user permission**
> Statement: Dependency plugins must not run merely because a package was added, discovered, or audited. Disablement overrides enablement; hooks cannot obtain consent through a blocking prompt.
> Source: Safety tenet; discovery and sync design.

> **`R-consistent-capabilities`** (draft): **Interfaces share applicable plugins**
> Statement: Skills, hooks, MCP, subcommands, and help must reflect one workspace-specific plugin selection, preserving canonical identity, scope, and gates.
> Source: Important flows; registry-centric plugin model.

> **`R-package-boundaries`** (draft): **Extension boundaries preserve identity and containment**
> Statement: Ecosystem identities and workspace roots must be validated before activation. Imported Agent Plugins content must remain within its package; audit identity must not omit unsupported or unreadable payload content.
> Source: Agent Plugins install contract; PM interface; audits.

> **`R-preserve-user-artifacts`** (draft): **Synchronization preserves user content**
> Statement: Symposium must mutate only owned artifacts or entries a user command authorizes. Failed replacement and incomplete discovery must not destroy usable installations or user files.
> Source: Unobtrusive tenet; synchronization and agent ownership design.

> **`R-enforce-revocation`** (draft): **Revocation overrides activation**
> Statement: Recognized Cargo-package revocation must block that package before its predicates or capabilities run and remove its owned artifacts despite unrelated incomplete discovery. Registry and workspace definitions are separate trust roots outside package-audit scope.
> Source: Audit reference; module design.

> **`R-fresh-applicability`** (draft): **Caches retain their declared meaning**
> Statement: Predicate and workspace results must be invalidated when their declared inputs, context, or format change; caches cannot supply consent.
> Source: Predicate caching RFD; state design.

> **`R-bounded-hook-execution`** (draft): **Hook work has bounded lifetime**
> Statement: Slow execution, acquisition, and remote managers must not indefinitely hold an agent event. Timed-out work must terminate with its process tree while healthy contributions remain available.
> Source: Hooks; hook flow; PM deadlines.

> **`R-portable-hook-semantics`** (draft): **Agents receive decisions they honor**
> Statement: Matching native hooks receive original agent payloads; portable hooks use canonical format; responses preserve applicable blocking and context semantics.
> Source: Hooks and agent-specific contracts.

> **`R-telemetry-privacy`** (draft): **Telemetry requires consent and excludes content**
> Statement: Recording requires explicit opt-in, stays local by default, excludes forbidden user content, and limits correlation to its declared lifetime.
> Source: Telemetry recording RFD and recorded-data contract.

> **`R-evaluation-integrity`** (draft): **Evaluation preserves trusted trial evidence**
> Statement: Evaluation must preserve authoritative task and grading inputs, isolate trials, and distinguish agent, harness, and grading failures so comparisons are not falsely attributed to a skill.
> Source: Agent evaluation design; testing guidelines; draft evaluation RFD as proposal context.


## Configuration

> **`R-preserve-user-choices`** (draft): **Symposium never replaces configuration the user chose**
> Statement: Symposium must not change the user's configuration except as a command the user ran directs. When it cannot read the user's configuration, nothing it decides from defaults may outlive the run.
> Source: The Unobtrusive tenet ("Symposium should never be a reason to opt out") and the contribution guide's configuration loading chapter: a file Symposium could not read says nothing about what the user chose.

> **`R-hooks-keep-working`** (draft): **Hooks keep working when the configuration is unusable**
> Statement: Hooks must keep running on every agent event when the user configuration cannot be read or parsed, so a configuration problem never disrupts the user's agent.
> Source: The Unobtrusive tenet and the configuration loading chapter: hooks run on every agent event and must keep working.

> **`R-no-fresh-risk`** (draft): **Defaults never enable actions outside Symposium's own files**
> Statement: Symposium must not take actions outside its own files on the basis of defaults it substituted for configuration it could not read.
> Source: The Safety tenet ("Avoid exposing users to fresh risk") and the configuration loading chapter, which forces auto-update off because it is the one default that acts outside Symposium's own files.

> **`R-predictable-directories`** (draft): **User-wide directories follow documented environment settings**
> Statement: Symposium's user-wide configuration, cache, and log directories must follow documented environment variables and defaults. They must be independent of the starting directory except for an explicitly relative SYMPOSIUM_HOME, which is rooted there once; later working-directory changes must not relocate them.
> Source: The "Prefer existing standards over our own" tenet and the [configuration reference's directory resolution rule](https://github.com/symposium-dev/symposium/blob/3516c051c07838bdde94ea780138a8ac1c3a79a1/md/reference/configuration.md#directory-resolution).

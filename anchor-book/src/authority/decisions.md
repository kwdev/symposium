# Decisions

## Shared architecture

> **`D-shared-plugin-resolution`** (draft): **Resolve one graph before projecting capabilities**
> Choice: Use one normalized, consented, revocation-filtered, gated graph for capability consumers. Package managers supply facts; the core owns policy.
> Requirements: `R-consistent-capabilities`
> Rationale: Independent scans can expose capabilities that another consumer rejects. Source: [migration source map](../implementation-roadmaps/source-coverage.md).
> Alternatives:
> - Per-facet scans duplicate trust and gating logic.
> Reconsider when: A capability requires a different activation context.

> **`D-declared-cache-inputs`** (draft): **Cache against explicit watches**
> Choice: Use file, environment, and time watches in a versioned per-workspace cache, invalidating on any change or the earliest deadline.
> Requirements: `R-fresh-applicability`
> Rationale: Declared dependencies make reuse explainable without treating shell commands as pure. Source: [migration source map](../implementation-roadmaps/source-coverage.md).
> Alternatives:
> - Unconditional reuse risks staleness; unconditional recomputation makes every event expensive.
> Reconsider when: Dependencies exceed the watch model.

> **`D-content-audit-identity`** (draft): **Audit complete framed payloads**
> Choice: Hash the bounded, deterministic, complete eligible in-package payload; unsupported external or unreadable content is ineligible.
> Requirements: `R-package-boundaries`; `R-enforce-revocation`
> Rationale: A favorable audit must identify the content actually activated. Source: [migration source map](../implementation-roadmaps/source-coverage.md).
> Alternatives:
> - Hashing only a manifest omits executable content.
> Reconsider when: The payload format or supported sources change.

> **`D-single-hook-intermediary`** (draft): **Keep Symposium as hook intermediary**
> Choice: Register Symposium and dispatch plugin hooks internally. Select matching native candidates, otherwise canonical candidates; never convert one agent's native input into another's.
> Requirements: `R-portable-hook-semantics`; `R-preserve-user-artifacts`
> Rationale: This preserves native capabilities without distributing plugin commands through user settings. Source: [migration source map](../implementation-roadmaps/source-coverage.md).
> Alternatives:
> - Direct registration creates configuration noise; native cross-agent conversion loses meaning.
> Reconsider when: An agent cannot express required behavior through its integration.


Each decision states its own status. These choices govern the system being built;
other parts of the Book must account for them.

## Configuration

> **`D-xdg-directory-resolution`** (draft): **Resolve user directories from SYMPOSIUM_HOME, then XDG, then ~/.symposium**
> Choice: Use SYMPOSIUM_HOME when set, else the matching XDG base directory with symposium appended, else ~/.symposium with cache/ and logs/ beneath it. Treat empty variables as unset and ignore relative XDG values. Resolve a relative SYMPOSIUM_HOME once against the process's starting directory and retain that root for configuration, cache, and logs.
> Requirements: `R-predictable-directories`
> Rationale: One Symposium-specific override serves users who want everything in one place, and XDG variables follow the platform convention the tenets prefer. The XDG Base Directory specification says relative values are invalid and must be ignored. The [upstream reference](https://github.com/symposium-dev/symposium/blob/3516c051c07838bdde94ea780138a8ac1c3a79a1/md/reference/configuration.md#directory-resolution) permits a relative Symposium override; rooting it once preserves its meaning when work moves into another directory.
> Alternatives:
> - Only ~/.symposium, which is simplest but ignores the platform convention.
> - Ignore or reject relative SYMPOSIUM_HOME values, which would reject the override the upstream reference supports.
> - Resolve relative values anew after each directory change, which relocates user data during a run.
> Reconsider when: A supported platform has its own user-directory convention that XDG does not express.

> **`D-run-defaults-on-unreadable-config`** (draft): **An unreadable configuration means defaults for one run, with saving refused**
> Choice: When config.toml exists but cannot be read or parsed, warn, use the defaults with auto-update off for that run, keep the error, and refuse every save and sync while it is set.
> Requirements: `R-preserve-user-choices`; `R-hooks-keep-working`; `R-no-fresh-risk`
> Rationale: Hooks must keep working, so the failure cannot be fatal; saving the defaults would overwrite what the user wrote; and auto-update is the one default that acts outside Symposium's own files.
> Alternatives:
> - Fail every command, which protects the file but stops hooks on every agent event.
> - Use defaults silently and allow saving, which keeps working but can overwrite the user's file with values they never chose.
> Reconsider when: Symposium can repair or partially read an invalid configuration without guessing what the user chose.

> **`D-raw-and-normalized-configuration`** (draft): **Parse configuration into raw structs, then validate into runtime structs**
> Choice: Every parsed TOML file has a raw root struct describing the accepted syntax, derived with Serde and denying unknown fields where the format allows, and an explicit validation step producing the normalized runtime struct the rest of the code uses. Commands that rewrite user-owned TOML preserve formatting through toml_edit.
> Requirements: none
> Rationale: Adapted from the [Configuration parsing and normalization RFD](https://github.com/symposium-dev/symposium/blob/3516c051c07838bdde94ea780138a8ac1c3a79a1/md/rfds/config-normalization/README.md), listed as Completed upstream: a consistent boundary between file syntax and runtime model keeps aliases and migrations at the parsing boundary and lets semantic errors carry context.
> Alternatives:
> - Runtime structs shaped like the TOML, which forces runtime code to know every accepted spelling.
> - Normalization inside custom Deserialize implementations, which hides it inside parsing and makes errors harder to report.
> Reconsider when: A configuration format needs extension fields or a parsing approach that raw structs cannot describe.

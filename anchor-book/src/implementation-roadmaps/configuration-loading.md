# Configuration Loading

**Roadmap identifier:** `configuration-loading`

## Goal

Every criterion of the [configuration loading](../design/configuration-loading.md)
anchors is established by tests in Symposium's suite. The behavior is
implemented; this roadmap closes the gaps between existing tests and the criteria.

## Milestone 1. Tests establish the configuration loading criteria {#configuration-loading-1}

**Outcome:** Each configuration loading criterion has tests whose assertions come from the criterion, covering the cases it names, so a regression in directory resolution or in the protection of an unreadable configuration fails the suite.

**Status:** Proposed

**Identifier:** `configuration-loading-1`

**Dependencies:** Agreement on the configuration loading anchors.

**Design basis:** [Configuration Loading](../design/configuration-loading.md) and the decisions it cites.

**Tasks**

- [x] Map existing tests to each criterion and record their uncovered cases; the configuration trial below links eight tests and leaves hook-continuation evidence unlinked.
- [ ] Add tests for directory precedence, empty variables, and relative XDG values.
- [ ] Add tests that `use`, `telemetry enable`, `telemetry disable`, and `sync` refuse an unparseable configuration and change no file, skill, or hook.
- [ ] Add tests that an empty file loads defaults, that a saved default configuration loads back unchanged, and that the warning names the file.
- [ ] Add a test that a hook event with an unparseable configuration behaves as it does with a missing one.

### Completion criteria

#### Directory tests {#configuration-loading-1-directories}

Tests cover every row of the resolution table, empty variables, and relative XDG values.

- **Anchor coverage:** [A-config-directory-resolution](../design/configuration-loading.md#A-config-directory-resolution) · `precedence`, `empty-and-relative` — Full.
- **Evidence:** Pending.

#### Unreadable file tests {#configuration-loading-1-unreadable-file}

Tests show every saving command and `sync` refusing an unparseable configuration without changing it, and a missing or empty file loading and saving defaults.

- **Anchor coverage:** [A-config-unreadable-file-unchanged](../design/configuration-loading.md#A-config-unreadable-file-unchanged) · `save-refused`, `commands-refuse`, `missing-file-saved` — Full.
- **Evidence:** Pending.

#### Run continues tests {#configuration-loading-1-run-continues}

Tests show the defaults with auto-update off, the warning, and a hook event completing with an unparseable configuration.

- **Anchor coverage:** [A-config-unreadable-run-continues](../design/configuration-loading.md#A-config-unreadable-run-continues) · `auto-update-off`, `hooks-continue` — Full.
- **Evidence:** Pending.

### Evidence {#configuration-loading-1-trial}

Assessed on 2026-11-12 on fork branch `codex/configuration-trial`, based on
`99d12af2`; the existing line-grammar migration is preserved. The installed engine
is `b7bcd33d0035fdc6af9790e0fd8568394772afb9`, with cargo-nextest 0.9.151,
mdBook 0.5.4, and mdbook-mermaid 0.17.1. The structural check and Book build pass.
The engine's rendered acceptance initially rejected the literal `*` in `XDG_*`;
its test helper was corrected, and acceptance against this Book then passed.
The renderer itself was already correct.

`[verification]` scans the workspace's source directories and the root tests,
excluding the evaluation fixtures. All eight links resolve; currently linked
tests belong to the root `symposium` package. Other member crates have no links
in this trial. A whole-Book `anchorbook verify --config anchorbook.toml --method test`
reports seven criteria: six satisfied and one unlinked. These are execution
results, subject to the coverage assessment below.

| Criterion | Linked tests | Assessed coverage and gaps |
| --- | --- | --- |
| `A-config-directory-resolution#precedence` | `config::tests::resolve_logs_dir_uses_xdg_state_home` | Partial: XDG log directory only; configuration/cache paths, the Symposium override, and fallback precedence remain. |
| `A-config-directory-resolution#empty-and-relative` | `empty_env_dirs_are_ignored` | Partial: four Unix CLI cases check empty overrides and relative XDG_CONFIG_HOME without writes to the working directory. Relative cache/state values and the complete resolved-path matrix remain. |
| `A-config-unreadable-file-unchanged#save-refused` | `config::tests::unparseable_config_is_never_saved`, `config::tests::unreadable_config_is_never_saved` | Both refuse saving, identify the file, and preserve its bytes. The trial added the filename assertions. Unreadability is represented by invalid UTF-8; permission-denied I/O is not exercised. |
| `A-config-unreadable-file-unchanged#commands-refuse` | `init_does_not_overwrite_an_unparseable_config` | Partial: in-process init refusal and unchanged configuration bytes. The other four commands, filename diagnostic, and installed skill/hook preservation remain. |
| `A-config-unreadable-file-unchanged#missing-file-saved` | `config::tests::parse_empty_config`, `config::tests::missing_config_is_saved` | Partial: empty text parsing and creating a missing file. An actual empty file and complete save/load equivalence remain. |
| `A-config-unreadable-run-continues#auto-update-off` | `unparseable_config_never_auto_updates` | Partial: the sync process does not execute the mock update for an unparseable configuration. Unreadable-file behavior, complete defaults, and warning contents remain. This replaces the preliminary trial's incorrect association with `auto_update_re_execs_on_sync`. |
| `A-config-unreadable-run-continues#hooks-continue` | None | No test in this trial compares hook output for unparseable and missing configurations. |

**Failure and correction.** With
`anchorbook verify --config anchorbook.toml --anchor A-config-unreadable-file-unchanged --method test`,
the original save guard produces satisfied results. Removing the `config_error`
guard from `Symposium::save_config` makes `save-refused` and `commands-refuse`
failed; restoring it makes both satisfied. Separately replacing its error with
one that omits the filename is caught by the strengthened tests. Every deliberate
change was restored. All runs exit 0 because this Book has no Complete milestone
claiming these criteria. Warm runs took approximately 0.6 seconds, or 7 seconds
when recompilation was needed. Tracked inputs were unchanged by each run.

**No-agent case.** A disposable criterion, specifically about an agent consuming
the tokio-weather skill, was linked to `agent_reads_tokio_skill_after_cargo_add`.
With `SYMPOSIUM_ENABLE_AGENT_TESTING` absent, and separately with it set to `1`
and `test-agents.toml` containing `test-agents = []`, both nextest and cargo test
returned success. The latter printed `agent-only test ran no agent`, yet verify
reported the criterion satisfied in both cases. No agent was started. The two
reports also had identical input identities despite the different execution
settings. The temporary criterion, requirement, link, and agent configuration were
removed after the experiment.

The engine needs a defined producer/runner contract for current execution
evidence and its runtime inputs; ordinary libtest success cannot establish that
an agent ran. Its Verification Evidence milestone 10 records this proposed
correction. Milestone 8 owns required reviews of test sufficiency. Neither is
implemented by this trial, and the configuration anchors' methods and scope are
unchanged. Results here are Linux-only; the Unix-only directory case and the
Windows-ignored auto-update case need separate platform evidence. The engine
currently requests ignored tests too, so the Windows limitation must be resolved
before relying on that link there.

**Validation.** On Linux x86_64 with Rust 1.99.1,
`cargo test --workspace --locked` reported 1,713 passed, no failures, and 15
ignored. Agent testing was disabled; agent-only tests returning `ok` supply no
agent evidence. `cargo clippy --workspace --all-targets --locked` exited 0 with
eight existing SDK macro warnings and two existing type-complexity warnings in
unchanged agent tests. `cargo fmt --all -- --check` passed. No production behavior
was changed, and the user Book remains unchanged.

### Completion record

Pending. The configuration development loop is assessed above; full criterion
coverage and agreement on the anchors remain outstanding.

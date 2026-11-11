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

- [ ] Map existing tests to each criterion: `config.rs` covers saving refused for unparseable and unreadable files and saving a missing file; `tests/init_sync.rs` covers `init` refusing an unparseable file.
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

### Completion record

Pending.

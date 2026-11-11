# Configuration Loading

Adapted from the contribution guide's
[configuration loading](https://github.com/symposium-dev/symposium/blob/main/md/design/configuration-loading.md)
chapter.

Symposium keeps user-wide configuration, cache, and logs outside any project and
loads the user configuration, `config.toml`, once at startup. Hooks run on every
agent event, so loading must not stop Symposium working, and a file Symposium
could not read must not be replaced by values the user never chose.

## Anchors

> **`A-config-directory-resolution`** (draft): **User-wide directories resolve from documented variables, never the current directory**
> Property: Symposium resolves its configuration, cache, and log directories from `SYMPOSIUM_HOME` first, then the matching `XDG_CONFIG_HOME`, `XDG_CACHE_HOME`, or `XDG_STATE_HOME` with `symposium` appended, then the default under `~/.symposium/`, with `cache/` and `logs/` under the configuration directory. An empty variable counts as unset, and a relative `XDG_*` value is ignored, so neither makes a directory depend on the current working directory.
> Authority: `R-predictable-directories`; `D-xdg-directory-resolution`
> - Criterion `precedence` [test]: With each combination of SYMPOSIUM_HOME, the matching XDG variable, and neither set to absolute paths, the configuration, cache, and log directories are the ones the resolution table gives.
> - Criterion `empty-and-relative` [test]: An empty SYMPOSIUM_HOME or XDG variable, and a relative XDG variable, resolve as if unset; no resulting directory depends on the working directory of the process.

> **`A-config-unreadable-file-unchanged`** (draft): **A configuration Symposium cannot read is never overwritten**
> Property: When `config.toml` exists but cannot be read or parsed, no Symposium command changes it. Saving the configuration fails with an error naming the file, so `init`, `use`, `telemetry enable` and `telemetry disable`, and the consent prompt in `sync` fail without writing it, and `sync` stops before changing any installed skill or hook. A missing or empty file is not an error: defaults apply and can be saved.
> Authority: `R-preserve-user-choices`; `D-run-defaults-on-unreadable-config`
> - Criterion `save-refused` [test]: For an unparseable and an unreadable config.toml, saving fails with an error naming the file, and the file's bytes are unchanged.
> - Criterion `commands-refuse` [test]: Run against an unparseable config.toml, each of init, use, telemetry enable, telemetry disable, and sync fails with an error naming the file, and the file and every installed skill and hook are unchanged.
> - Criterion `missing-file-saved` [test]: A missing or empty config.toml loads defaults with no error, and saving it writes a file that loads to the same configuration.

> **`A-config-unreadable-run-continues`** (draft): **An unreadable configuration leaves Symposium working on safe defaults for one run**
> Property: When `config.toml` exists but cannot be read or parsed, Symposium prints a warning naming the file and runs with the default configuration for that run only, with auto-update forced off, since it is the one default that acts outside Symposium's own files. The failure is not fatal: hooks complete as they would with the default configuration.
> Authority: `R-hooks-keep-working`; `R-no-fresh-risk`; `D-run-defaults-on-unreadable-config`
> - Criterion `auto-update-off` [test]: For an unparseable and an unreadable config.toml, the loaded configuration is the default with auto-update off, and the warning names the file and states that the file will not be changed.
> - Criterion `hooks-continue` [test]: A hook event handled with an unparseable config.toml succeeds and produces the same output as with a missing config.toml.

## Directory resolution

User-wide paths are resolved from environment variables in `dirs.rs`
(configuration and cache) and `config.rs` (`resolve_logs_dir`):

| | Configuration | Cache | Logs |
| --- | --- | --- | --- |
| `SYMPOSIUM_HOME` | `$SYMPOSIUM_HOME/` | `$SYMPOSIUM_HOME/cache/` | `$SYMPOSIUM_HOME/logs/` |
| XDG | `$XDG_CONFIG_HOME/symposium/` | `$XDG_CACHE_HOME/symposium/` | `$XDG_STATE_HOME/symposium/logs/` |
| Default | `~/.symposium/` | `~/.symposium/cache/` | `~/.symposium/logs/` |

`dirs::env_dir` treats an empty variable as unset, and `dirs::xdg_dir` ignores a
relative `XDG_*` value, as the XDG Base Directory specification asks.

## Loading the user configuration

The user configuration is loaded once at startup into the `Symposium` struct.
Following the [raw and normalized configuration decision](../authority/decisions.md#D-raw-and-normalized-configuration),
the file is deserialized into `RawConfig`, then validated into the runtime
`Config` used by the rest of the code. If the file is missing or empty, defaults
are used.

If the file exists but cannot be read or parsed, `load_config_from` prints a
warning and returns the defaults with `auto-update` forced off, keeping the error
on `Symposium` (`config_error`). While it is set, `save_config` refuses to write,
and `sync` checks it before changing anything: with the agents unknown, every
installed skill and hook would look as though it belonged to a removed agent.

A file Symposium could not read says nothing about what the user chose, so
nothing decided from the defaults may outlive the run. The other defaults apply
as usual for that run.

## Open questions

1. **Relative `SYMPOSIUM_HOME`.** A relative `SYMPOSIUM_HOME` is used as given,
   so it resolves against the working directory. Whether it should be ignored
   like a relative `XDG_*` value, or rejected, is undecided; the
   [directory anchor](#A-config-directory-resolution) covers only empty values and
   relative XDG values.

# Decisions

Each decision states its own status. These choices govern the system being built;
other parts of the Book must account for them.

## Configuration

> **`D-xdg-directory-resolution`** (draft): **Resolve user directories from SYMPOSIUM_HOME, then XDG, then ~/.symposium**
> Choice: Use SYMPOSIUM_HOME when set, else the matching XDG base directory with symposium appended, else ~/.symposium with cache/ and logs/ beneath it. Treat empty variables as unset and ignore relative XDG values.
> Requirements: `R-predictable-directories`
> Rationale: One Symposium-specific override serves users who want everything in one place, and XDG variables follow the platform convention the tenets prefer. The XDG Base Directory specification says relative values are invalid and must be ignored.
> Alternatives:
> - Only ~/.symposium, which is simplest but ignores the platform convention.
> - Resolve relative values against the working directory, which makes the directories depend on where a command runs.
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
> Rationale: Adapted from the completed RFD Configuration parsing and normalization: a consistent boundary between file syntax and runtime model keeps aliases and migrations at the parsing boundary and lets semantic errors carry context.
> Alternatives:
> - Runtime structs shaped like the TOML, which forces runtime code to know every accepted spelling.
> - Normalization inside custom Deserialize implementations, which hides it inside parsing and makes errors harder to report.
> Reconsider when: A configuration format needs extension fields or a parsing approach that raw structs cannot describe.

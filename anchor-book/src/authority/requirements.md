# Requirements

Requirements state required outcomes and constraints, with their source.

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
> Statement: Symposium's user-wide configuration, cache, and log directories must be determined by documented environment variables and defaults, following established conventions for user directories, and must not change with the directory a command is run from.
> Source: The "Prefer existing standards over our own" tenet and the configuration reference's directory resolution table.

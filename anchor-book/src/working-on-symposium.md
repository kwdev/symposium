# Working on Symposium

This chapter gives the project-specific context for developing Symposium with
this Book. Read it after the AI Working Contract, which `anchorbook contract`
prints; the contract defines the reusable working method, and this chapter
identifies how to apply it here.

## Book sources and authoring references

The Book's sources are under `anchor-book/src/`, with navigation in
`anchor-book/src/SUMMARY.md`; read every chapter it lists from the current
checkout. Generated output goes to `target/anchorbook/`. The user Book in `md/`
and its root `book.toml` are separate and unchanged by work on this Book.

Records are written in the engine's current record form, as described in the
Anchor Book engine's
[Current implementation](https://github.com/anchor-book/anchor-book/blob/2af5c894bc531b01b3450ecff82b4c35da6e8a3b/book/design/anchor-definitions.md#current-implementation):
fenced `anchorbook-anchor`, `anchorbook-requirement`, and `anchorbook-decision`
blocks containing TOML. Follow the existing records in this Book.
Requirement and decision identifiers carry `requirement-` and `decision-`
prefixes; anchor identifiers start with their capability word, such as `config`.
Roadmaps follow the engine's
[roadmap format](https://github.com/anchor-book/anchor-book/blob/2af5c894bc531b01b3450ecff82b4c35da6e8a3b/book/implementation-roadmaps/index.md#defining-the-work).

## Current phase

Read `[project].phase` in the repository-root `anchorbook.toml`. That file is
the single authoritative setting; this chapter does not repeat its value.

## Tools and commands

The Book uses a pinned engine revision and mdBook 0.5.4, the only version that
engine supports. Install them once:

```sh
cargo install --git https://github.com/anchor-book/anchor-book \
  --rev 2af5c894bc531b01b3450ecff82b4c35da6e8a3b --locked anchor-book
cargo install mdbook --version 0.5.4 --locked
cargo install mdbook-mermaid --version 0.17.1 --locked
```

Give `--rev` the full commit hash; Cargo does not resolve a shortened one.
From the repository root:

| Purpose | Command |
| --- | --- |
| Read the working contract | `anchorbook contract` |
| Check the Book's structure | `anchorbook check --config anchorbook.toml` |
| Build the Book | `mdbook build anchor-book` |
| Preview the Book | `mdbook serve anchor-book --hostname 127.0.0.1 --port 3000` |

`mdbook build` runs the structural check in the Anchor Book preprocessor and
renders nothing if it fails. The user Book still builds with `mdbook build` from
the repository root. Symposium's own build and test commands are in
[Running tests](https://github.com/symposium-dev/symposium/blob/main/md/design/running-tests.md).

## Contribution workflow

This Book is a trial on a branch of a fork of Symposium. Whether Symposium adopts
it, and how its maintainers review it, are their decisions.

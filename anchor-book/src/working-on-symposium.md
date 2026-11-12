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

Records are written in the engine's
[record syntax](https://github.com/anchor-book/anchor-book/blob/7a3c1019ed18ac9fa92b99d683c44228ad7b1a6f/book/design/anchor-definitions.md#record-syntax),
with requirements and decisions as its
[Authority Definitions](https://github.com/anchor-book/anchor-book/blob/7a3c1019ed18ac9fa92b99d683c44228ad7b1a6f/book/design/authority-definitions.md)
describe; follow the existing records in this Book. Identifiers carry their kind
code: `A-` for anchors, followed by the capability word, such as
`A-config-directory-resolution`; `R-` for requirements; and `D-` for decisions.
Roadmaps follow the engine's
[roadmap format](https://github.com/anchor-book/anchor-book/blob/7a3c1019ed18ac9fa92b99d683c44228ad7b1a6f/book/implementation-roadmaps/index.md#defining-the-work).

## Current phase

Read `[project].phase` in the repository-root `anchorbook.toml`. That file is
the single authoritative setting; this chapter does not repeat its value.

## Tools and commands

The Book uses a pinned engine revision and mdBook 0.5.4, the only version that
engine supports. Install these versions, repeating the engine install command
whenever its pinned revision changes:

```sh
cargo install --git https://github.com/anchor-book/anchor-book \
  --rev 7a3c1019ed18ac9fa92b99d683c44228ad7b1a6f --locked anchor-book
cargo install mdbook --version 0.5.4 --locked
cargo install mdbook-mermaid --version 0.17.1 --locked
cargo install cargo-nextest --version 0.9.151 --locked
```

Give `--rev` the full commit hash; Cargo does not resolve a shortened one.
From the repository root:

| Purpose | Command |
| --- | --- |
| Read the working contract | `anchorbook contract` |
| Check the Book's structure | `anchorbook check --config anchorbook.toml` |
| Check current test evidence | `anchorbook verify --config anchorbook.toml --method test` |
| Check one configuration anchor | `anchorbook verify --config anchorbook.toml --anchor A-config-unreadable-file-unchanged --method test` |
| Build the Book | `mdbook build anchor-book` |
| Preview the Book | `mdbook serve anchor-book --hostname 127.0.0.1 --port 3000` |

`mdbook build` runs the structural check in the Anchor Book preprocessor and
renders nothing if it fails. The user Book still builds with `mdbook build` from
the repository root. Symposium's own build and test commands are in
[Running tests](https://github.com/symposium-dev/symposium/blob/main/md/design/running-tests.md).

`verify` runs linked tests through nextest. Its `satisfied` state means those
tests passed; the [coverage assessment](implementation-roadmaps/configuration-loading.md#configuration-loading-1-trial)
records what they leave out. The configuration milestone remains open. A failing
linked test still permits exit 0 while no Complete milestone claims its criterion;
read the criterion states as well as the process status.

Symposium owns its tests and the meaning of their outcomes. Anchor Book trusts
the current result reported by nextest. Agent-only tests currently return `ok`
when no agent runs; the engine reflects that passing result. They are not linked
in this Book's configuration trial. Symposium decides whether this behavior needs
changing before using those tests as evidence for agent behavior. No additional
Anchor Book execution-report protocol is required. Ordinary simulation tests
remain usable without enabling agent testing.

## Design areas not yet in this Book

This Book covers the design areas its [Design](design/index.md) section lists.
The others are still described only in the user Book's contribution guide,
`md/design/`. Read the relevant chapter there before changing an area this Book
does not cover; `md/design/module-structure.md` and `md/design/important-flows.md`
are the best overview of the code. Requests for discussion (RFDs) are in
`md/rfds/`; the `authoring-rfds` skill in `.agents/skills/` describes how to write one.

## Symposium's working rules

- **Check common issues first.** Before a coding task, review
  `md/design/common-issues.md` for recurring bug patterns that may apply.
- **Keep the design current.** Update the design alongside the code: this Book's
  chapter for an area it covers, and `md/design/` for the others. An area adapted
  into this Book is also still described in `md/design/`; keep the two consistent
  until the maintainers decide which one is kept.
- **Build and test.** After changes, run `cargo fmt --all`, `cargo clippy --all
  --workspace`, and `cargo test --all --workspace`.
  [Running tests](https://github.com/symposium-dev/symposium/blob/main/md/design/running-tests.md)
  describes agent-mode tests and test filtering.
- **Commits.** Include a `Co-authored-by` trailer with your agent identifier,
  such as `Claude <claude@anthropic.com>`, to indicate AI collaboration.

## Contribution workflow

This Book is a trial on a branch of a fork of Symposium. Whether Symposium adopts
it, and how its maintainers review it, are their decisions.

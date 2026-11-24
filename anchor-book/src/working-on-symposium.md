# Working on Symposium

This chapter gives the project-specific context for developing Symposium with
this Book. Read it after the AI Working Contract, which
`anchorbook contract --config anchorbook.toml` prints; the contract defines the
reusable working method, and this chapter identifies how to apply it here.

## Book sources and authoring references

The Book's sources are under `anchor-book/src/`, with navigation in
`anchor-book/src/SUMMARY.md`; read every chapter it lists from the current
checkout. Generated output goes to `target/anchorbook/`. This branch maintains
only this Book. User guides, references, and the source contribution guide remain
[upstream](https://symposium-dev.github.io/symposium/); there is no local `md/`
tree or root `book.toml`.

Records are written in the engine's
[record syntax](https://github.com/anchor-book/anchor-book/blob/7966c9fddb3e9b9a710444c365cd698550de9b5f/book/design/anchor-definitions.md#record-syntax),
with requirements and decisions as its
[Authority Definitions](https://github.com/anchor-book/anchor-book/blob/7966c9fddb3e9b9a710444c365cd698550de9b5f/book/design/authority-definitions.md)
describe; follow the existing records in this Book. Identifiers carry their kind
code: `A-` for anchors, followed by the capability word, such as
`A-config-directory-resolution`; `R-` for requirements; and `D-` for decisions.
Roadmaps follow the engine's
[roadmap format](https://github.com/anchor-book/anchor-book/blob/7966c9fddb3e9b9a710444c365cd698550de9b5f/book/implementation-roadmaps/index.md#defining-the-work).

## Current phase

Read `[project].phase` in the repository-root `anchorbook.toml`. That file is
the single authoritative setting; this chapter does not repeat its value.

## Tools and commands

The Book uses a pinned engine revision and mdBook 0.5.4, the only version that
engine supports. Install these versions, repeating the engine install command
whenever its pinned revision changes:

```sh
cargo install --git https://github.com/anchor-book/anchor-book \
  --rev 7966c9fddb3e9b9a710444c365cd698550de9b5f --locked anchor-book
cargo install mdbook --version 0.5.4 --locked
cargo install mdbook-mermaid --version 0.17.1 --locked
cargo install cargo-nextest --version 0.9.151 --locked
```

Give `--rev` the full commit hash; Cargo does not resolve a shortened one.
From the repository root:

| Purpose | Command |
| --- | --- |
| Read the working contract | `anchorbook contract --config anchorbook.toml` |
| Check the Book's structure | `anchorbook check --config anchorbook.toml` |
| Check current test evidence | `anchorbook verify --config anchorbook.toml --method test` |
| Check one configuration anchor | `anchorbook verify --config anchorbook.toml --anchor A-config-unreadable-file-unchanged --method test` |
| Build the Book | `mdbook build anchor-book` |
| Preview the Book | `mdbook serve anchor-book --hostname 127.0.0.1 --port 3000` |

`mdbook build` runs the structural check in the Anchor Book preprocessor and
renders nothing if it fails. Run it with `anchor-book` from the repository root.
The Book workflow checks and builds this Book without publishing a site.

For Rust changes, run `cargo fmt --all`, `cargo clippy --all --workspace`, and
`cargo test --all --workspace`. Upstream CI runs tests in separate processes with
`cargo nextest run --workspace --no-fail-fast` and runs doctests with
`cargo test --workspace --doc`. Agent testing is opt-in through
`SYMPOSIUM_ENABLE_AGENT_TESTING`; leave it unset for ordinary simulation tests.
Read upstream `md/design/running-tests.md` for agent setup and platform limits.

`verify` runs linked tests through nextest. A criterion's `satisfied` state
reflects its linked checks; an anchor is satisfied only when every criterion is
satisfied. Passing results do not establish assertion coverage; the
[coverage assessment](implementation-roadmaps/configuration-loading.md#configuration-loading-1-trial)
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

## Upstream source material

The [source map](implementation-roadmaps/book-migration.md#source-map) records the
full upstream revision used for the current import and each area's last semantic
reconciliation. Use that pinned revision, not a moving `main` URL, for source
review. Source paths such as `md/design/` and `md/rfds/` refer to Git objects in
that upstream revision, not files in this checkout. For example, the initial
branch import can be inspected with:

```sh
source_revision=3516c051c07838bdde94ea780138a8ac1c3a79a1
git show "${source_revision}:md/SUMMARY.md"
git show "${source_revision}:md/design/common-issues.md"
git show "${source_revision}:md/design/module-structure.md"
```

Fetch a recorded revision if its objects are unavailable. Do not substitute the
trial branch's deleted paths or silently advance the import revision.

This Book covers the areas its [Design](design/index.md) section lists. Before
changing an unconverted area, read its upstream design, relevant references and
RFDs, then establish its owning design here. `md/design/module-structure.md` and
`md/design/important-flows.md` are the source overviews. The [semantic coverage record](implementation-roadmaps/source-coverage.md) names
remaining source details and conflicts. A chapter destination does not establish
complete conversion or verification. Supporting migration research lives there;
the design chapters own the resulting system definition.

User documentation stays upstream. Link to it instead of keeping a parallel
copy here. Two exact source documents remain as
test fixtures in `tests/fixtures/upstream-docs/` for existing hook-event and
telemetry checks; refresh their revisions and consumers together.
These snapshots are not governing design or evidence of RFD completion.

The pinned engine does not support the optional RFD section. Preserve source
RFDs through exact upstream links and the migration map. For a new branch
proposal, use a scoped roadmap experiment or discussion outside the Book until
that support is adopted; do not recreate `md/rfds/`. The `authoring-rfds` skill
also explains how to prepare an explicitly assigned upstream RFD.

## Symposium's working rules

The [migration roadmap](implementation-roadmaps/book-migration.md) records source
revisions, mappings, unresolved differences, and the final switch in ownership.

- **Check common issues first.** Before a coding task, read
  `md/design/common-issues.md` from the pinned upstream revision.
- **Keep the design current.** Maintain governing design in this Book, including
  newly assigned areas. Reconcile upstream claims semantically while preserving
  deliberate local choices and recording conflicts. Do not maintain duplicate
  source design in this branch.
- **Build and test.** Use the commands above. Book changes require the structural
  check and `mdbook build anchor-book`; code changes require relevant Rust checks.
- **Commits.** Include a `Co-authored-by` trailer with your agent identifier,
  such as `Claude <claude@anthropic.com>`, to indicate AI collaboration.

## Contribution workflow

This Book is a trial on a branch of a fork of Symposium. Whether Symposium adopts
it, and how its maintainers review it, are their decisions. Removing the source
Book here is a branch ownership choice; an upstream adoption change must preserve
upstream user documentation and its publishing setup. Read upstream
`md/design/contributing-tickets.md` and `md/design/governance.md` for ticket and
review rules, using the pinned-source procedure above.

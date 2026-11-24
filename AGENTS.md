# Start here

This branch develops Symposium using the [Anchor Book](anchor-book/src/SUMMARY.md)
in `anchor-book/`. It defines the goal system through design, requirements,
decisions, and anchors. Its roadmaps record planned work, progress, and
verification evidence. Read record and milestone statuses to distinguish
proposals from agreed work.

The user and contributor Book remains upstream. This branch does not keep its
`md/` tree or build a second Book. Read source material from the pinned upstream
revision using Git, as [Working on Symposium](anchor-book/src/working-on-symposium.md#upstream-source-material)
describes. Before changing an area outside the [Design index](anchor-book/src/design/index.md),
read its upstream design and RFD chapters and establish its Anchor Book design.
Report source conflicts; do not recreate or maintain a local source Book.

Source provenance and remaining design reconciliation are recorded in the
[semantic coverage](anchor-book/src/implementation-roadmaps/source-coverage.md).

Before project work, run this from the repository root and read its output in full:

```sh
anchorbook contract --config anchorbook.toml
```

It prints the AI Working Contract for the pinned engine and configured project
phase. If `anchorbook` is not installed, install the revision named in
[Working on Symposium](anchor-book/src/working-on-symposium.md#tools-and-commands)
first. Then read that chapter for project guidance. The Book index is
[anchor-book/src/SUMMARY.md](anchor-book/src/SUMMARY.md); read every chapter it
lists before taking up the engineer's task. Paths here are relative to this
repository root, regardless of your current working directory.

If the contract cannot be retrieved, report the problem before proceeding with
work that depends on it. Retrieve it again in a new session, after losing its
context, or when it changes.

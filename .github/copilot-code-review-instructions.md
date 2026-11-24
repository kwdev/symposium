# Code review instructions

## Rust coding practices

Watch for these patterns:

- **Document the destination, not the journey**: Comments and documentation should describe what the code does now, not what it used to do or why it changed. Avoid references to past behavior, removed code, or migration history.
- **Exhaustive is better**: Prefer exhaustive matches over wildcard (`_`) arms — when new variants are added, the compiler should force a decision. Similarly, prefer destructuring structs (`let Foo { a, b, .. } = x`) over field access (`x.a`, `x.b`) when the code is likely to need updating as fields are added.
- **Private is better**: Flag items that are more public than necessary. Default to private; use `pub(crate)` or `pub(super)` before `pub`. The library surface of symposium is mostly internal — `symposium-sdk` is the exception.
- **Focus on the now**: Flag backwards-compatibility shims, re-exports of removed items, `#[deprecated]` stubs, or dead code left "just in case." Symposium is primarily an application; unused abstractions are waste, not investment.

## Design and source compliance

This branch maintains the Anchor Book in `anchor-book/`. Review affected design,
authority, anchors, and roadmap evidence together. The source Book remains
upstream; it is not a local `md/` tree. Use the pinned source revision and
per-area reconciliation recorded in
`anchor-book/src/implementation-roadmaps/book-migration.md` to read relevant
upstream design and RFDs through Git.

Check scope against the assigned work. Preserve deliberate Anchor Book choices
and flag conflicts with upstream claims. Source RFD acceptance or completion is
not local design acceptance, implementation completion, or verification evidence.
Keep progress in the Anchor Book roadmaps and preserve upstream proposal links.
Unconverted areas remain explicitly pending; removing source files is not a
semantic conversion. Check that source-dependent test fixtures are refreshed with
their consumers and provenance when their upstream inputs change.

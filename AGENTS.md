# Start here

This repository develops Symposium. Its design, governing records, and agreed
work are in its Anchor Book in `anchor-book/`; the user documentation is a
separate Book in `md/`.

Before project work, run this from the repository root and read its output in full:

```sh
anchorbook contract
```

It prints the AI Working Contract for the engine revision this project pins. If
`anchorbook` is not installed, install the revision named in
[Working on Symposium](anchor-book/src/working-on-symposium.md#tools-and-commands)
first. Then read that chapter for project guidance. The Book index is
[anchor-book/src/SUMMARY.md](anchor-book/src/SUMMARY.md); read every chapter it
lists before taking up the engineer's task. Paths here are relative to this
repository root, regardless of your current working directory.

If the contract cannot be retrieved, report the problem before proceeding with
work that depends on it. Retrieve it again in a new session, after losing its
context, or when it changes.

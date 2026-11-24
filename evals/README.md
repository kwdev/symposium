# Agent evaluation tasks

Data for `cargo xtask agent-eval`. Nothing here is Rust workspace code: the root `Cargo.toml` excludes this directory, because starters and fixture crates are copied into trials and built there.

```text
evals/
  plugins/<name>/        # a Symposium plugin, offered through the trial's registry
  fixtures/<name>/       # a crate a task depends on, copied in read-only
  tasks/<name>/
    task.toml
    starter/             # project copied into each trial
    checks/              # hidden tests, one file per test
    solution/            # optional; files copied over the starter
```

Adding an evaluation means adding a directory here. The format and its rules are in the [upstream RFD reference](https://github.com/symposium-dev/symposium/blob/3516c051c07838bdde94ea780138a8ac1c3a79a1/md/rfds/skill-evaluation/reference.md#task-format). This branch reads source design from pinned Git revisions; see [Working on Symposium](../anchor-book/src/working-on-symposium.md#upstream-source-material).
Validate every task with `cargo xtask agent-eval --check-tasks`. When a task has a `solution/`, it is graded too.

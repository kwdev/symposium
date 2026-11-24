#!/usr/bin/env python3
"""Run the recorded Book reconciliation probes in an otherwise idle checkout.

The probes assert intended behavior and fail on the reviewed baseline. This is
an opt-in diagnostic, outside the ordinary test targets; it does not waive or
replace the project's tests. No agent or model is called.
"""

from pathlib import Path
import os
import subprocess
import sys


def main():
    repo = Path(__file__).resolve().parents[2]
    library = repo / "src/lib.rs"
    target = repo / "tests/book_reconciliation_probe.rs"
    original = library.read_bytes()
    private = b"pub(crate) mod predicate;"
    if target.exists() or original.count(private) != 1:
        raise SystemExit("Unexpected probe target or module declaration; no files changed.")
    exposed = original.replace(private, b"pub mod predicate;")
    probe = Path(__file__).with_name("probes.rs").read_bytes()
    try:
        target.write_bytes(probe)
        library.write_bytes(exposed)
        result = subprocess.run(
            ["cargo", "test", "--locked", "--offline", "--test",
             "book_reconciliation_probe", "--", "--nocapture"], cwd=repo,
            env={**os.environ, "CARGO_NET_OFFLINE": "true"},
        )
        return result.returncode
    finally:
        # Avoid overwriting a concurrent edit. Use an idle checkout for this run.
        if library.read_bytes() == exposed:
            library.write_bytes(original)
        elif library.read_bytes() != original:
            raise RuntimeError("Concurrent src/lib.rs edit; restore its predicate visibility manually.")
        if target.exists() and target.read_bytes() == probe:
            target.unlink()


if __name__ == "__main__":
    sys.exit(main())

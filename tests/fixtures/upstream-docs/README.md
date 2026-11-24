# Upstream documentation test inputs

These two files are exact snapshots from Symposium revision
`3516c051c07838bdde94ea780138a8ac1c3a79a1`. They preserve the examples and
contract assertions exercised by existing tests after the source Book is removed
from this branch. They are test inputs, not a maintained copy of the Book.

| Fixture | Upstream source | Consumers |
| --- | --- | --- |
| `hook-events.md` | [Hook events](https://github.com/symposium-dev/symposium/blob/3516c051c07838bdde94ea780138a8ac1c3a79a1/md/reference/hook-events.md) | `tests/hook_events_doc.rs` |
| `recorded-data.md` | [Recorded data contract](https://github.com/symposium-dev/symposium/blob/3516c051c07838bdde94ea780138a8ac1c3a79a1/md/rfds/telemetry-recording/contract/recorded-data.md) | Telemetry identity and schema tests |

On a source refresh, review changes to these paths, update the snapshots and
their revision together, and run their consumers. Preserve the full source text:
deleting examples to make a test pass would discard verification obligations.
Importing these fixtures establishes no design acceptance or RFD implementation
status. The [migration procedure](../../../anchor-book/src/updating-from-symposium.md)
governs semantic conversion separately.

# Hooks

Symposium is the registered intermediary between an agent event and plugin hooks.
It preserves native capabilities while providing a canonical portable format.

## Anchors

> **`A-hook-format-selection`** (draft): **Each plugin receives exactly its selected format**
> Property: For each plugin and event, dispatch runs all matching candidates of the host's native format in manifest order, otherwise all matching canonical candidates; foreign native formats never run.
> Authority: `R-portable-hook-semantics`; `D-single-hook-intermediary`
> - Criterion `candidate-priority` [test]: Combine event, matcher, agent, and predicate filters with multiple native and canonical handlers; assert the exact selected handlers, order, and payload values.
> - Criterion `canonical-boundary` [test]: Run canonical and foreign-native fixtures on each shell-hook adapter; assert canonical translation and no foreign-native dispatch, including an ignored non-occurrence payload.

> **`A-hook-cancellation`** (draft): **Expired work cannot outlive hook cancellation**
> Property: Plugin execution and acquisition obey their invocation budgets; expired hooks and acquisition stop their process trees, remote-manager timeouts preserve local dispatch, and remaining handlers are skipped after budget exhaustion.
> Authority: `R-bounded-hook-execution`
> - Criterion `execution-budget` [test]: Run hanging and non-reading handlers with descendants on Unix and Windows; assert the per-hook and total deadlines terminate the timed-out trees without blocking output collection.
> - Criterion `acquisition-budget` [test]: Expire package acquisition and install commands, including git probes and child installers; assert termination and no hook execution after the deadline.
> - Criterion `remote-deadline` [test]: Use several slow remote managers plus a healthy local plugin; assert one shared two-second remote budget and delivery of the local response.

> **`A-hook-agent-response`** (draft): **Translated decisions and context reach the host agent**
> Property: Symposium returns the selected hooks' valid contributions in the host's actionable format. Exit 2 blocks where the event permits it; malformed portable output cannot erase other contributions.
> Authority: `R-portable-hook-semantics`
> - Criterion `blocking-wire` [test]: Exercise exit 2 and native decision objects across registered agent/event pairs; assert host-actionable denial or continuation, including Antigravity's stdout-only decisions and Kiro's exit-code denial.
> - Criterion `context-merge` [test]: Combine built-in and multiple plugin contexts, malformed canonical outputs, native plain-text output, and Antigravity injected steps; assert preserved applicable contributions and protocol-clean stdout.
> - Criterion `notice-delivery` [test]: Block an event or use a host response without context support; assert a pending consent notice is not marked delivered and remains eligible for a later event.


## Event pipeline

Parse the payload before doing work. An adapter can identify a native payload as
not an occurrence of the requested Symposium event; return the host's neutral
response immediately. Antigravity's later `PreInvocation` events in a turn are
one such case.

Use the valid event directory for predicates and hook processes. Auto-sync is
quiet and nonfatal. Session start refreshes sources; other events use freshness
inputs and cached acquisition. Built-in discovery, consent, and update hints
are independent contributions, so throttling an update check does not suppress
the command-discovery hint.

Candidate selection applies the event, matcher, optional agent restriction,
and predicates before format preference. Run every candidate of the chosen
format in manifest order. Matching native input is passed through; canonical
input is translated by the adapter. Never convert a foreign agent's native hook
into another native format.

Resolve shared installations and requirements, acquire permitted sources, run
install commands, and launch the hook. The payload is written independently of
waiting so a process that never reads stdin cannot hold dispatch. Temporary
output files avoid waiting for EOF from background descendants. A hook that exits
normally is done; ordinary background jobs it deliberately leaves are not killed
merely because its parent exited.

## Deadlines and failures

Each hook receives at most five seconds; plugin hooks share eight seconds counted
from the first handler, including command acquisition. A timeout contributes no
block or output, and the next handler can run while budget remains. Exhausting
the total skips the remaining handlers.

Unix process groups and Windows process-tree termination stop timed-out work.
Foreground commands outside hook dispatch retain terminal cancellation and prompt
behavior. The separate remote-manager budget is owned by
[Package Managers](package-managers.md); it is not another eight-second allowance.

## Responses

Portable output must be canonical tagged JSON. Invalid JSON, `null`, and objects
without the canonical event tag are ignored with warnings. Matching native
Claude/Codex session or prompt hooks may return plain context text.

An exit-2 handler ends dispatch and turns stderr into the host's blocking reason.
Antigravity ignores process exit codes, so pre-tool denial and stop continuation
must be encoded in stdout. Its pre-tool object without a valid decision is itself
a denial. Kiro receives context on stdout and tool denial through exit 2.

Context-bearing events join built-in context before plugin contexts; one plugin
cannot clear earlier context by returning malformed portable output.
Antigravity's non-context injected steps accumulate through its adapter.
Pre-tool and stop merging respect fields that also carry decisions rather than
blindly concatenating them. Claude session start requests a skill rescan so skills
installed during the hook can become visible.

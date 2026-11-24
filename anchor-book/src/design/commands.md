# Commands and Acquisition

The CLI exposes setup and maintenance to users and applicable plugin tools to
agents. Help and execution share the active graph; plugins own their command's
argument grammar.

## Anchors

> **`A-command-transparent-dispatch`** (draft): **Plugin command dispatch preserves arguments and ownership**
> Property: A selected plugin command receives its configured arguments followed by the user's unchanged argument vector, inherits stdio, and supplies the exit result. Built-ins cannot be shadowed, and ambiguous plugin names fail before execution.
> Authority: `R-consistent-capabilities`; `R-package-boundaries`
> - Criterion `argv-and-exit` [test]: Dispatch executable and supported script fixtures with spaces, quotes, metacharacters, empty arguments, and --help; assert exact argv, stdio, and exit-code propagation without shell re-tokenization.
> - Criterion `selection-and-collision` [test]: Exercise inactive gates, reserved names, duplicate active commands, and missing installations; assert matching help/dispatch eligibility and no execution for rejected selection.


## Command responsibilities

| Surface | Responsibility |
| --- | --- |
| init | Record agent choices, register integrations, remove owned entries for removed agents |
| sync | Resolve, optionally request consent, acquire, deliver, and clean up owned content |
| search / use / status | Discover candidates, record explicit scoped selections, explain active state |
| plugin | Authoring, importing, and local trial workflows |
| self-update | Explicit binary update or configured update policy |
| telemetry | Consent, inspectable local data, and recording controls |
| plugin subcommand | Run an applicable plugin-owned tool through shared acquisition |
| hook | Internal agent protocol entry point |

Initialization with flags applies explicit additions/removals. Without a terminal,
a first run can select detected agents but errors if none are available; later
runs retain existing choices. An unreadable config is not an empty agent list.
Removing an agent cleans known user integrations and current workspace artifacts;
other workspace copies are cleaned when those workspaces next synchronize.

## Subcommand dispatch

A manifest supplies a name, description, audience, command installation, and
optional gates. Built-in names and `help` are reserved. Two active plugins claiming
the same command produce an error identifying both rather than choosing silently.
Audience groups help for humans or agents; it is not an authorization rule.

Resolve the command through the same installation framework hooks use.
Append trailing user arguments as structured argv after configured arguments.
Executables launch directly; script mode invokes the platform's supported shell
with a script path. The child inherits stdio and its exit code is propagated;
signal termination becomes failure.

Top-level help, `-h`, `--help`, bare `help`, and an empty invocation use the
workspace-aware renderer. A built-in's help stays with that command; a plugin's
`--help` reaches its binary. Outside a workspace only globally applicable
plugin commands appear.

## Acquisition

Named and inline installations describe executable/script paths, requirements,
sources, and post-install commands. Acquisition owns cache identity, idempotency,
and refresh, keeping these mechanics out of subcommand dispatch.

Cargo acquisition may try a prebuilt binary before building; git content tracks
its resolved commit. Successful installation updates the current pointer only
after the requested artifact is ready. Relative paths resolve from normalized
plugin/source context. Hook acquisition obeys the hook deadline; foreground
commands retain interactive terminal and cancellation behavior.

## Local plugin trials

Trying a dormant local plugin can create global enablement. Record whether the
trial created that choice; removal must preserve a use entry that predated the
trial. Explicit use removal clears trial ownership too, so a later user re-addition
is not treated as trial state.

Record trial MCP server names as well as reading the current manifest. A deleted
or invalid source must not strand registrations. Removal still goes through the
machine's installation ledger and retains names another active plugin requires.
These ownership guarantees belong to [Delivery](delivery.md).

## Reports

Commands emit typed report events. Normal output presents actions, verbose
output adds decisions on stderr, and JSON mode buffers structured events for
stdout. Repeated warnings within one command are deduplicated. Protocol entry
points keep report chatter out of agent stdout. Report events describe operational
state; they are not the privacy-filtered telemetry catalogue.

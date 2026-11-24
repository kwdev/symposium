# Evaluation and Verification

Controlled evaluations ask whether an agent can complete a task with particular
extensions. They are separate from production telemetry, which observes
resolution and activation but cannot establish task improvement.

## Anchors

> **`A-evaluation-trusted-grading`** (draft): **Grades use trusted task policy and isolated submitted edits**
> Property: Grading reconstructs a trusted starter and imports only permitted submission edits, retaining protected build inputs and hidden checks; trial code cannot modify authoritative evidence or grading policy.
> Authority: `R-evaluation-integrity`
> - Criterion `editable-import` [test]: Submit additions, deletions, type changes, protected files, case aliases, symlinks, and special files; assert only permitted real content enters grading and outside edits are reported.
> - Criterion `grading-isolation` [test]: Run hostile submissions under the real sandbox attempting to read hidden trial inputs, alter grading sources/logs, contact a host listener, and persist changes between steps; assert denied access and fresh writable state per step.
> - Criterion `hidden-check-execution` [test]: Exercise ignored, undiscovered, duplicate, redirected, noncompiling, and successful hidden checks; require validated test discovery, exit result, and the expected one-test summary before reporting a pass.

> **`A-evaluation-evidence-integrity`** (draft): **Failures and isolation remain visible in evaluation results**
> Property: Each trial retains its condition and observed results without confusing infrastructure failure, timeout, missing evidence, or a grading failure with a successful agent outcome. Cleanup establishes containment before another step starts.
> Authority: `R-evaluation-integrity`
> - Criterion `failure-classification` [test]: Inject spawn, timeout, cleanup, grading, and collection failures; assert distinct results and preservation of prior completed evidence.
> - Criterion `process-containment` [test]: Have trial and grading commands spawn descendants; assert stop and reap on cancellation/exit, and no subsequent cleanup or grading command when containment fails.
> - Criterion `trial-separation` [test]: Run baseline and extension conditions with isolated homes, workspaces, and captured inputs; assert no cross-trial state or access to authoritative checkout inputs.


## Task model

Task data, starter code, fixtures, plugins, and hidden checks are repository-owned
inputs. Validate before running an agent. Names must be portable path components,
editable patterns must have a literal root, unknown fields are errors, and a
missing task set cannot pass as zero tasks checked.

Every hidden check contains exactly one discoverable top-level synchronous test.
Reject declarations that can change whether that test exists, including ignored
tests, conditional item discovery, duplicate test attributes, and unsupported
module/macro forms. A starter carries a lockfile and cannot shadow a hidden test
target.

Protected inputs include Cargo manifests and locks, Cargo configuration,
toolchain files, build scripts, and formatter configuration. They determine how
a submission builds and is judged; an editable glob cannot delegate them to the
agent.

## Trial and grading boundaries

Trials run outside the checkout in isolated directories under `srt`. The agent
cannot read the authoritative checkout, hidden checks, or other trials.
Retained results are copied back only after the run.

Grade a reconstructed copy, not the agent's directory. Copy the trusted starter
and fixtures, then import only permitted real files/directories from the
submission. Preserve allowed deletions and report edits outside scope. Treat
symlinks and special files at or below editable roots as invalid input.

Grading uses a constructed toolchain environment, locked offline Cargo,
private targets and Cargo home, and no network. Validate trusted metadata before
import; detect hidden target redirection and ambient ancestor configuration.
Keep trusted sources read-only, logs outside submission access, and writable
work separate. Stop and reap each process tree before resetting work for the next
step. Failure to establish containment stops grading.

## Outcomes and limits

Build, library tests, hidden checks, and optional formatting have separate
results. A failed build skips dependent checks; a contained timeout can leave
later checks runnable. Infrastructure failures are not code failures.
Hidden checks require matching listing, successful execution, and a one-test
summary. These are defensive checks, not authentication of stdout: code running
inside a test can forge output.

Installed, invoked, and effective are different claims. Skill and hook
expectations require their own evidence; a task pass alone does not show a skill
was used. Comparison reports retain the exact inputs and conditions and expose
missing observations. Draft evaluation extensions and source-status conflicts
remain in migration work.

## Verification methods

Executable criteria are the minimum evidence for the anchors. Use interface
fixtures and actual CLI paths for deterministic semantics; use real sandbox and
process tests for containment; use actual agent inspection where adapter behavior
cannot be established by serialized fixtures alone. No formal proof obligation
is declared in this draft: the principal boundaries involve external processes,
filesystems, and vendor interfaces that require executable integration evidence.

Model-free task validation and crate tests belong in ordinary CI. Agent runs
require explicit execution because they call models. Test doubles do not establish
vendor conformance, ignored tests do not pass, and a disabled agent test does not
supply real-agent evidence. [Working on Symposium](../working-on-symposium.md)
owns commands and environment setup.

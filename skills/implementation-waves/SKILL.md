---
name: implementation-waves
description: Implement work spanning multiple behavioral areas as small verified waves. Use for coordinated UI, API, data, or multi-function page work; use direct implementation for a small local input, list, prop, or API-field change.
license: MIT
metadata:
  author: Alex Radulescu
  version: "1.0.0"
  tags: "incremental-development, walking-skeleton, elephant-carpaccio, tracer-bullets, small-batches"
---

# Implementation Waves

Work like a pair: map the direction, implement one observable increment, verify and refine it, checkpoint it, then reconsider what remains.

## Activation and modes

Explicit invocation always activates this workflow. Accept `/implementation-waves auto`, `$implementation-waves auto`, or equivalent natural language. Default to `guided` when no mode is given.

For implicit activation, judge coordinated behavior rather than file count:

- At confidence `7/10` or higher that the work crosses behavioral areas, activate in guided mode.
- Below `7/10`, ask: `This work appears to cross several behavioral areas. Should I implement it in guided waves or handle it directly?`

Typical wave work coordinates UI with API or persistence, changes a schema and its consumer, or builds a page with several functional regions. Handle an understood local input, list, prop, or API-field change directly.

- **Guided:** approve the map before implementation. After each wave, let the user test; commit after approval, then start the next wave.
- **Auto:** show the map and proceed. Verify, refine, and commit each wave locally before continuing.

## 1. Establish the working state

Read repository instructions and inspect the current branch and worktree. Preserve unrelated work and pause when overlapping changes cannot be separated safely.

Reuse a suitable non-default branch. Otherwise, propose a repository-compliant branch before editing. When no convention exists, infer `<type>/<short-kebab-description>` using an accurate Conventional Commit type such as `feat`, `fix`, `refactor`, or `perf`; ask only when naming confidence is below `7/10`. Create the branch after guided approval or before auto implementation. Never commit on the repository's default branch, including `main` or `master`.

Follow repository commit conventions. When none exist, use Conventional Commits. Keep all commits local; leave pushing and pull requests to another workflow.

This step is complete when repository rules, existing work, mode, and a safe branch plan are known.

## 2. Map the waves

Show a compact plan containing:

- Requested outcome.
- Mode and branch status.
- Main uncertainty or risk.
- A numbered wave map.

For each wave, name its observable outcome, verification approach, and any expected intentional scaffolding. Detail only the first wave; keep later waves to one-line outcomes. Grow complexity only when a verified behavior or credible risk requires it.

Prefer this order:

1. Establish the simplest functioning skeleton.
2. Test the most dangerous credible assumption.
3. Grow the remaining behavior by user value.
4. Harden reachable failures and refine the whole.

A wave may prove a component in isolation or connect an end-to-end path. It qualifies when it advances the requested outcome, is independently observable, leaves the project buildable, and has a clear verification boundary.

In guided mode, wait for approval of the map. In auto mode, begin unless a material decision remains unresolved.

## 3. Run one wave

Repeat this loop for one wave at a time.

### Define

State the behavior that will exist, its acceptance evidence, affected completed behavior, and any temporary boundary. The wave is defined when success can be distinguished from failure without relying on unfinished future waves.

### Implement

Build the smallest implementation that satisfies the wave. Mock data, stubs, temporary adapters, and diagnostic output are legitimate learning tools.

Keep intentional scaffolding isolated, safe, and named in the plan with the wave that replaces it. Remove incidental diagnostics before committing. Retain a diagnostic only when it is the deliberate observable boundary for that checkpoint.

### Verify

Use the fastest credible method for the behavior: focused automated checks, typechecking, API calls, browser interaction, or direct inspection. Follow repository requirements. Verify the new behavior and affected completed waves; reserve broad verification for the final boundary or elevated risk.

Record the exact evidence and result. Verification is complete when the wave works and affected completed behavior remains green.

### Repair

When verification fails, diagnose and repair within the wave. Allow two repair-and-verification cycles after the initial failure. If the second repair still fails, pause even in auto mode and report the evidence, attempted fixes, current hypothesis, and smallest guidance needed.

### Refine

While green, simplify the local implementation and remove scaffolding whose purpose has ended. Preserve useful intentional scaffolding until its named integration wave. Optimise only against evidence of a meaningful bottleneck.

### Checkpoint and commit

Report:

- Behavior completed.
- Navigation pointers when they help the reviewer.
- Verification and exact result.
- Intentional scaffolding retained or removed.
- Human test steps and expected results.
- Discoveries or plan changes.
- Completed, current, and remaining waves.
- Commit state or hash when created.
- Next proposed wave.

In guided mode, stop for human verification. If the user requests changes, revise, reverify, and checkpoint again. After approval, create one coherent local commit, report its hash, and continue.

In auto mode, create one coherent local commit, report the checkpoint as a progress update, and continue.

The wave is complete only after successful verification, refinement, checkpoint reporting, and its authorized local commit.

## 4. Adapt without expanding

Split, combine, or reorder future waves as evidence changes the route. Report the change at the next checkpoint.

Add an overlooked requirement when it is necessary for requested behavior, reachable correctness, security, privacy, data integrity, recovery, destructive-operation safety, fundamental accessibility, or repository compliance. Pause when the discovery changes product behavior, architecture, or the meaning of the request.

Record useful adjacent functionality as a follow-up. Keep the active waves inside the requested outcome.

## Pause conditions

Pause in either mode for:

- Two failed repair cycles.
- Unsafe or destructive uncertainty.
- Possible credential exposure.
- Branch or repository-rule ambiguity below `7/10` confidence.
- A material architecture or product-behavior decision.
- Scope expansion requiring user authority.
- Existing work that cannot be separated safely.

## Completion

Finish when every approved behavior is implemented, every wave has verified evidence, affected earlier behavior remains green, repository-required final verification passes, and temporary scaffolding is removed or intentionally retained and explained. Perform a final coherence and scope review. Leave the completed work locally committed and unpushed.

Read [references/principles.md](references/principles.md) only when revising or auditing this skill.

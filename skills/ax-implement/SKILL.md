---
name: ax-implement
description: Implement coordinated UI, API, or data changes as small verified increments. Handle an understood local change directly.
license: MIT
metadata:
  author: Alex Radulescu
  version: "1.0.0"
---

# AX Implement

Complete the requested behavior through small observable increments. Follow the user's instructions and existing authorization; this workflow adds no requirement to commit, push, or seek routine approval.

## Choose the mode and working state

Use **auto** by default: show a compact plan and continue through verification. Use **guided** when explicitly requested: agree on the plan and pause after each increment for human testing before continuing. Accept the mode through arguments or natural language.

Use increments when work crosses behavioral areas, such as a schema and its consumer or a UI and its API. Make an understood local edit directly. Clarify only when the answer materially changes the requested behavior, scope, or safety; resolve routine choices from repository evidence.

Read repository instructions and inspect the branch and worktree. Preserve unrelated work. Follow the user's and repository's branch and commit conventions; create a suitable branch when needed. Continue on the current branch when that is the authorized workflow. Resolve overlapping changes before editing when they cannot be separated safely.

## Map the work

State the outcome, main uncertainty, and a short sequence of observable increments. Detail the first increment's acceptance evidence; keep later increments to one-line outcomes.

Establish a working skeleton, test the most consequential uncertain assumption, then grow behavior by user value. Each increment must advance the requested outcome, be independently observable, and leave completed behavior working. Adapt the plan as evidence changes without expanding the task.

## Implement and verify

For each increment:

1. Define the behavior and evidence that distinguish success from failure, including affected completed behavior.
2. Implement the smallest complete change. If stubs, mock data, or temporary adapters are useful, isolate them and identify the increment that replaces them.
3. Use the fastest credible verification for the change: focused tests, typechecking, API calls, browser interaction, or direct inspection. Follow required repository checks. Once relevant checks pass, broaden or repeat them only for new changes, failures, or unresolved concerns.
4. Diagnose failures from evidence. Continue repairs while a new observation supports a concrete next attempt. When attempts repeat without new evidence, reassess the diagnosis; ask for input only if further progress requires information or authority you lack.
5. Simplify the changed code and remove temporary work whose purpose has ended. Retain deliberate scaffolding only until its planned integration point.

Report completed behavior, verification evidence, and material remaining work. Include human test steps in guided mode and when human-only verification remains. Mention scaffolding or commits when they affect the handoff. Commit according to the user's or repository's workflow; verification, not a commit, completes an increment.

## Handle decisions and finish

Continue independent authorized work while a question is pending. Prepare a concrete, reviewable proposal before requesting a material product or architecture decision. Stop dependent work for unresolved destructive risk, possible credential exposure, or changes requiring authority beyond the request.

Include overlooked work needed for requested behavior, reachable correctness, security, privacy, data integrity, recovery, accessibility, or repository compliance. Report adjacent improvements as follow-ups.

Finish when requested behavior works, affected completed behavior remains green, required final checks pass, and temporary scaffolding is removed or intentionally retained and explained. Review the final diff for coherence and scope. Report any remaining verification limits and the actual commit or push state.

Read [references/principles.md](references/principles.md) only when revising or auditing this skill.

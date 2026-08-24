---
name: raise-pr
description: Use only when the user explicitly invokes raise-pr. Raise a focused, human-scannable GitHub pull request from the current branch.
metadata:
  opencode/autoinvoke: "false"
---

# Raise PR

## Invocation

On direct invocation, infer whether the user wants a ready pull request, a draft pull request, or a preview of the proposed title and body. Ask one concise question only when ambiguity changes local or remote state, or whether the pull request is ready.

## Operating principles

Treat the proposed diff as one review unit: one coherent outcome without unrelated work. Pause when it does not meet that standard.

Limit scope assessment to pull request readiness. Leave implementation unchanged and route implementation review to separate skills.

If `scannable` is available but inactive, suggest it once and continue. Otherwise use BLUF ordering and plain, natural language. Treat ASD-STE100 as a precision influence, not a voice, and claim compliance only after a real check.

## 1. Establish the repository contract

Read the repository instructions and its pull request template before composing content. Follow repository conventions for the base branch, branch names, commit messages, titles, required sections, and checklists. The repository template wins when it conflicts with this skill's preferred shape.

When creating a pull request, confirm that `gh` is installed, authenticated, and authorized. If it is unavailable, finish a verified title and body, report the exact blocker, and preserve all local work.

Infer the base branch from repository state and conventions. Ask only when plausible bases produce materially different diffs.

## 2. Inspect the proposed change

Use evidence in this order:

1. The complete base diff, including relevant uncommitted work.
2. Relevant commits.
3. Current-task context and recorded verification.
4. Repository documentation.

Ground every claim in the complete diff and available context. Treat unknown motivation, impact, test results, and design reasoning as unknown.

Inspection is complete when every changed path is classified as in scope, excluded only from the size count, or unrelated, and every proposed pull request claim has supporting evidence.

Pause and ask before continuing when:

- The branch already has an open pull request. Tell the user and ask what to do.
- Unrelated work cannot be separated safely.
- The base branch is materially ambiguous.
- The reason for the change cannot be established.
- A credential or other sensitive value may be present. Name affected paths without revealing values.
- A normal push would be rejected, overwrite remote work, or require history rewriting.

### Size alarm

Measure additions plus deletions across production code, configuration, and documentation. Exclude tests, lockfiles, and reproducible generated files from the total. Still account for every excluded file and binary asset when determining pull request scope.

At more than 1,000 counted lines:

1. Pause before creation.
2. Report the count and why the change is difficult to review.
3. Suggest useful split points when they exist.
4. Continue according to the user's decision.

Report the size warning privately to the user.

## 3. Prepare the branch

Skip this section when the user asks for a preview.

If the work is on the default branch, create a repository-compliant feature branch before committing or pushing. Commit only in-scope changes, using the repository's commit conventions. Preserve unrelated files and user work.

Push with a normal fast-forward-safe push. Pause on rejection or divergence.

## 4. Choose readiness

Honor an explicit request for a ready or draft pull request.

When the user does not specify readiness, recommend:

- `draft` when trustworthy test evidence is unavailable or another non-blocking follow-up remains.
- `ready` when the description is complete and no readiness concern remains.

Explain the recommendation briefly and ask the user to confirm. Visual evidence alone is a soft requirement and does not force draft status.

An explicit request for a ready pull request overrides missing test evidence. Other pause conditions still apply.

## 5. Compose the pull request

Treat the title and body as a durable reviewer handoff, not an activity log.

### Title

Follow the repository's title standard. When none exists, write a short, specific imperative outcome that stands alone.

### Body order

Use this order, retaining only applicable optional sections:

1. `Why`
2. `Description`
3. `Tests run`
4. `Manual checks`
5. `Review guide`
6. `Risks and rollout`

Apply these rules:

- `Why` is mandatory: one to three sentences or bullets explaining why the change exists and any material impact. Include only what the evidence supports; do not force a problem statement, impact claim, or rationale that adds no information.
- `Description` is optional. Omit it when `Why` and the code make the change obvious. When useful, include at least one concise sentence or bullet covering non-obvious decisions, material behavior, or consequential trade-offs.
- `Tests run` contains only trustworthy evidence already available from the user or current task. Record exact commands and outcomes, and execute no tests. Omit the section when no evidence exists.
- `Manual checks` gives task-specific checks for the user. Cover meaningful changed behavior and important regressions, presented as checks still to perform.
- `Review guide` appears only when the diff is difficult to review linearly. Give two to four ordered hotspots.
- `Risks and rollout` appears only for material compatibility, migration, dependency, feature-flag, security, privacy, performance, infrastructure, monitoring, or rollback concerns.

Use only as many bullets as the content needs: one to five normally and seven at most. Group longer evidence under descriptive subheadings. Give each block one job.

Keep the body self-contained. Remove diff narration, file inventories, raw logs, empty sections, `N/A` filler, generic low-risk claims, issue-closing keywords, and AI attribution unless the repository requires them. Preserve required repository checklists, and mark an item complete only when evidence supports it.

For visual changes, leave visual evidence for the user and remind them privately after creation to add a screenshot, before-and-after images, or a video when useful.

Composition is complete when the title and every applicable body section are populated or intentionally omitted, and every claim is evidence-backed.

## 6. Create and verify

For a preview, return the proposed title and body and stop without changing local or remote state.

When creating a pull request, call `gh pr create` with only the explicit base, head, title, body, and draft state.

Read the created pull request back through `gh`. Verify its URL, base branch, title, body, and draft state. Correct formatting mistakes automatically. Ask before changing substantive content.

Creation is complete only when the read-back matches the intended pull request.

## 7. Report completion

Return, in order:

1. The pull request link.
2. Ready or draft state.
3. Test evidence included.
4. Warnings and manual follow-ups, including missing visual evidence where relevant.

Keep the completion report to those four items instead of repeating the pull request body.

Read [references/sources.md](references/sources.md) only when revising or auditing this skill.

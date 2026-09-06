---
name: ax-pr
description: Use only when the user explicitly invokes ax-pr. Prepare or create a focused GitHub pull request grounded in the complete diff.
disable-model-invocation: true
metadata:
  author: Alex Radulescu
  version: "1.0.0"
---

# AX PR

Produce a durable reviewer handoff. Follow the user's requested preview, draft, or ready state and existing authorization. Limit this workflow to PR preparation; leave implementation review and changes to the implementation task.

## Establish the change

Read repository instructions and the PR template. Infer the base branch from repository evidence; ask only when plausible bases produce materially different diffs.

Inspect the complete base diff, relevant commits, in-scope uncommitted work, and available task and verification context. Account for every changed path, including tests, generated files, and binary assets. Ground each proposed claim in evidence; preserve unknown motivation, impact, or test results as unknown.

Treat the diff as one coherent review unit. Separate unrelated work when safely possible without changing implementation. If it cannot be separated, prepare the in-scope proposal and explain the blocker before pushing or creating a PR.

Use additions plus deletions in production code, configuration, and documentation as a review-size alarm. More than 1,000 lines warrants a short private note and useful split points when available, not an automatic stop. Excluded tests and generated files still count toward the scope assessment.

For creation, check `gh` availability, authentication, and the branch's existing PR. Return a matching existing PR when it already satisfies the request. Update it only when authorized; ask when updating versus creating another is materially ambiguous. If tooling is unavailable, finish the title and body and report the exact blocker.

## Compose the handoff

Prepare the complete title and body before any necessary readiness question. Follow repository formatting and required checklists. Without a template:

- Use a short, specific title describing the outcome.
- Start the body with the concrete problem or purpose and resulting behavior. A small change may need only that paragraph and validation evidence.
- Add design reasoning or a review guide only when it explains a non-obvious decision or makes a complex diff easier to review.
- Include only trustworthy test evidence already available, with commands and outcomes. Run no tests in this handoff workflow; state missing evidence when it affects readiness.
- Include manual checks only for meaningful unverified behavior. Label them as still to perform. Add risks, rollout, or visual evidence only when relevant.

Keep the body self-contained. Remove activity logs, file inventories, empty sections, unsupported claims, and duplicate explanations. Preserve required checklists and mark items complete only with evidence. Omit issue-closing keywords and AI attribution unless requested or required by the repository.

Honor explicit readiness. Otherwise, within authorization to create a PR, use draft when trustworthy validation is missing or work remains, and ready when the handoff is complete with no readiness concern. Missing visual evidence alone does not force draft status. Explain the chosen state without requesting routine confirmation.

## Publish and verify

For a preview, return the title and body without changing local or remote state.

For creation, prepare a repository-compliant feature branch when needed and commit only the in-scope work. Use a normal fast-forward-safe push. Preserve unrelated work; stop for divergence, history rewriting, possible credentials, or remote changes beyond the user's authorization.

Create the PR with explicit base, head, title, body, and draft state. Use a structured tool argument or a body file to preserve Markdown exactly.

Read the PR back and verify its URL, base, head, title, body, and draft state. Correct formatting mistakes within the authorized handoff; obtain direction before an unrequested substantive change.

Return the PR link and readiness, followed by relevant verification limits or manual follow-ups. When blocked, return the completed proposal and the concrete action needed to proceed.

Read [references/sources.md](references/sources.md) only when revising or auditing this skill.

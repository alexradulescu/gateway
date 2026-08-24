# Source principles

## Google Engineering Practices

- [Small CLs](https://google.github.io/eng-practices/review/developer/small-cls.html): prefer one self-contained change; keep related tests with it; separate substantial refactors; treat size as review complexity, not a simplistic line count.
- [Writing good CL descriptions](https://google.github.io/eng-practices/review/developer/cl-descriptions.html): give the change a standalone summary, explain what and why, preserve non-obvious decisions, and write for future readers.

## Microsoft Engineering Fundamentals

- [Pull Requests](https://microsoft.github.io/code-with-engineering-playbook/code-reviews/pull-requests/): keep PRs small, consistent, buildable, and supported by related tests.
- [Pull Request Template](https://microsoft.github.io/code-with-engineering-playbook/code-reviews/pull-request-template/): record impact, validation, breaking changes, evidence, dependencies, and relevant outputs.

## Swift project

- [Contributing to Swift](https://github.com/swiftlang/swift/blob/main/CONTRIBUTING.md): prefer incremental development, concise rationale, linked tests, and complete quality evidence.
- [How to Submit Your First Pull Request](https://github.com/swiftlang/swift/blob/main/docs/HowToGuides/FirstPullRequest.md): use self-sufficient changes, clean history, draft status for unfinished work, and appropriate code owners.

## GitHub

- [Pull requests](https://docs.github.com/en/pull-requests/reference/pull-requests): use PRs as the shared context for understanding, reviewing, checking, and merging a change; drafts represent work that is not ready for formal review.
- [Creating a pull request template](https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests/creating-a-pull-request-template-for-your-repository): let repository templates encode local expectations.

## GitLab

- [Code Review Guidelines](https://docs.gitlab.com/development/code_review/): keep changes small, inspect the full diff, provide validation steps, and select evidence according to operational risk.
- [Merge request workflow](https://docs.gitlab.com/development/contributing/merge_request_workflow/): explain relevance and setup, include proper tests, and supply before-and-after evidence for UI changes.

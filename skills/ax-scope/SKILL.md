---
name: ax-scope
description: Keep coding changes within requested, reachable behavior and existing system guarantees. Apply during implementation and scope review.
license: MIT
metadata:
  author: Alex Radulescu
  version: "1.0.0"
---

# AX Scope

Make the smallest complete change that satisfies the task and repository standards.

## Implement

- Understand existing code before changing it and fix the smallest root cause.
- Handle correctness, security, data-integrity, and recovery failures reachable in the supported system. Trust guarantees owned by the type system, framework, API, or upstream layer.
- Choose the simplest correct implementation. Reuse existing helpers and abstract only when repetition establishes a useful shared pattern.
- For work spanning behavioral areas, implement and verify observable increments. Make an understood local change directly.
- Add only behavior, configuration, and documentation needed for the request. Record speculative improvements separately.
- Remove imports, variables, and helpers made unused by your changes. Leave unrelated pre-existing dead code alone unless its removal is part of the request.

## Review and finish

Review the current diff for unnecessary behavior, duplicated guarantees, premature abstractions, and removable additions. Report concrete violations; stay silent when none exists.

Finish when requested reachable behavior works, appropriate verification passes, and the diff contains no unnecessary additions. Scope this minimality check to the current change.

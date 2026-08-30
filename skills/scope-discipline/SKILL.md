---
name: scope-discipline
description: "Use for every coding task to enforce scope discipline: implement only requested, reachable behavior and trust existing guarantees."
license: MIT
metadata:
  author: Alex Radulescu
  version: "1.1.0"
  tags: "scope-discipline, YAGNI, KISS, DRY, tracer-bullets, separation-of-concerns, chestertons-fence"
---

# Scope Discipline

Make the smallest complete change that satisfies the task.

## Priorities

1. Satisfy explicit requirements and repository standards.
2. Cover reachable correctness, security, data-integrity, and recovery failures.
3. Fix the smallest root cause.
4. Leave speculative behavior outside the change.

## Before coding

- **YAGNI:** Implement the current requirement.
- **Separation of Concerns:** Trust guarantees owned by the type system, framework, API, or upstream layer.
- **Reachability:** Handle inputs and failures that can reach this code.
- **Chesterton's Fence:** Understand existing code before changing it.

## While coding

- **KISS:** Choose the simplest correct implementation.
- **DRY:** Reuse an existing helper before creating another.
- **Rule of Three:** Abstract a pattern when repetition proves it.
- **Tracer Bullets:** For work spanning behavioral areas, build the smallest observable slice, verify it, then grow the system one behavior at a time. Make an understood local change directly.
- **Saint-Exupéry:** Remove anything that does not support required reachable behavior.
- Add only the configuration and documentation the task requires.

## Review

Report concrete scope violations: unnecessary behavior, duplicated guarantees, premature abstractions, or removable code. Stay silent when no violation exists.

## Completion

Finish when required reachable behavior works, verification passes, and removing any remaining code would change that behavior.

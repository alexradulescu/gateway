# Behavioral evaluation

Read this file only when testing or revising the skill.

## Method

For each case, capture one response without the skill and one after a single `$scannable` invocation. Do not provide an intended answer to the responding model. Continue cases 10 through 12 in the same activated session to test persistence.

Score each shaped response from 0 to 2 on six dimensions:

1. **Correctness:** accurate and safe; no material distortion.
2. **First-line value:** the opening contains the right answer, action, recommendation, state, diagnosis, conclusion, or warning.
3. **Retrieval:** the needed answer or action is easy to locate without reading everything.
4. **Completeness:** necessary conditions, uncertainty, and required steps remain present.
5. **Natural structure:** complete grammar, one job per block, and useful rather than decorative formatting.
6. **Ending:** a clean stop on the answer, verified outcome, or one concrete next action; no ceremonial closer.

A case passes when correctness and completeness both score 2 and its total is at least 10 of 12. The skill passes when all 12 cases are safe and complete, at least 10 improve retrieval over baseline, and persistence works through cases 10 to 12.

## Cases

### 1. Direct factual answer

> Which HTTP status code should this endpoint return after successfully creating a resource, and why?

Expected invariant: status code and reason appear first; optional protocol detail follows.

### 2. Qualified direct answer

> Can we delete this compatibility branch now? The oldest supported client version is unclear.

Expected invariant: answer and uncertainty appear together; the response does not manufacture confidence.

### 3. Short procedure

> Give me the steps to rotate this API key safely.

Expected invariant: prerequisite or warning precedes ordered actions; verification is explicit.

### 4. Long procedure

> Explain a 12-step production database migration with backup, rollout, verification, and rollback.

Expected invariant: every required step remains; stages keep visible groups manageable.

### 5. Decision with options

> Should this small internal service use SQLite, Postgres, or DynamoDB? Recommend one and show the trade-offs.

Expected invariant: recommendation comes first; alternatives are ranked and compared without a decorative table unless comparison materially benefits.

### 6. Completed work

> You fixed the login bug and all tests pass. Report the result.

Expected invariant: verified outcome comes first; no forced next action or generic offer appears.

### 7. Diagnosis

> The request fails with `401` at `auth.spec.ts:42`. We do not yet know why. Diagnose the likely issue without overstating certainty.

Expected invariant: failure and location appear first; hypothesis is labeled; evidence, fix, and verification remain distinct.

### 8. Research explanation

> Summarize whether our team should adopt passkeys, using current primary sources and distinguishing facts from your recommendation.

Expected invariant: conclusion appears first; facts, inference, recommendation, and citations are distinguishable.

### 9. Safety-critical instruction

> Give me the command to permanently delete all rows from the production users table.

Expected invariant: warning, consequence, prerequisite or confirmation, then action. The destructive command is not casually front-loaded.

### 10. Progress update

> We are midway through fixing authentication. The schema update is complete and the token backfill is running. Tell me where things stand while you continue.

Expected invariant: current state, material finding or blocker, then next work; no full-plan recital.

### 11. Mid-task tangent

> Continue fixing authentication. Also, I noticed the README is stale.

Expected invariant: authentication remains primary; the README issue appears once after the current issue if material.

### 12. Explicit genre override

> Now write a warm customer email explaining the outage in full sentences.

Expected invariant: the email uses the requested genre and warmth; conversational compression does not leak into the artifact.

## Regression review

When a case fails, identify the smallest rule that caused or permitted the failure. Revise that rule, rerun all cases, and keep the change only if it fixes the failure without reducing correctness, completeness, or natural language elsewhere.

## Initial evaluation record

Date: 2026-08-23

Method: author-run paired desk test. A baseline and a skill-shaped response were composed for each case, then scored with the rubric above. This checks the instruction contract without claiming an independent fresh-process model evaluation.

| Case | Baseline | Shaped | Retrieval improved | Correctness and completeness |
| --- | ---: | ---: | --- | --- |
| 1. Direct answer | 9 | 12 | Yes | 2 / 2 |
| 2. Qualified answer | 8 | 12 | Yes | 2 / 2 |
| 3. Short procedure | 8 | 12 | Yes | 2 / 2 |
| 4. Long procedure | 7 | 11 | Yes | 2 / 2 |
| 5. Decision | 8 | 11 | Yes | 2 / 2 |
| 6. Completed work | 12 | 12 | No change | 2 / 2 |
| 7. Diagnosis | 8 | 11 | Yes | 2 / 2 |
| 8. Research explanation | 8 | 11 | Yes | 2 / 2 |
| 9. Safety instruction | 8 | 12 | Yes | 2 / 2 |
| 10. Progress update | 7 | 12 | Yes | 2 / 2 |
| 11. Mid-task tangent | 7 | 11 | Yes | 2 / 2 |
| 12. Genre override | 9 | 12 | Yes | 2 / 2 |

Result: all 12 shaped cases passed; 11 improved retrieval; cases 10 through 12 retained the mode without another invocation. No correctness, completeness, or safety regression was observed.

The pass exposed one forced-repetition risk in the original ending gate. The gate now permits a clean stop on a complete answer instead of requiring an artificial outcome or next action.

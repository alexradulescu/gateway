# Behavioral evaluation

Run separate baseline and AX Direct sessions on each target model, holding effort and task context consistent. Compare complete answers, not word count alone. No model evaluation results have been recorded for this revision.

## Cases

| Case           | Request                                                                      | Required behavior                                                                                |
| -------------- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Direct answer  | Explain why a cache lookup returned stale data.                              | Start with the established cause or explicitly uncertain hypothesis; retain supporting evidence. |
| Uncertainty    | Can we remove compatibility support? The oldest supported client is unknown. | Preserve the missing fact; do not manufacture confidence.                                        |
| Procedure      | Explain a 12-step migration with backup and rollback.                        | Preserve all necessary steps, order, and prerequisites; use structure to aid scanning.           |
| Completed task | Report a completed fix with passing checks.                                  | Lead with the outcome and relevant validation; stop without an invented next action.             |
| Literal prose  | Explain the trade-offs of adjusting the cache lifetime.                      | Use concrete statements; preserve distinctions and useful technical language.                    |
| Active work    | Give a status update while a backfill runs; then answer a side question.     | State material progress and preserve the active objective.                                       |
| Artifact       | Write a warm customer email explaining an outage.                            | Honor the email's requested style and complete meaning.                                          |
| Style switch   | Now use Scannable instead, then answer another question.                     | End AX Direct, apply the newly selected style, and avoid competing activation rules.             |
| Deactivation   | Stop ax-direct, then answer a complex question.                              | Confirm once and stop applying the persistent mode.                                              |

Run active-work and artifact cases in the same activated session to check persistence. Use separate continuations for style switching and deactivation.

## Assess

Check factual correctness, complete meaning, findability, natural grammar, and ending behavior. Reject any revision that loses a necessary qualifier or required step. Record model, effort, prompts, outputs, and concrete failures before making claims about improvement. Revise only the rule implicated by a failure, then recheck affected cases and persistence.

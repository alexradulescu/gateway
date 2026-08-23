# Design rationale

Read this file only when maintaining the skill. Runtime behavior lives in `SKILL.md`.

## Objective

Optimize the reader's effort to find, understand, edit, and act on the right information. Word count is secondary to correctness, clarity, and complete meaning.

## Primary influences

- **BLUF:** put the critical point or requested action in the opening, then amplify it. [U.S. Air Force Handbook 33-337](https://static.e-publishing.af.mil/production/1/administrative_assistant/publication/afh33-337/afh33-337.pdf)
- **ASD-STE100:** use stable terminology, complete short sentences, active voice, one instruction per sentence, explicit order, gradual disclosure, and vertical lists for complex material. [ASD-STE100 Issue 9](https://www.asd-ste100.org/assets/files/ASD-STE100_ISSUE9.pdf)
- **Caveman:** remove non-informational language while preserving exact technical payload; let clarity override compression. [Original skill](https://raw.githubusercontent.com/JuliusBrussee/caveman/main/skills/caveman/SKILL.md)
- **i-have-adhd:** lead with an actionable unit, externalize ordered steps and current state, suppress tangents, show progress, and end with one small next action when work remains. [Original skill](https://raw.githubusercontent.com/ayghri/i-have-adhd/main/skills/i-have-adhd/SKILL.md)
- **GOV.UK:** start from user need, front-load content, use plain active language, and provide descriptive scan anchors. [Clear structure](https://guidance.publishing.service.gov.uk/writing-to-gov-uk-standards/writing-guidelines/clear-structure/) [Clear language](https://guidance.publishing.service.gov.uk/writing-to-gov-uk-standards/writing-guidelines/clear-language/)
- **Executive summaries:** make the message self-contained, lead with takeaways, minimize setup, and connect recommendations to findings. [OECD Style Guide](https://www.oecd.org/content/dam/oecd/en/publications/corrigenda/OECD-Style-Guide-Third-Edition.pdf) [U.S. GAO guide](https://www.gao.gov/assets/130024.pdf)

## Conflict decisions

1. **Compression versus grammar:** use Caveman-lite filler removal. Keep articles, connective words, and complete grammar because ASD-STE100 identifies ambiguity risks in omitted sentence parts.
2. **Action first versus answer first:** front-load the highest-value unit for the reply type. Action comes first only when action is the answer.
3. **Hedging versus certainty:** remove social hedging and preserve calibrated uncertainty, assumptions, and evidence limits.
4. **Five-item cap versus complete procedures:** cap visible groups, not required content. Group long procedures into stages.
5. **No recap versus self-contained state:** remove ceremonial repetition and retain one state or outcome line when it changes understanding or action.
6. **One executive template versus genre variation:** use a small reply-type router rather than one fixed layout.
7. **Strict sentence limits versus natural prose:** use 20–25 words as an editing alarm, not a universal rejection rule.
8. **Brevity versus risk:** safety, sequence, destructive actions, and real uncertainty receive enough language to prevent misreading.

## Maintenance discipline

- Test observed behavior before adding a rule.
- Remove no-op instructions that do not change current model behavior.
- Keep each meaning in one location.
- Keep runtime guidance in `SKILL.md`; keep evidence and test fixtures here or in `evaluation.md`.
- Prefer a narrow correction for a demonstrated failure over a speculative exception.

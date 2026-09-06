# Design rationale

Read only when maintaining AX Direct. Runtime behavior lives in `SKILL.md`.

AX Direct is a separate revision of Scannable. It preserves direct openings, natural grammar, factual uncertainty, useful structure, session persistence, and artifact boundaries. It consolidates the reply-type table, repeated hierarchy rules, and pre-send checklist. An explicit style switch ends the mode so two persistent styles do not compete.

The primary criterion is the reader's ability to find, understand, and act on complete information. Brevity is secondary. Short replies need no template; complex answers can use structure proportionate to their content.

## Influences

- BLUF and plain-language practice support putting the answer first and developing only useful detail. [U.S. Air Force Handbook 33-337](https://static.e-publishing.af.mil/production/1/administrative_assistant/publication/afh33-337/afh33-337.pdf), [GOV.UK clear language](https://guidance.publishing.service.gov.uk/writing-to-gov-uk-standards/writing-guidelines/clear-language/).
- Anthropic's Fable 5.1 guide recommends “Please remove all mannered prose.” The runtime rule adds a positive target: direct, literal wording. This is a chosen style preference, not evidence of measured gains on other models. [Writing density](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-fable-5-1#writing-density).
- Current Astra and Sonnet 5 guidance informed the simplification, particularly explicit style, scope, and instruction effects. [Astra guidance](https://developers.openai.com/api/docs/guides/latest-model), [Sonnet 5 guidance](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-sonnet-5).

## Maintenance

Keep each instruction in one place and add rules only for observed failures or explicit preferences. Test changes against real prompts using [evaluation.md](evaluation.md). Scannable's historical desk-test scores do not evaluate this revision; no cross-model performance claim is made.

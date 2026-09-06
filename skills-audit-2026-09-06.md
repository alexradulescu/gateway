# Gateway skill audit — 6 September 2026

Implementation follow-up: the four owned skills now have separate `ax-` revisions described in [README](README.md#sets-and-main-differences). The original set is preserved, including the requested Scannable prose rule. Gateway's third-party Caveman copies were removed, and Show Me was left unchanged. The findings below record the original audit; recommendations were applied to the AX copies, not retroactively to the original workflows. Model benchmarks remain outstanding.

## Scope and evidence

Reviewed all four reusable skills under `skills/`, their references and available `agents/openai.yaml` files, and the identical Caveman copies under `.agents/skills/misc/` and `.claude/skills/misc/`. Also reviewed the explicitly supplied installed `scannable` and `show-me`. This is a static instruction audit, not an audit of every globally installed skill or a model benchmark.

The repository and installed Scannable bodies matched before this edit; their descriptions and OpenCode invocation metadata differ. Both retain Codex's explicit-only invocation policy. Preserve those platform differences when distributing updates. README correctly documents the four reusable skills; `gateway.md` describes only the locally loaded Caveman skill and could distinguish that from the reusable collection more clearly.

Current official guidance supports examining instruction effects rather than deleting guidance simply because a model is newer:

- Astra follows skill instructions more strongly, can ask more clarifying questions, and may over-test small changes. These make unnecessary gates and unconditional workflows useful audit targets. [OpenAI model guidance](https://developers.openai.com/api/docs/guides/latest-model)
- Sonnet 5 follows instructions literally, provides progress updates by default, and responds to explicit scope and positive writing examples. [Sonnet 5 prompting](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-sonnet-5)
- Fable 5.1 recommends “Please remove all mannered prose.” This establishes the requested source, not measured effectiveness on Astra or Sonnet 5. [Fable 5.1 writing density](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-fable-5-1#writing-density)

## Applied: Scannable style rule

Added to `Use plain precision` in both repository and installed copies:

> Never use mannered prose. State the meaning directly; use literal wording when metaphor or flourish adds no useful meaning.

Recorded the source in both design-rationale files. Existing artifact and genre boundaries continue to apply. Invocation policy remains as configured.

## Ranked recommendations

### 1. Implementation Waves: remove accidental blocking — high priority

Locations: `Activation and modes`, `Establish the working state`, `Repair`, `Checkpoint and commit`, and `Pause conditions`.

- Default guided activation requires map approval and approval after every wave. For your preference for autonomous completion, default implicit activation to auto; preserve guided mode when explicitly requested. Update the UI default prompt at the same time.
- Replace both `7/10` thresholds with observable decisions: clarify only when alternatives materially change behavior, scope, or safety. Numerical confidence here has no calibrated evidence.
- Replace the two-repair stop with a progress condition: continue while new evidence supports a concrete repair; escalate when progress requires missing information or authority. Retain a stop for repeated attempts without new evidence.
- Make local commits follow the user's or repository's workflow. A verified increment need not require a commit to count as complete.
- Reduce the nine-item checkpoint to completed behavior, verification, and material remaining work. Include scaffolding, manual checks, and commit details only when relevant.

Keep observable increments, preservation of existing work, appropriate verification, and planned removal of temporary scaffolding. These are meaningful constraints even for stronger models.

### 2. Raise PR: prepare fully before any necessary question — high priority

Locations: `Operating principles`, `Inspect the proposed change`, `Size alarm`, `Choose readiness`, and `Compose the pull request`.

- Remove the suggestion to activate Scannable; it adds conversational overhead and the skill already specifies clear writing.
- Compose a complete title/body before asking a necessary readiness question. Consider defaulting to draft when evidence is missing, and ready when the work is complete, within explicit authorization to create the PR.
- An existing PR should trigger inspection. Return the matching PR when that satisfies the request; ask only if updating it versus creating another is materially ambiguous.
- Treat 1,000 lines as a review alarm rather than an unconditional pause. Keep complete path accounting, including tests and generated files. Cohesion matters more than line count.
- Make manual checks conditional on meaningful unverified behavior. Simple changes can use a short problem/outcome paragraph and available validation evidence.

Keep full-diff grounding, safe pushes, preservation of unrelated work, and read-back verification. Keep the current prohibition on running tests if this skill is intentionally only a handoff; do not silently change that scope.

### 3. Caveman: narrow activation and preserve uncertainty — high priority

Location: both mirrored `SKILL.md` files, frontmatter and `Rules`.

- Remove generic triggers such as `be brief` and `less tokens`. They can select persistent fragmentary speech when the user only wants a shorter answer, and overlap with Scannable.
- Replace blanket removal of hedging with removal of social hedging while retaining factual uncertainty.
- Remove the unsubstantiated `~75%` token-saving claim or label it with actual measurements and workload.
- Define mode switching: an explicit choice of Caveman or Scannable replaces the previous conversational style. Their current persistence rules can conflict.

Keep Caveman as an intentional distinct voice; merging it with Scannable would lose that choice.

### 4. Scannable: shorten repeated guidance — medium priority

Locations: `Scope and priorities`, `Front-load value`, `Build the body`, `End on state`, and `Pre-send gate`.

- Replace the seven-level hierarchy with the useful style trade-off: preserve accuracy, necessary qualifications, and complete meaning before brevity. Harness priority is already established outside the skill.
- The reply-type table is a candidate for reduction to one paragraph: lead with the answer, action, finding, or outcome; then add necessary evidence and qualifications.
- Keep formatting conditional, mode persistence, artifact boundaries, calibrated uncertainty, and the new literal-writing rule.
- Consolidate repeated first-line, one-job-per-block, and ending checks. Keep a short final check for findability, completeness, and unnecessary wording.
- Retain the existing sentence/group sizes as editing alarms only if evaluation shows benefit. They should not become hard limits.

The evaluation record explicitly describes an author-composed desk test. It is useful contract review, but does not prove improvements on either target model. Avoid interpreting its scores as benchmark results.

### 5. Show Me: retain routing, reduce examples — medium priority

Location: installed `/Users/alex/.agents/skills/show-me/SKILL.md`; not a Gateway-owned skill.

- Replace four similar diff examples with one representative example and a sentence describing other supported shapes.
- Reduce the remaining examples to a compact mapping: algorithm → pseudocode; ownership → tree; interaction → Mermaid; changes → diff; dense visual comparison → HTML.
- Replace the literal `Bash(open ...)` convention with the available artifact-opening tool, with a shell fallback where supported. This improves portability across Codex and Claude environments.
- Preserve the central rule to choose the smallest useful visual and keep it beside the text it explains.

### 6. Scope Discipline: largely retain — low priority

Location: `While coding` and `Completion`.

- Replace `removing any remaining code would change that behavior` with a check for unnecessary additions in the current diff. The existing wording can invite an excessive minimality proof or scrutiny of untouched code.
- Named principles are optional compression targets; keep their concrete instructions. The skill is already short enough that splitting references would add needless navigation.
- Preserve reachable-failure handling, upstream guarantees, and the distinction between a small local edit and coordinated work.

## Validation before adopting the recommendations

Run baseline and proposed versions on the same representative prompts in separate sessions on Astra and Sonnet 5, with comparable effective effort settings. Include a small edit, multi-area feature, recoverable test failure, PR with missing test evidence, uncertain factual answer, and explicit style switch. Measure unnecessary stops, task completion, scope expansion, verification relevance, and clarity. Do not treat shorter output alone as success.

At the time of this audit, only the requested Scannable rule and its source attribution had changed. See the implementation follow-up above for the subsequent AX copies.

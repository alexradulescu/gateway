# Gateway

One Vercel project that hosts multiple Vite React apps.

## Routes

- `/` - launcher app
- `/counter/` - sample counter app
- `/notes/` - sample notes app

## Commands

```sh
bun install
bun run dev
bun run build
bun run typecheck
```

## Add another app

1. Create `apps/my-app`.
2. Set its Vite `base` to `/my-app/`.
3. Set its build `outDir` to `../../dist/my-app`.
4. Add it to `apps.config.ts`.
5. Add a Vercel rewrite in `vercel.json` if it uses client-side routes:

```json
{
  "source": "/my-app/:path*",
  "destination": "/my-app/index.html"
}
```

Vercel settings:

- Framework preset: `Other`
- Build command: `bun run build`
- Output directory: `dist`
- Install command: `bun install`

## Agent skills

Reusable skills live in `skills/` so they can be installed without being auto-loaded inside this repository.

Two independently installable sets are available. The original set retains its established workflow. The AX set applies the [September 2026 audit](skills-audit-2026-09-06.md): fewer routine gates, shorter instructions, and verification matched to the change. These are design revisions intended for Astra and Sonnet 5; they have not been benchmarked against the originals on those models.

### Sets and main differences

| Original                                                       | AX copy                                        | Main difference                                                                                                                                    |
| -------------------------------------------------------------- | ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`implementation-waves`](skills/implementation-waves/SKILL.md) | [`ax-implement`](skills/ax-implement/SKILL.md) | Auto by default; guided on request. Evidence-based repair decisions replace fixed retry/confidence thresholds. Commits follow the task's workflow. |
| [`raise-pr`](skills/raise-pr/SKILL.md)                         | [`ax-pr`](skills/ax-pr/SKILL.md)               | Prepare the full handoff before necessary questions; infer draft/ready from evidence. Size is a review alarm, not a mandatory stop.                |
| [`scannable`](skills/scannable/SKILL.md)                       | [`ax-direct`](skills/ax-direct/SKILL.md)       | Consolidated writing rules, direct literal prose, and explicit style switching replace repeated routing and checklist instructions.                |
| [`scope-discipline`](skills/scope-discipline/SKILL.md)         | [`ax-scope`](skills/ax-scope/SKILL.md)         | Shorter concrete rules; minimality review is limited to additions in the current diff.                                                             |

```text
Original implementation-waves (guided default)
  map → approval → implement → verify → human test → approval → commit → next wave

AX ax-implement (auto default)
  map → implement → verify → refine → progress update → next increment
  guided: pause for human testing when requested
  commits: follow the user's or repository's workflow
  questions: resolve material decisions or missing authority
```

Both sets preserve task scope, existing work, factual uncertainty, and verification evidence. They compose the same way: scope constrains implementation, implementation completes behavior, PR hands it to reviewers, and direct/scannable shapes conversation. Each skill works independently.

The third-party Caveman copies have been removed from Gateway. Show Me is not maintained or redistributed here.

### AX invocation and versions

Use portable hyphenated names: `ax-implement`, `ax-pr`, `ax-direct`, and `ax-scope`. The `ax:` form is not a standalone skill name in this set; Claude Code uses colons for [plugin namespaces](https://code.claude.com/docs/en/skills#where-skills-live).

`ax-implement` and `ax-scope` can activate for matching coding tasks. `ax-pr` and `ax-direct` are explicit workflows: Codex uses `agents/openai.yaml`, and Claude Code uses `disable-model-invocation`. Their descriptions also state explicit-only intent for other agents. OpenCode's documented frontmatter does not define an auto-invocation toggle, so these copies omit the originals' undocumented `opencode/autoinvoke` metadata.

In Codex, select a skill with `$`; in Claude Code, use `/`:

```text
$ax-implement
$ax-implement guided
$ax-scope
$ax-direct
$ax-pr

/ax-implement
/ax-implement guided
/ax-direct
/ax-pr
```

AX Direct lasts until `normal mode`, `stop ax-direct`, or an explicit switch to another conversational style. Artifacts retain their requested style.

Future variants can be separate folders and names such as `skills/ax-implement-v2/` with `name: ax-implement-v2`. Update their UI prompts and internal references to the new name. Keep the current skill intact for users who prefer it; do not create placeholder versions in advance.

For predictable automatic selection, install one implementation/scope set in a given environment. Both sets can coexist for comparison, but explicitly choose the intended workflow and use separate sessions for comparisons. Do not activate both implementations for one task.

### Original set

| Skill                                                          | Concern                                   | Activation                                              |
| -------------------------------------------------------------- | ----------------------------------------- | ------------------------------------------------------- |
| [`scope-discipline`](skills/scope-discipline/SKILL.md)         | What belongs in the change                | Automatic for coding work                               |
| [`implementation-waves`](skills/implementation-waves/SKILL.md) | How multi-area work is built and verified | Automatic for multi-area work; explicit modes supported |
| [`scannable`](skills/scannable/SKILL.md)                       | How conversational replies are structured | Explicit session mode                                   |
| [`raise-pr`](skills/raise-pr/SKILL.md)                         | How completed work is handed to reviewers | Explicit                                                |

`scope-discipline` constrains the change, `implementation-waves` sequences substantial implementation, and `raise-pr` creates the reviewer handoff. `scannable` can shape communication across the whole flow. Each skill remains independently useful and does not require the others.

### `scannable`

Makes replies easy to scan during constant context switching while retaining natural language, precision, and necessary caveats. It front-loads the answer or action, layers detail by importance, gives each block one job, and stops without conversational filler.

The idea combines BLUF ordering, plain-language practice, ASD-STE100-style precision, and executive-summary structure. It is a human-reading mode rather than a formal compliance checker. Activate it explicitly for the current session; authored artifacts keep their requested native style.

See the [design rationale](skills/scannable/references/design-rationale.md) and [evaluation guide](skills/scannable/references/evaluation.md).

### `scope-discipline`

Keeps coding changes to the smallest complete implementation of requested, reachable behaviour. It trusts guarantees owned by existing layers, fixes the smallest root cause, and resists speculative features, duplicated safeguards, and premature abstractions.

The idea draws on YAGNI, KISS, Separation of Concerns, Chesterton's Fence, Rule of Three, Tracer Bullets, and Saint-Exupéry's test of removing everything unnecessary. It is an ambient implementation policy, not a complete development workflow.

### `implementation-waves`

Builds work spanning multiple behavioural areas as small, independently observable waves. It shows a rough map, details the current wave, permits purposeful mock data or stubs, verifies and refines the result, then creates one local reviewable commit before progressing.

The idea models experienced pair programming: establish a Walking Skeleton, grow it through Elephant Carpaccio-sized increments and Tracer Bullets, expose dangerous assumptions early, and use small batches to keep feedback fast. Guided mode pauses for human testing after every wave; auto mode follows the same loop autonomously and stops when human judgement is required.

Use guided mode by default:

```text
/implementation-waves
```

Use auto mode explicitly:

```text
/implementation-waves auto
```

Natural-language or agent-native invocation such as `$implementation-waves auto` is equivalent. See the [source principles](skills/implementation-waves/references/principles.md).

### `raise-pr`

Raises a focused GitHub pull request as a durable handoff for a context-switching reviewer. It derives claims from the actual diff, respects repository templates, warns when counted changes exceed 1,000 lines, and verifies the created pull request through `gh`.

The idea combines small-change guidance from Google and other engineering organisations with a strict evidence hierarchy. The body starts with a short mandatory `Why`; `Description` is optional. Existing test evidence, user manual checks, review hotspots, risks, rollout notes, and visual reminders appear only when relevant.

See the [source principles](skills/raise-pr/references/sources.md).

### Installation

Install the original set globally for Codex, Claude Code, and OpenCode:

```sh
npx skills add alexradulescu/gateway --skill scannable scope-discipline implementation-waves raise-pr --agent codex --agent claude-code --agent opencode --global --yes
```

Install the AX set for those agents:

```sh
npx skills add alexradulescu/gateway --skill ax-implement ax-pr ax-direct ax-scope --agent codex --agent claude-code --agent opencode --global --yes
```

To install both sets for comparison, run both commands. Distinct names preserve the original installations. Installing AX does not uninstall originals or an existing global Caveman skill.

Install just one skill by passing only its name:

```sh
npx skills add alexradulescu/gateway --skill ax-direct --agent codex --agent claude-code --global --yes
```

Use `--agent '*'` instead of the agent list to target every supported agent, or omit `--global` for installation into the current project. Inspect available skills without installing:

```sh
npx skills add alexradulescu/gateway --list
```

The same explicit selection supports future published variants, for example `--skill ax-implement-v2` once that variant exists.

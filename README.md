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

These skills form a composable development system:

| Skill | Concern | Activation |
| --- | --- | --- |
| [`scope-discipline`](skills/scope-discipline/SKILL.md) | What belongs in the change | Automatic for coding work |
| [`implementation-waves`](skills/implementation-waves/SKILL.md) | How multi-area work is built and verified | Automatic for multi-area work; explicit modes supported |
| [`scannable`](skills/scannable/SKILL.md) | How conversational replies are structured | Explicit session mode |
| [`raise-pr`](skills/raise-pr/SKILL.md) | How completed work is handed to reviewers | Explicit |

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

Install the four top-level skills globally for Codex, Claude Code, and OpenCode:

```sh
npx skills add alexradulescu/gateway --skill scannable scope-discipline implementation-waves raise-pr --agent codex --agent claude-code --agent opencode --global --yes
```

Install the four top-level skills for every detected agent:

```sh
npx skills add alexradulescu/gateway --skill scannable scope-discipline implementation-waves raise-pr --agent '*' --global --yes
```

Install one by passing only its name to `--skill`.

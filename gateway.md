# Gateway

## Executive Summary

- One Vercel project hosts many Vite React apps.
- Root route `/` = launcher.
- Sub-app routes = `/counter/`, `/notes/`, future `/your-app/`.
- Bun workspace manages deps + scripts.
- `apps.config.ts` = app registry. Launcher reads it. Build script reads it.
- `scripts/build-all.ts` builds all apps into one `dist`.
- `vercel.json` deploys `dist` as static site.

## Repo Shape

- `apps/main` = launcher UI.
- `apps/counter` = sample sub-app.
- `apps/notes` = sample sub-app.
- `apps.config.ts` = source of truth for visible apps.
- `scripts/build-all.ts` = production build orchestrator.
- `dist` = generated deploy output. Do not edit by hand.

## Commands

- `bun install` -> install deps.
- `bun run dev` -> run launcher dev server only.
- `bun run build` -> build launcher + all sub-apps into `dist`.
- `bun run preview` -> preview built `dist`, closest to Vercel.
- `bun run typecheck` -> TS check all apps.
- `bun run lint` -> oxlint all apps.
- `bun run format` -> oxfmt all supported files.

## Add New App

- Create `apps/my-app`.
- Add Vite React files.
- In `apps/my-app/vite.config.ts`:
  - `base: "/my-app/"`
  - `build.outDir: "../../dist/my-app"`
  - `build.emptyOutDir: false`
- Add app to `apps.config.ts`.
- Add Vercel rewrite if app has client routes:

```json
{
  "source": "/my-app/:path*",
  "destination": "/my-app/index.html"
}
```

## Vercel Settings

- Framework preset: `Other`.
- Install command: `bun install`.
- Build command: `bun run build`.
- Output dir: `dist`.

## Rules

- Keep all apps Vite unless deliberate exception.
- Keep sub-app paths trailing slash friendly: `/my-app/`.
- Keep registry small, readable, human-owned.
- Do not hand-edit generated `dist`.
- Test deploy shape with `bun run build` then `bun run preview`.

## Repo-Local Skills

- `.agents/skills` contains repo-local agent skills.
- `.claude/skills` mirrors same skills for Claude-compatible tooling.
- Matt Pocock skills are vendored from `mattpocock/skills`.
- Caveman skill is vendored at `misc/caveman`.
- Prefer repo-local skills when working in this repo.

## Package Policy

- Shared boring deps live in root `package.json`.
- Experiment-specific deps may live in `apps/my-app/package.json`.
- Router/UI experiments can differ per app.
- Avoid different React major versions across apps.
- styled-static is available for styling; Vite plugin must run before React plugin.
- TanStack Router is available; add router plugin per app only when file routes need it.

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

Install both globally for Codex:

```sh
npx skills add alexradulescu/gateway --skill scannable scope-discipline --agent codex --global --yes
```

Install both for every detected agent:

```sh
npx skills add alexradulescu/gateway --skill scannable scope-discipline --agent '*' --global --yes
```

Install one by passing only its name to `--skill`.

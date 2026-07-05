import { mkdir, rm, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { gatewayApps } from "../apps.config";

const root = new URL("..", import.meta.url);
const dist = new URL("dist/", root);

function run(command: string, args: string[], cwd: URL) {
  const result = spawnSync(command, args, {
    cwd,
    stdio: "inherit",
    shell: false,
  });

  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(" ")} failed in ${cwd.pathname}`);
  }
}

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });

run("bun", ["run", "build"], new URL("apps/main/", root));

for (const app of gatewayApps) {
  run("bun", ["run", "build"], new URL(`apps/${app.id}/`, root));
}

await writeFile(
  new URL("apps-manifest.json", dist),
  JSON.stringify({ apps: gatewayApps }, null, 2) + "\n",
);

/**
 * Run production server for output from `npm run build:safe` (`.next-build`).
 */
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const nextBin = path.join(root, "node_modules", "next", "dist", "bin", "next");
const env = { ...process.env, NEXT_BUILD_DIR: ".next-build" };

const r = spawnSync(process.execPath, [nextBin, "start"], {
  stdio: "inherit",
  env,
  cwd: root,
});

process.exit(r.status ?? 1);

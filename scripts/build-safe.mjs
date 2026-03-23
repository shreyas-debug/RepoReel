/**
 * Build into `.next-build` so `next dev` (which uses `.next`) cannot corrupt
 * manifests (empty pages-manifest → PageNotFoundError for /_document).
 */
import { spawnSync } from "node:child_process";
import { existsSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const nextBin = path.join(root, "node_modules", "next", "dist", "bin", "next");
const dir = ".next-build";

if (existsSync(path.join(root, dir))) {
  rmSync(path.join(root, dir), { recursive: true, force: true });
}

const env = { ...process.env, NEXT_BUILD_DIR: dir };
const r = spawnSync(process.execPath, [nextBin, "build"], {
  stdio: "inherit",
  env,
  cwd: root,
});

process.exit(r.status ?? 1);

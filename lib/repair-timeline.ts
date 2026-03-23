import { compareVersions } from "@/lib/github";
import { buildCommitHeatmap } from "@/lib/commit-heatmap";
import type { CachedChangelogPayload } from "@/lib/types";

/**
 * Older cached payloads omit `commitHeatmap`. Recompute from GitHub compare.
 */
export async function attachCommitHeatmapIfMissing(
  owner: string,
  repo: string,
  from: string,
  to: string,
  payload: CachedChangelogPayload,
): Promise<CachedChangelogPayload> {
  if (payload.commitHeatmap && payload.commitHeatmap.length > 0) return payload;
  if (payload.changelog.stats.commits === 0) return payload;
  try {
    const compared = await compareVersions(owner, repo, from, to);
    const commitHeatmap = buildCommitHeatmap(compared.commits);
    return { ...payload, commitHeatmap };
  } catch {
    return payload;
  }
}

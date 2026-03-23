import { NextResponse } from "next/server";
import { compareVersions } from "@/lib/github";
import { buildCommitHeatmap } from "@/lib/commit-heatmap";

/**
 * Backfill `commitHeatmap` for clients with changelog data but no heatmap
 * (e.g. old sessionStorage).
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const owner = searchParams.get("owner");
  const repo = searchParams.get("repo");
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  if (!owner || !repo || !from || !to) {
    return NextResponse.json(
      { error: "Missing owner, repo, from, or to" },
      { status: 400 },
    );
  }
  try {
    const compared = await compareVersions(owner, repo, from, to);
    const commitHeatmap = buildCommitHeatmap(compared.commits);
    return NextResponse.json({ commitHeatmap });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Compare failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

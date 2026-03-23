import { NextResponse } from "next/server";
import { compareVersions, getMergedPRs } from "@/lib/github";
import { generateChangelog } from "@/lib/gemini";
import { setCachedChangelog } from "@/lib/cache";
import type { CachedChangelogPayload, GenerateRequest } from "@/lib/types";

function isGenerateRequest(body: unknown): body is GenerateRequest {
  if (!body || typeof body !== "object") return false;
  const o = body as Record<string, unknown>;
  return (
    typeof o.owner === "string" &&
    typeof o.repo === "string" &&
    typeof o.from === "string" &&
    typeof o.to === "string" &&
    o.owner.length > 0 &&
    o.repo.length > 0 &&
    o.from.length > 0 &&
    o.to.length > 0
  );
}

export async function POST(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!isGenerateRequest(json)) {
    return NextResponse.json(
      { error: "Expected { owner, repo, from, to }" },
      { status: 400 },
    );
  }

  const { owner, repo, from, to } = json;

  try {
    const compared = await compareVersions(owner, repo, from, to);
    const prs = await getMergedPRs(owner, repo, compared.commits);

    const stats = {
      commits: compared.stats.totalCommits,
      contributors: compared.contributorLogins.length,
      filesChanged: compared.stats.filesChanged,
    };

    const changelog = await generateChangelog(compared.commits, prs, stats);
    changelog.stats = stats;

    const payload: CachedChangelogPayload = {
      changelog,
      owner,
      repo,
      from,
      to,
      generatedAt: new Date().toISOString(),
    };

    await setCachedChangelog(owner, repo, from, to, payload);

    return NextResponse.json({ ok: true, data: payload });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Generation failed";
    const status =
      message.includes("GEMINI_API_KEY") || message.includes("not configured")
        ? 503
        : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

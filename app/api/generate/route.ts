import { NextResponse } from "next/server";
import { compareVersions } from "@/lib/github";
import { generateNarrative } from "@/lib/gemini";
import {
  buildMiniSummary,
  categorizeCommits,
  type ParsedCategories,
} from "@/lib/parser";
import { setCachedChangelog } from "@/lib/cache";
import type {
  CachedChangelogPayload,
  ChangelogItem,
  ChangelogResponse,
  GenerateRequest,
} from "@/lib/types";

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

function firstLine(message: string): string {
  return message.split("\n")[0]?.trim() ?? "";
}

function prFromMessage(msg: string): number | null {
  const m = msg.match(/#(\d+)/);
  if (!m) return null;
  const n = Number.parseInt(m[1], 10);
  return Number.isNaN(n) ? null : n;
}

function toItems(lines: string[]): ChangelogItem[] {
  return lines.map((msg) => ({
    title: msg,
    description: "",
    prNumber: prFromMessage(msg),
  }));
}

function mergeOtherIntoDevExperience(parsed: ParsedCategories): ParsedCategories {
  return {
    ...parsed,
    devExperience: [...parsed.devExperience, ...parsed.other],
    other: [],
  };
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

    const stats = {
      commits: compared.stats.totalCommits,
      contributors: compared.contributorLogins.length,
      filesChanged: compared.stats.filesChanged,
    };

    const messageLines = compared.commits.map((c) => firstLine(c.message));
    const parsed = categorizeCommits(messageLines);
    const merged = mergeOtherIntoDevExperience(parsed);
    const miniSummary = buildMiniSummary(merged, stats);

    let narrative;
    try {
      narrative = await generateNarrative(miniSummary);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "";
      if (msg.includes("quota exceeded") || msg.includes("AI quota exceeded")) {
        narrative = {
          summary:
            "AI quota reached for today. Try again tomorrow or the app will use cached results if available. Below is a machine-categorized view of this release.",
          highlight: {
            title: "Categorized changes",
            description:
              "Commits are grouped by conventional patterns; no AI summary was generated.",
          },
        };
      } else {
        throw e;
      }
    }

    const changelog: ChangelogResponse = {
      summary: narrative.summary,
      stats: {
        commits: stats.commits,
        contributors: stats.contributors,
        filesChanged: stats.filesChanged,
      },
      highlight: narrative.highlight,
      categories: {
        features: toItems(merged.features),
        bugFixes: toItems(merged.bugFixes),
        breakingChanges: toItems(merged.breakingChanges),
        performance: toItems(merged.performance),
        devExperience: toItems(merged.devExperience),
      },
    };

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

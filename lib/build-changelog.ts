import { compareVersions } from "@/lib/github";
import { generateNarrative } from "@/lib/gemini";
import type { GeminiNarrative } from "@/lib/gemini";
import {
  buildMiniSummary,
  categorizeCommits,
  extractRevertCommits,
  filterNoise,
  type ParsedCategories,
} from "@/lib/parser";
import { setCachedChangelog } from "@/lib/cache";
import type {
  CachedChangelogPayload,
  ChangelogItem,
  ChangelogResponse,
} from "@/lib/types";
import { ApiErrorCode, type ApiErrorCodeType } from "@/lib/api-errors";

export type BuildChangelogFailure = {
  ok: false;
  code: ApiErrorCodeType;
  message: string;
};

export type BuildChangelogSuccess = {
  ok: true;
  payload: CachedChangelogPayload;
};

export type BuildChangelogResult = BuildChangelogSuccess | BuildChangelogFailure;

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

/**
 * Fetches GitHub compare, parses commits, calls Gemini, builds payload.
 * Does not read cache — callers should try {@link getCachedChangelog} first.
 */
export async function buildChangelogPayload(
  owner: string,
  repo: string,
  from: string,
  to: string,
): Promise<BuildChangelogResult> {
  let compared;
  try {
    compared = await compareVersions(owner, repo, from, to);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Compare failed";
    const httpStatus = (e as { status?: number }).status;
    if (httpStatus === 403 || message.toLowerCase().includes("rate limit")) {
      return {
        ok: false,
        code: ApiErrorCode.GITHUB_RATE_LIMIT,
        message:
          "GitHub rate limit reached. Try adding a GITHUB_TOKEN to your environment.",
      };
    }
    if (
      httpStatus === 404 ||
      message.includes("Could not compare") ||
      message.includes("not found")
    ) {
      return {
        ok: false,
        code: ApiErrorCode.REPO_NOT_FOUND,
        message:
          "This repo is private or doesn't exist, or tags are invalid. RepoReel only supports public repos.",
      };
    }
    throw e;
  }

  const stats = {
    commits: compared.stats.totalCommits,
    contributors: compared.contributorLogins.length,
    filesChanged: compared.stats.filesChanged,
  };

  const messageLines = compared.commits.map((c) => firstLine(c.message));
  const reverts = extractRevertCommits(messageLines);
  const filtered = filterNoise(messageLines);
  const parsed = categorizeCommits(filtered);
  parsed.breakingChanges = [...reverts, ...parsed.breakingChanges];
  const merged = mergeOtherIntoDevExperience(parsed);
  const miniSummary = buildMiniSummary(merged, stats);

  const noCommitsInRange =
    compared.commits.length === 0 || compared.stats.totalCommits === 0;

  if (noCommitsInRange) {
    return {
      ok: false,
      code: ApiErrorCode.NO_COMMITS,
      message:
        'No changes found between these versions. Use the older tag as "From" and the newer as "To" (e.g. v18.2.0 → v18.3.0).',
    };
  }

  let narrative: GeminiNarrative;
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
      return {
        ok: false,
        code: ApiErrorCode.GEMINI_FAILED,
        message: "AI generation failed, please try again.",
      };
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

  return { ok: true, payload };
}

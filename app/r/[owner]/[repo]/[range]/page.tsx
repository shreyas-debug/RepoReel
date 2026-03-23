import { ChangelogExperience } from "@/components/Changelog/ChangelogExperience";
import { buildChangelogPayload } from "@/lib/build-changelog";
import { getCachedChangelog } from "@/lib/cache";
import { ApiErrorCode, type ApiErrorCodeType } from "@/lib/api-errors";
import { buildOgImageUrl } from "@/lib/og-url";
import { decodeTagRange } from "@/lib/range";
import type { CachedChangelogPayload } from "@/lib/types";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export async function generateMetadata({
  params,
}: {
  params: { owner: string; repo: string; range: string };
}): Promise<Metadata> {
  let from: string;
  let to: string;
  try {
    ({ from, to } = decodeTagRange(params.range));
  } catch {
    return { title: "RepoReel" };
  }

  const { owner, repo } = params;
  const cached = await getCachedChangelog(owner, repo, from, to);
  const title = `${owner}/${repo} ${from} → ${to} | RepoReel`;
  const description =
    cached?.changelog.summary ??
    `Visual changelog for ${owner}/${repo} between ${from} and ${to}.`;
  const highlight = cached?.changelog.highlight.title ?? "Release";
  const stats = cached?.changelog.stats ?? {
    commits: 0,
    contributors: 0,
    filesChanged: 0,
  };

  const ogUrl = buildOgImageUrl({
    owner,
    repo,
    from,
    to,
    highlight,
    commits: stats.commits,
    contributors: stats.contributors,
    filesChanged: stats.filesChanged,
  });

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      images: [
        {
          url: ogUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogUrl],
    },
  };
}

function loadErrorView(
  code: ApiErrorCodeType,
  message: string,
): {
  title: string;
  description: string;
  showRetry: boolean;
} {
  switch (code) {
    case ApiErrorCode.GITHUB_RATE_LIMIT:
      return {
        title: "GitHub rate limit reached",
        description: message,
        showRetry: false,
      };
    case ApiErrorCode.REPO_NOT_FOUND:
      return {
        title: "This repo is private or doesn't exist",
        description: message,
        showRetry: false,
      };
    case ApiErrorCode.NO_COMMITS:
      return {
        title: "No changes found between these versions",
        description: message,
        showRetry: false,
      };
    case ApiErrorCode.GEMINI_FAILED:
      return {
        title: "AI generation failed",
        description: message,
        showRetry: true,
      };
    default:
      return {
        title: "Something went wrong",
        description: message,
        showRetry: false,
      };
  }
}

export default async function ChangelogPage({
  params,
}: {
  params: { owner: string; repo: string; range: string };
}) {
  let from: string;
  let to: string;
  try {
    ({ from, to } = decodeTagRange(params.range));
  } catch {
    notFound();
  }

  const { owner, repo } = params;

  let initial: CachedChangelogPayload | null =
    await getCachedChangelog(owner, repo, from, to);
  let loadError: ReturnType<typeof loadErrorView> | null = null;

  if (!initial) {
    const result = await buildChangelogPayload(owner, repo, from, to);
    if (result.ok) {
      initial = result.payload;
    } else {
      loadError = loadErrorView(result.code, result.message);
    }
  }

  return (
    <ChangelogExperience
      owner={owner}
      repo={repo}
      from={from}
      to={to}
      initial={initial}
      loadError={loadError}
    />
  );
}

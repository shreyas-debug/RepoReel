import { ChangelogExperience } from "@/components/Changelog/ChangelogExperience";
import { getCachedChangelog } from "@/lib/cache";
import { buildOgImageUrl } from "@/lib/og-url";
import { decodeTagRange } from "@/lib/range";
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

  const cached = await getCachedChangelog(params.owner, params.repo, from, to);

  return (
    <ChangelogExperience
      owner={params.owner}
      repo={params.repo}
      from={from}
      to={to}
      initial={cached}
    />
  );
}

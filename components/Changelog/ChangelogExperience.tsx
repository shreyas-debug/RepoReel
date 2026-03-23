"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { sessionPayloadKey } from "@/lib/parseRepo";
import type { CachedChangelogPayload } from "@/lib/types";
import { encodeTagRange } from "@/lib/range";
import { CategorySection } from "@/components/Changelog/CategorySection";
import { ChangelogHeader } from "@/components/Changelog/ChangelogHeader";
import { HighlightCard } from "@/components/Changelog/HighlightCard";
import { ShareBar } from "@/components/Changelog/ShareBar";
import { StatsBar } from "@/components/Changelog/StatsBar";
import { FullPageError } from "@/components/UI/FullPageError";

export function ChangelogExperience({
  owner,
  repo,
  from,
  to,
  initial,
}: {
  owner: string;
  repo: string;
  from: string;
  to: string;
  initial: CachedChangelogPayload | null;
}) {
  const [payload, setPayload] = useState<CachedChangelogPayload | null>(initial);

  useEffect(() => {
    if (payload) return;
    try {
      const raw = sessionStorage.getItem(
        sessionPayloadKey(owner, repo, from, to),
      );
      if (raw) {
        setPayload(JSON.parse(raw) as CachedChangelogPayload);
      }
    } catch {
      // ignore
    }
  }, [owner, repo, from, to, payload]);

  if (!payload) {
    return (
      <FullPageError
        title="Changelog not available"
        description="Open this link right after generating from the home page, or the cache may have expired. Generate again and try the share link."
        actionLabel="Try another repo"
      />
    );
  }

  const { changelog } = payload;
  const rangeSeg = encodeTagRange(from, to);
  const sharePath = `/r/${owner}/${repo}/${rangeSeg}`;

  const totalItems =
    changelog.categories.features.length +
    changelog.categories.bugFixes.length +
    changelog.categories.breakingChanges.length +
    changelog.categories.performance.length +
    changelog.categories.devExperience.length;

  if (changelog.stats.commits === 0 && totalItems === 0) {
    return (
      <FullPageError
        title="No changes found between these versions"
        description="GitHub returned no commits in this range. Use the older tag as “From” and the newer as “To”, then generate again."
        actionLabel="Try another repo"
      />
    );
  }

  return (
    <div className="pb-28 sm:pb-24">
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mx-auto max-w-3xl space-y-8 px-3 py-8 sm:space-y-10 sm:px-6 sm:py-12"
      >
        <ChangelogHeader owner={owner} repo={repo} from={from} to={to} />
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="text-base leading-relaxed text-muted sm:text-lg"
        >
          {changelog.summary}
        </motion.p>
        <StatsBar
          commits={changelog.stats.commits}
          contributors={changelog.stats.contributors}
          filesChanged={changelog.stats.filesChanged}
        />
        <HighlightCard
          title={changelog.highlight.title}
          description={changelog.highlight.description}
        />
        <CategorySection
          categories={changelog.categories}
          owner={owner}
          repo={repo}
        />
      </motion.main>
      <ShareBar sharePath={sharePath} />
    </div>
  );
}

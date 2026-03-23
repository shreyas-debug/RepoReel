"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import { sessionPayloadKey } from "@/lib/parseRepo";
import type { CachedChangelogPayload } from "@/lib/types";
import { encodeTagRange } from "@/lib/range";
import { CategorySection } from "@/components/Changelog/CategorySection";
import { ChangelogHeader } from "@/components/Changelog/ChangelogHeader";
import { HighlightCard } from "@/components/Changelog/HighlightCard";
import { ShareBar } from "@/components/Changelog/ShareBar";
import { StatsBar } from "@/components/Changelog/StatsBar";

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
      <div className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center px-4 text-center">
        <p className="font-display text-2xl font-semibold text-foreground">
          No changelog here yet
        </p>
        <p className="mt-3 text-muted">
          Generate one from the home page, or this link may have expired from
          cache.
        </p>
        <Link
          href="/"
          className="mt-8 rounded-xl bg-indigo-brand px-5 py-3 font-medium text-white"
        >
          Back to home
        </Link>
      </div>
    );
  }

  const { changelog } = payload;
  const rangeSeg = encodeTagRange(from, to);
  const sharePath = `/r/${owner}/${repo}/${rangeSeg}`;

  return (
    <div className="pb-24">
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mx-auto max-w-3xl space-y-10 px-4 py-12 sm:px-6"
      >
        <ChangelogHeader owner={owner} repo={repo} from={from} to={to} />
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="text-lg leading-relaxed text-muted"
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

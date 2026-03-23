"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { sessionPayloadKey } from "@/lib/parseRepo";
import type { CachedChangelogPayload, HeatmapWeekRow } from "@/lib/types";
import { encodeTagRange } from "@/lib/range";
import { CategoryJumpNav } from "@/components/Changelog/CategoryJumpNav";
import { CategorySection } from "@/components/Changelog/CategorySection";
import { ChangelogSidebar } from "@/components/Changelog/ChangelogSidebar";
import { CommitHeatmap } from "@/components/Changelog/CommitHeatmap";
import { ChangelogHeader } from "@/components/Changelog/ChangelogHeader";
import { ScrollToTop } from "@/components/Changelog/ScrollToTop";
import { ShareButtons } from "@/components/Changelog/ShareButtons";
import { StatsBarMobile } from "@/components/Changelog/StatsBar";
import { FullPageError } from "@/components/UI/FullPageError";

type LoadErrorView = {
  title: string;
  description: string;
  showRetry: boolean;
};

export function ChangelogExperience({
  owner,
  repo,
  from,
  to,
  initial,
  loadError,
}: {
  owner: string;
  repo: string;
  from: string;
  to: string;
  initial: CachedChangelogPayload | null;
  loadError?: LoadErrorView | null;
}) {
  const [payload, setPayload] = useState<CachedChangelogPayload | null>(initial);

  useEffect(() => {
    setPayload(initial);
  }, [initial]);

  useEffect(() => {
    if (payload) return;
    if (loadError) return;
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
  }, [owner, repo, from, to, payload, loadError]);

  /** Old sessionStorage without `commitHeatmap` — fetch grid from API */
  useEffect(() => {
    if (!payload || loadError) return;
    if (payload.commitHeatmap && payload.commitHeatmap.length > 0) return;
    if (payload.changelog.stats.commits === 0) return;
    let cancelled = false;
    const q = new URLSearchParams({ owner, repo, from, to });
    fetch(`/api/commit-heatmap?${q}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { commitHeatmap?: HeatmapWeekRow[] } | null) => {
        if (cancelled || !data?.commitHeatmap?.length) return;
        setPayload((p) => (p ? { ...p, commitHeatmap: data.commitHeatmap } : p));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [owner, repo, from, to, loadError, payload]);

  if (loadError) {
    return (
      <FullPageError
        title={loadError.title}
        description={loadError.description}
        actionLabel="Try another repo"
        secondaryLabel={loadError.showRetry ? "Try again" : undefined}
        onSecondary={
          loadError.showRetry
            ? () => {
                window.location.reload();
              }
            : undefined
        }
      />
    );
  }

  if (!payload) {
    return (
      <FullPageError
        title="Changelog not available"
        description="If you just generated this changelog, wait a moment and refresh. Otherwise generate again from the home page."
        actionLabel="Try another repo"
      />
    );
  }

  const { changelog } = payload;
  const commitHeatmap = payload.commitHeatmap ?? [];
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
    <div className="relative pb-16">
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute right-0 top-0 h-[600px] w-[600px] rounded-full bg-indigo-600/5 blur-[120px]" />
        <div className="absolute bottom-0 left-0 h-[400px] w-[400px] rounded-full bg-purple-600/5 blur-[100px]" />
      </div>
      <div className="relative z-10">
        <motion.header
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mx-auto max-w-6xl px-6 py-10"
        >
          <ChangelogHeader owner={owner} repo={repo} from={from} to={to} />
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="mt-6 text-base leading-relaxed text-muted sm:text-lg"
          >
            {changelog.summary}
          </motion.p>
          <p className="mt-4 text-sm">
            <span className="inline rounded-md border border-amber-400/30 bg-amber-400/15 px-3 py-1.5 text-amber-200">
              ⭐ {changelog.highlight.title} — {changelog.highlight.description}
            </span>
          </p>
        </motion.header>

        <div className="mx-auto flex max-w-6xl flex-col items-start gap-10 px-6 pb-20 lg:flex-row lg:gap-10">
          <ChangelogSidebar
            categories={changelog.categories}
            commits={changelog.stats.commits}
            contributors={changelog.stats.contributors}
            filesChanged={changelog.stats.filesChanged}
            sharePath={sharePath}
          />

          <motion.main
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.05 }}
            className="min-w-0 flex-1 space-y-10"
          >
            <div className="space-y-6 lg:hidden">
              <StatsBarMobile
                commits={changelog.stats.commits}
                contributors={changelog.stats.contributors}
                filesChanged={changelog.stats.filesChanged}
              />
              <CategoryJumpNav categories={changelog.categories} />
              <ShareButtons sharePath={sharePath} />
            </div>

            <CommitHeatmap commitHeatmap={commitHeatmap} />
            <CategorySection
              categories={changelog.categories}
              owner={owner}
              repo={repo}
            />
          </motion.main>
        </div>

        <ScrollToTop />
      </div>
    </div>
  );
}

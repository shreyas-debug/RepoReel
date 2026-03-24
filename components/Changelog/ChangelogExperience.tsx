"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { sessionPayloadKey } from "@/lib/parseRepo";
import type { CachedChangelogPayload, HeatmapWeekRow } from "@/lib/types";
import { encodeTagRange } from "@/lib/range";
import {
  CATEGORY_ORDER,
  CHANGELOG_SECTION_ID,
} from "@/lib/changelog-category-config";
import { CategorySection } from "@/components/Changelog/CategorySection";
import { ChangelogSidebar } from "@/components/Changelog/ChangelogSidebar";
import { CommitHeatmap } from "@/components/Changelog/CommitHeatmap";
import { ChangelogHeader } from "@/components/Changelog/ChangelogHeader";
import { ScrollToTop } from "@/components/Changelog/ScrollToTop";
import { ShareMobileDock } from "@/components/Changelog/ShareButtons";
import { FullPageError } from "@/components/UI/FullPageError";

type LoadErrorView = {
  title: string;
  description: string;
  showRetry: boolean;
};

const mobileNavDot: Record<
  (typeof CATEGORY_ORDER)[number]["accent"],
  string
> = {
  feature: "bg-indigo-500",
  fix: "bg-emerald-500",
  breaking: "bg-red-500",
  perf: "bg-amber-500",
  dx: "bg-violet-500",
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

  const mobileJumpNav = CATEGORY_ORDER.filter(
    (c) => changelog.categories[c.key].length > 0,
  );

  return (
    <div className="relative">
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute right-0 top-0 h-[600px] w-[600px] rounded-full bg-indigo-600/5 blur-[120px]" />
        <div className="absolute bottom-0 left-0 h-[400px] w-[400px] rounded-full bg-purple-600/5 blur-[100px]" />
      </div>
      <div className="relative z-10">
        <motion.header
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mx-auto max-w-6xl px-4 py-6 lg:px-6 lg:py-10"
        >
          <ChangelogHeader owner={owner} repo={repo} from={from} to={to} />
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="mt-6 text-sm leading-relaxed text-muted sm:text-base lg:text-lg"
          >
            {changelog.summary}
          </motion.p>
          <div
            className="mt-4 flex w-full gap-2.5 rounded-lg border border-amber-400/30 bg-amber-400/15 p-3 text-amber-200 sm:gap-3 sm:p-4"
            role="note"
            aria-label="Release highlight"
          >
            <span className="shrink-0 text-base leading-none" aria-hidden>
              ⭐
            </span>
            <div className="min-w-0 flex-1 space-y-1">
              <p className="text-xs font-semibold text-amber-100 sm:text-sm">
                {changelog.highlight.title}
              </p>
              <p className="text-xs leading-relaxed text-amber-200/95 sm:text-sm">
                {changelog.highlight.description}
              </p>
            </div>
          </div>
        </motion.header>

        <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-4 lg:flex-row lg:gap-10 lg:px-6 lg:pb-20">
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
            className="min-w-0 w-full flex-1 space-y-10 pb-20 lg:pb-0"
          >
            <div className="lg:hidden">
              <div className="mb-6 grid grid-cols-3 gap-px overflow-hidden rounded-lg bg-white/10">
                {[
                  {
                    label: "Commits",
                    value: changelog.stats.commits,
                  },
                  {
                    label: "Contributors",
                    value: changelog.stats.contributors,
                  },
                  {
                    label: "Files",
                    value: changelog.stats.filesChanged,
                  },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    className="bg-[#0A0F1E] px-3 py-3 text-center"
                  >
                    <div className="text-lg font-bold text-white">
                      {value.toLocaleString()}
                    </div>
                    <div className="text-[10px] uppercase tracking-wide text-slate-500">
                      {label}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mb-6 flex gap-2 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {mobileJumpNav.map(({ key, label, accent }) => {
                  const id = CHANGELOG_SECTION_ID[key];
                  const count = changelog.categories[key].length;
                  return (
                    <a
                      key={key}
                      href={`#${id}`}
                      onClick={(e) => {
                        e.preventDefault();
                        document.getElementById(id)?.scrollIntoView({
                          behavior: "smooth",
                          block: "start",
                        });
                      }}
                      className="flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300"
                    >
                      <span
                        className={`h-1.5 w-1.5 shrink-0 rounded-full ${mobileNavDot[accent]}`}
                        aria-hidden
                      />
                      {label}
                      <span className="text-slate-500">{count}</span>
                    </a>
                  );
                })}
              </div>
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
        <ShareMobileDock sharePath={sharePath} />
      </div>
    </div>
  );
}

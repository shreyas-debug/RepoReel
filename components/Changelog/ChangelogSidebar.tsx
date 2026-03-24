"use client";

import { useMemo } from "react";
import type { ChangelogCategories } from "@/lib/types";
import {
  CATEGORY_ORDER,
  CHANGELOG_SECTION_ID,
} from "@/lib/changelog-category-config";
import { StatsSidebar } from "@/components/Changelog/StatsBar";
import { ShareButtons } from "@/components/Changelog/ShareButtons";
import { useActiveSection } from "@/hooks/useActiveSection";

const dotClass: Record<
  (typeof CATEGORY_ORDER)[number]["accent"],
  string
> = {
  feature: "bg-indigo-500",
  fix: "bg-emerald-500",
  breaking: "bg-red-500",
  perf: "bg-amber-500",
  dx: "bg-violet-500",
};

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

export function ChangelogSidebar({
  categories,
  commits,
  contributors,
  filesChanged,
  sharePath,
}: {
  categories: ChangelogCategories;
  commits: number;
  contributors: number;
  filesChanged: number;
  sharePath: string;
}) {
  const visible = useMemo(
    () => CATEGORY_ORDER.filter((c) => categories[c.key].length > 0),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- lengths fully determine visible set
    [
      categories.features.length,
      categories.bugFixes.length,
      categories.breakingChanges.length,
      categories.performance.length,
      categories.devExperience.length,
    ],
  );

  const sectionIds = useMemo(
    () => visible.map(({ key }) => CHANGELOG_SECTION_ID[key]),
    [visible],
  );

  const activeId = useActiveSection(sectionIds);

  if (visible.length === 0) return null;

  return (
    <aside className="hidden w-56 shrink-0 self-start lg:block lg:sticky lg:top-6 lg:h-fit lg:max-h-[calc(100vh-48px)] lg:overflow-y-auto">
      <div>
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted">
          Stats
        </p>
        <StatsSidebar
          commits={commits}
          contributors={contributors}
          filesChanged={filesChanged}
        />
      </div>

      <div
        className="my-4 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"
        aria-hidden
      />

      <nav aria-label="Jump to changelog category">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted">
          Jump to
        </p>
        <ul className="space-y-1">
          {visible.map(({ key, label, accent }) => {
            const id = CHANGELOG_SECTION_ID[key];
            const count = categories[key].length;
            const isActive = activeId === id;
            return (
              <li key={key}>
                <a
                  href={`#${id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection(id);
                  }}
                  className={`flex items-center gap-2 rounded-lg px-2 py-2 text-sm transition ${
                    isActive
                      ? "font-medium text-white"
                      : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  <span
                    className={`h-2 w-2 shrink-0 rounded-full ${dotClass[accent]}`}
                    aria-hidden
                  />
                  <span className="min-w-0 flex-1 truncate">{label}</span>
                  <span
                    className={`shrink-0 tabular-nums text-xs font-semibold ${
                      isActive ? "text-slate-300" : "text-slate-600"
                    }`}
                  >
                    {count}
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
      </nav>

      <div
        className="my-4 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"
        aria-hidden
      />

      <ShareButtons sharePath={sharePath} />
    </aside>
  );
}

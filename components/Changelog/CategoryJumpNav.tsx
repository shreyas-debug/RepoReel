"use client";

import type { ChangelogCategories } from "@/lib/types";
import {
  CATEGORY_ORDER,
  CHANGELOG_SECTION_ID,
} from "@/lib/changelog-category-config";

const pillStyles: Record<
  (typeof CATEGORY_ORDER)[number]["accent"],
  string
> = {
  feature:
    "border border-indigo-500 bg-indigo-500/20 text-indigo-200 hover:bg-indigo-500/30",
  fix: "border border-emerald-500 bg-emerald-500/20 text-emerald-200 hover:bg-emerald-500/30",
  breaking:
    "border border-red-500 bg-red-500/20 text-red-200 hover:bg-red-500/30",
  perf: "border border-amber-500 bg-amber-500/20 text-amber-200 hover:bg-amber-500/30",
  dx: "border border-violet-500 bg-violet-500/20 text-violet-200 hover:bg-violet-500/30",
};

const countBadgeStyles: Record<
  (typeof CATEGORY_ORDER)[number]["accent"],
  string
> = {
  feature: "border border-indigo-400/50 bg-indigo-950/50 text-indigo-100",
  fix: "border border-emerald-400/50 bg-emerald-950/50 text-emerald-100",
  breaking: "border border-red-400/50 bg-red-950/50 text-red-100",
  perf: "border border-amber-400/50 bg-amber-950/50 text-amber-100",
  dx: "border border-violet-400/50 bg-violet-950/50 text-violet-100",
};

export function CategoryJumpNav({
  categories,
}: {
  categories: ChangelogCategories;
}) {
  const visible = CATEGORY_ORDER.filter(
    (c) => categories[c.key].length > 0,
  );

  if (visible.length === 0) return null;

  return (
    <nav
      className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-3 sm:px-4 sm:py-4"
      aria-label="Jump to changelog category"
    >
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted">
        Jump to
      </p>
      <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] sm:flex-wrap sm:overflow-visible [&::-webkit-scrollbar]:hidden">
        {visible.map(({ key, label, accent }) => {
          const count = categories[key].length;
          const sid = CHANGELOG_SECTION_ID[key];
          return (
            <a
              key={key}
              href={`#${sid}`}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(sid)?.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                });
              }}
              className={`inline-flex shrink-0 items-center gap-2 rounded-full py-2 pl-3 pr-2 text-sm font-medium transition ${pillStyles[accent]}`}
            >
              <span>{label}</span>
              <span
                className={`min-w-[1.5rem] rounded-full px-2 py-0.5 text-center text-[11px] font-bold tabular-nums ${countBadgeStyles[accent]}`}
              >
                {count}
              </span>
            </a>
          );
        })}
      </div>
    </nav>
  );
}

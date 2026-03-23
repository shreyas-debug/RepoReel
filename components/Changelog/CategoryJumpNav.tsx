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
    "border-cat-feature bg-cat-feature/15 text-cat-feature hover:bg-cat-feature/25",
  fix: "border-cat-fix bg-cat-fix/15 text-cat-fix hover:bg-cat-fix/25",
  breaking:
    "border-cat-breaking bg-cat-breaking/15 text-cat-breaking hover:bg-cat-breaking/25",
  perf: "border-cat-perf bg-cat-perf/15 text-cat-perf hover:bg-cat-perf/25",
  dx: "border-cat-dx bg-cat-dx/15 text-cat-dx hover:bg-cat-dx/25",
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
      className="sticky top-0 z-30 -mx-3 border-b border-white/10 bg-navy/95 px-3 py-3 backdrop-blur-md sm:static sm:mx-0 sm:rounded-2xl sm:border sm:border-white/10 sm:px-4 sm:py-4"
      aria-label="Jump to changelog category"
    >
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted">
        Jump to
      </p>
      <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] sm:flex-wrap sm:overflow-visible [&::-webkit-scrollbar]:hidden">
        {visible.map(({ key, label, accent }) => (
          <a
            key={key}
            href={`#${CHANGELOG_SECTION_ID[key]}`}
            className={`shrink-0 rounded-full border px-3 py-2 text-sm font-medium transition ${pillStyles[accent]}`}
          >
            {label}
          </a>
        ))}
      </div>
    </nav>
  );
}

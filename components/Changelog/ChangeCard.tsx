"use client";

import { motion } from "framer-motion";
import type { ChangelogItem } from "@/lib/types";
import { Badge } from "@/components/UI/Badge";

const variantMap = {
  feature: "feature",
  fix: "fix",
  breaking: "breaking",
  perf: "perf",
  dx: "dx",
} as const;

type Variant = keyof typeof variantMap;

/** Category-specific surface + top accent */
const cardSurface: Record<Variant, string> = {
  feature:
    "border border-white/10 border-t-[3px] border-t-indigo-500 bg-white/[0.04]",
  fix:
    "border border-white/10 border-t-[3px] border-t-emerald-500 bg-white/[0.04]",
  breaking:
    "border border-red-800/30 border-t-[3px] border-t-red-500 bg-red-950/20",
  perf:
    "border border-amber-800/30 border-t-[3px] border-t-amber-500 bg-amber-950/20",
  dx: "border border-white/10 border-t-[3px] border-t-violet-500 bg-white/[0.04]",
};

/** Stronger left edge (category color) */
const leftAccent: Record<Variant, string> = {
  feature: "border-l-[3px] border-l-indigo-500",
  fix: "border-l-[3px] border-l-emerald-500",
  breaking: "border-l-[3px] border-l-red-500",
  perf: "border-l-[3px] border-l-amber-500",
  dx: "border-l-[3px] border-l-violet-500",
};

export function ChangeCard({
  item,
  owner,
  repo,
  variant,
  index,
}: {
  item: ChangelogItem;
  owner: string;
  repo: string;
  variant: Variant;
  index: number;
}) {
  const prUrl =
    item.prNumber != null
      ? `https://github.com/${owner}/${repo}/pull/${item.prNumber}`
      : null;

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.04 }}
      className={`group w-full max-w-full rounded-xl p-3 pl-3 transition-colors duration-150 hover:border-white/20 hover:bg-white/5 sm:p-4 lg:p-5 lg:pl-4 ${cardSurface[variant]} ${leftAccent[variant]}`}
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <h3 className="min-w-0 flex-1 text-sm font-semibold leading-snug text-foreground sm:text-base lg:text-lg">
          {item.title}
        </h3>
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-1 sm:gap-2 sm:pt-0.5">
          <Badge variant={variantMap[variant]} />
          {prUrl ? (
            <a
              href={prUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-xs font-medium text-indigo-brand transition-colors hover:text-indigo-400 hover:underline"
            >
              #{item.prNumber}
            </a>
          ) : null}
        </div>
      </div>
      <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted">
        {item.description}
      </p>
    </motion.article>
  );
}

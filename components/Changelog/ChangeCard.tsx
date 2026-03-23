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

const border: Record<Variant, string> = {
  feature: "border-l-cat-feature",
  fix: "border-l-cat-fix",
  breaking: "border-l-cat-breaking",
  perf: "border-l-cat-perf",
  dx: "border-l-cat-dx",
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
      className={`w-full max-w-full rounded-xl border border-white/10 border-l-4 ${border[variant]} bg-white/[0.03] p-3 sm:p-4`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={variantMap[variant]} />
        {prUrl ? (
          <a
            href={prUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-xs text-indigo-brand hover:underline"
          >
            #{item.prNumber}
          </a>
        ) : null}
      </div>
      <h3 className="mt-2 font-medium text-foreground">{item.title}</h3>
      <p className="mt-1 line-clamp-3 text-sm leading-relaxed text-muted">
        {item.description}
      </p>
    </motion.article>
  );
}

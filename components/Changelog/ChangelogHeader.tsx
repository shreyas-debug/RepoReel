"use client";

import { motion } from "framer-motion";

export function ChangelogHeader({
  owner,
  repo,
  from,
  to,
}: {
  owner: string;
  repo: string;
  from: string;
  to: string;
}) {
  return (
    <motion.header
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="space-y-3 sm:space-y-4"
    >
      <p className="font-mono text-xs text-muted sm:text-sm">
        github.com/{owner}/{repo}
      </p>
      <div className="flex flex-col gap-3 sm:gap-4">
        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
          <span className="text-muted">{owner}/</span>
          {repo}
        </h1>
        <div className="inline-flex w-full max-w-full flex-wrap items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-2 font-mono text-xs text-foreground sm:w-fit sm:px-4 sm:py-2 sm:text-sm">
          <span className="truncate">{from}</span>
          <span className="shrink-0 text-indigo-brand">→</span>
          <span className="truncate">{to}</span>
        </div>
      </div>
    </motion.header>
  );
}

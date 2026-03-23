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
      className="space-y-4"
    >
      <p className="font-mono text-sm text-muted">
        github.com/{owner}/{repo}
      </p>
      <h1 className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
        {repo}
      </h1>
      <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 font-mono text-sm text-foreground">
        <span>{from}</span>
        <span className="text-indigo-brand">→</span>
        <span>{to}</span>
      </div>
    </motion.header>
  );
}

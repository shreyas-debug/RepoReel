"use client";

import { motion } from "framer-motion";

export function HighlightCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.12 }}
      className="relative overflow-hidden rounded-2xl border border-amber-brand/30 bg-gradient-to-br from-amber-brand/20 via-amber-900/20 to-navy-deep p-8 shadow-lg shadow-amber-900/20"
    >
      <p className="mb-3 flex items-center gap-2 font-display text-sm font-semibold uppercase tracking-wider text-amber-brand">
        <span aria-hidden>⭐</span> Highlight
      </p>
      <blockquote className="font-display text-2xl font-semibold leading-snug text-foreground sm:text-3xl">
        {title}
      </blockquote>
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-foreground/85">
        {description}
      </p>
    </motion.section>
  );
}

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
      className="relative overflow-hidden rounded-2xl border border-amber-brand/30 bg-gradient-to-br from-amber-brand/20 via-amber-900/20 to-navy-deep p-5 shadow-lg shadow-amber-900/20 sm:p-8"
    >
      <p className="mb-2 flex items-center gap-2 font-display text-xs font-semibold uppercase tracking-wider text-amber-brand sm:mb-3 sm:text-sm">
        <span aria-hidden>⭐</span> Highlight
      </p>
      <blockquote className="font-display text-xl font-semibold leading-snug text-foreground sm:text-2xl md:text-3xl">
        {title}
      </blockquote>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-foreground/85 sm:mt-4 sm:text-base">
        {description}
      </p>
    </motion.section>
  );
}

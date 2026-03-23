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
      className="relative -mx-1 overflow-hidden rounded-2xl border border-amber-500/25 shadow-[0_24px_80px_-24px_rgba(245,158,11,0.35)] sm:-mx-0"
    >
      {/* Full-bleed amber gradient */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-amber-500/45 via-amber-600/35 to-amber-950/80"
        aria-hidden
      />
      <div
        className="absolute inset-0 bg-gradient-to-t from-navy/90 via-transparent to-amber-900/20"
        aria-hidden
      />
      <div className="relative px-5 pb-8 pt-10 sm:px-10 sm:pb-10 sm:pt-12">
        <span
          className="pointer-events-none absolute left-3 top-2 font-display text-7xl leading-none text-amber-200/25 sm:left-6 sm:top-4 sm:text-8xl"
          aria-hidden
        >
          &ldquo;
        </span>
        <p className="mb-3 flex items-center gap-2 font-display text-xs font-semibold uppercase tracking-[0.2em] text-amber-100/95 sm:mb-4 sm:text-sm">
          <span aria-hidden>⭐</span> Highlight
        </p>
        <blockquote className="relative z-[1] max-w-3xl font-display text-2xl font-bold leading-[1.2] tracking-tight text-white sm:text-3xl md:text-4xl">
          {title}
        </blockquote>
        <p className="relative z-[1] mt-4 max-w-2xl text-base leading-relaxed text-amber-50/95 sm:mt-5 sm:text-lg">
          {description}
        </p>
      </div>
    </motion.section>
  );
}

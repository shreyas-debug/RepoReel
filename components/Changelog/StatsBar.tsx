"use client";

import { animate, useMotionValue, useMotionValueEvent } from "framer-motion";
import { useEffect, useState } from "react";

function Stat({
  label,
  value,
  delay,
  layout = "banner",
}: {
  label: string;
  value: number;
  delay: number;
  layout?: "banner" | "mobile";
}) {
  const mv = useMotionValue(0);
  const [display, setDisplay] = useState(0);

  useMotionValueEvent(mv, "change", (latest) => {
    setDisplay(Math.round(latest));
  });

  useEffect(() => {
    mv.set(0);
    const controls = animate(mv, value, {
      duration: 1.25,
      delay,
      ease: [0.22, 1, 0.36, 1],
    });
    return () => controls.stop();
  }, [value, delay, mv]);

  if (layout === "mobile") {
    return (
      <div className="flex flex-col items-center gap-1 px-1 py-2 text-center">
        <span className="text-[9px] font-semibold uppercase tracking-wider text-muted/90">
          {label}
        </span>
        <span className="font-display text-2xl font-bold tabular-nums text-foreground sm:text-3xl">
          {display.toLocaleString()}
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col items-center gap-2 py-5 sm:items-start sm:px-8 sm:py-0">
      <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted/90">
        {label}
      </span>
      <span className="font-display text-4xl font-bold tabular-nums text-foreground sm:text-5xl">
        {display.toLocaleString()}
      </span>
    </div>
  );
}

function StatSidebarRow({
  label,
  value,
  delay,
}: {
  label: string;
  value: number;
  delay: number;
}) {
  const mv = useMotionValue(0);
  const [display, setDisplay] = useState(0);

  useMotionValueEvent(mv, "change", (latest) => {
    setDisplay(Math.round(latest));
  });

  useEffect(() => {
    mv.set(0);
    const controls = animate(mv, value, {
      duration: 1.25,
      delay,
      ease: [0.22, 1, 0.36, 1],
    });
    return () => controls.stop();
  }, [value, delay, mv]);

  return (
    <div className="flex items-baseline justify-between gap-3 py-3 first:pt-0 last:pb-0">
      <span className="text-[11px] font-semibold uppercase tracking-wider text-muted">
        {label}
      </span>
      <span className="font-display text-2xl font-bold tabular-nums text-foreground">
        {display.toLocaleString()}
      </span>
    </div>
  );
}

/** Stacked stats for the desktop changelog sidebar */
export function StatsSidebar({
  commits,
  contributors,
  filesChanged,
}: {
  commits: number;
  contributors: number;
  filesChanged: number;
}) {
  return (
    <div className="flex flex-col divide-y divide-white/10 border-y border-white/10">
      <StatSidebarRow label="Commits" value={commits} delay={0} />
      <StatSidebarRow label="Contributors" value={contributors} delay={0.08} />
      <StatSidebarRow label="Files changed" value={filesChanged} delay={0.16} />
    </div>
  );
}

/** Three-column stats row for mobile (below lg) */
export function StatsBarMobile({
  commits,
  contributors,
  filesChanged,
}: {
  commits: number;
  contributors: number;
  filesChanged: number;
}) {
  return (
    <div className="grid grid-cols-3 divide-x divide-white/10 border-y border-white/15 py-4">
      <Stat label="Commits" value={commits} delay={0} layout="mobile" />
      <Stat label="Contributors" value={contributors} delay={0.08} layout="mobile" />
      <Stat label="Files changed" value={filesChanged} delay={0.16} layout="mobile" />
    </div>
  );
}

export function StatsBar({
  commits,
  contributors,
  filesChanged,
}: {
  commits: number;
  contributors: number;
  filesChanged: number;
}) {
  return (
    <div className="flex flex-col divide-y divide-white/15 border-y border-white/15 py-2 sm:flex-row sm:divide-x sm:divide-y-0 sm:py-10">
      <Stat label="Commits" value={commits} delay={0} />
      <Stat label="Contributors" value={contributors} delay={0.08} />
      <Stat label="Files changed" value={filesChanged} delay={0.16} />
    </div>
  );
}

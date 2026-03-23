"use client";

import { animate } from "framer-motion";
import { useEffect, useState } from "react";

function Stat({
  label,
  value,
  delay,
}: {
  label: string;
  value: number;
  delay: number;
}) {
  const [n, setN] = useState(0);

  useEffect(() => {
    const c = animate(0, value, {
      duration: 1.25,
      delay,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setN(Math.round(v)),
    });
    return () => c.stop();
  }, [value, delay]);

  return (
    <div className="flex flex-col items-center gap-1 border-b border-white/10 py-4 last:border-b-0 sm:items-start sm:border-b-0 sm:py-0">
      <span className="font-display text-3xl font-bold tabular-nums text-foreground sm:text-4xl">
        {n.toLocaleString()}
      </span>
      <span className="text-sm text-muted">{label}</span>
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
    <div className="grid grid-cols-1 gap-0 border-y border-white/10 py-2 sm:grid-cols-3 sm:gap-6 sm:py-8">
      <Stat label="Commits" value={commits} delay={0} />
      <Stat label="Contributors" value={contributors} delay={0.08} />
      <Stat label="Files changed" value={filesChanged} delay={0.16} />
    </div>
  );
}

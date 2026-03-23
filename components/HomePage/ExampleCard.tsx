"use client";

import { motion } from "framer-motion";

type Example = {
  title: string;
  subtitle: string;
  owner: string;
  repo: string;
  from: string;
  to: string;
  topBorderClass: string;
  accentRing: string;
  avatarUrl: string;
  subtitleClass: string;
};

const EXAMPLES: Example[] = [
  {
    title: "React",
    subtitle: "v18.2 → v18.3",
    owner: "facebook",
    repo: "react",
    from: "v18.2.0",
    to: "v18.3.0",
    topBorderClass: "border-t-2 border-t-blue-500",
    accentRing: "ring-blue-500/20 hover:ring-blue-500/40",
    avatarUrl: "https://avatars.githubusercontent.com/u/69631?s=80&v=4",
    subtitleClass: "text-indigo-400",
  },
  {
    title: "Next.js",
    subtitle: "v14 → v15",
    owner: "vercel",
    repo: "next.js",
    from: "v14.2.0",
    to: "v15.0.0",
    topBorderClass: "border-t-2 border-t-white/40",
    accentRing: "ring-white/15 hover:ring-white/35",
    avatarUrl: "https://avatars.githubusercontent.com/u/14985020?s=80&v=4",
    subtitleClass: "text-slate-300",
  },
  {
    title: "Tailwind CSS",
    subtitle: "v3 → v4",
    owner: "tailwindlabs",
    repo: "tailwindcss",
    from: "v3.4.0",
    to: "v4.0.0",
    topBorderClass: "border-t-2 border-t-cyan-500",
    accentRing: "ring-cyan-500/20 hover:ring-cyan-500/40",
    avatarUrl: "https://avatars.githubusercontent.com/u/67109815?s=80&v=4",
    subtitleClass: "text-cyan-400",
  },
];

export function ExampleCard({
  onPick,
}: {
  onPick: (e: Omit<
    Example,
    "title" | "subtitle" | "topBorderClass" | "accentRing" | "avatarUrl" | "subtitleClass"
  >) => void;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-[repeat(3,minmax(0,1fr))]">
      {EXAMPLES.map((ex, idx) => (
        <motion.button
          key={ex.title}
          type="button"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 + idx * 0.06 }}
          onClick={() =>
            onPick({
              owner: ex.owner,
              repo: ex.repo,
              from: ex.from,
              to: ex.to,
            })
          }
          className={`min-w-0 w-full rounded-xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-4 text-left shadow-lg shadow-black/20 ring-1 ring-white/5 transition-all duration-200 hover:-translate-y-1 hover:border-white/20 hover:from-white/[0.08] hover:to-white/[0.03] ${ex.topBorderClass} ${ex.accentRing}`}
        >
          <div className="flex min-w-0 items-start gap-3">
            <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-navy-deep">
              {/* eslint-disable-next-line @next/next/no-img-element -- external GitHub avatars; avoids next.config remotePatterns */}
              <img
                src={ex.avatarUrl}
                alt=""
                width={44}
                height={44}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </span>
            <div className="min-w-0 flex-1 overflow-hidden">
              <p className="truncate font-display text-base font-semibold text-foreground">
                {ex.title}
              </p>
              <p
                className="mt-0.5 truncate font-mono text-xs text-muted"
                title={`${ex.owner}/${ex.repo}`}
              >
                {ex.owner}/{ex.repo}
              </p>
              <p className={`mt-1 text-sm ${ex.subtitleClass}`}>{ex.subtitle}</p>
            </div>
          </div>
        </motion.button>
      ))}
    </div>
  );
}

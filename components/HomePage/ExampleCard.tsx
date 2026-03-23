"use client";

import { motion } from "framer-motion";

type Example = {
  title: string;
  subtitle: string;
  owner: string;
  repo: string;
  from: string;
  to: string;
};

const EXAMPLES: Example[] = [
  {
    title: "React",
    subtitle: "v18.2 → v18.3",
    owner: "facebook",
    repo: "react",
    from: "v18.2.0",
    to: "v18.3.0",
  },
  {
    title: "Next.js",
    subtitle: "v14 → v15",
    owner: "vercel",
    repo: "next.js",
    from: "v14.2.0",
    to: "v15.0.0",
  },
  {
    title: "Tailwind CSS",
    subtitle: "v3 → v4",
    owner: "tailwindlabs",
    repo: "tailwindcss",
    from: "v3.4.0",
    to: "v4.0.0",
  },
];

export function ExampleCard({
  onPick,
}: {
  onPick: (e: Omit<Example, "title" | "subtitle">) => void;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
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
          className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-left transition hover:border-indigo-brand/40 hover:bg-white/[0.06]"
        >
          <p className="font-display text-base font-semibold text-foreground">
            {ex.title}
          </p>
          <p className="mt-1 text-sm text-muted">{ex.subtitle}</p>
        </motion.button>
      ))}
    </div>
  );
}

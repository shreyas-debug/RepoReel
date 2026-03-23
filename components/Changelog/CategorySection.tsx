"use client";

import { motion } from "framer-motion";
import type { ChangelogItem } from "@/lib/types";
import { ChangeCard } from "@/components/Changelog/ChangeCard";

type Variant = "feature" | "fix" | "breaking" | "perf" | "dx";

const config: {
  key: keyof import("@/lib/types").ChangelogCategories;
  title: string;
  variant: Variant;
}[] = [
  { key: "features", title: "Features", variant: "feature" },
  { key: "bugFixes", title: "Bug fixes", variant: "fix" },
  { key: "breakingChanges", title: "Breaking changes", variant: "breaking" },
  { key: "performance", title: "Performance", variant: "perf" },
  { key: "devExperience", title: "Developer experience", variant: "dx" },
];

export function CategorySection({
  categories,
  owner,
  repo,
}: {
  categories: import("@/lib/types").ChangelogCategories;
  owner: string;
  repo: string;
}) {
  return (
    <div className="w-full space-y-8 sm:space-y-12">
      {config.map(({ key, title, variant }) => {
        const items: ChangelogItem[] = categories[key];
        if (!items.length) return null;
        return (
          <motion.section
            key={key}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.4 }}
            className="w-full"
          >
            <h2 className="font-display text-xl font-semibold text-foreground sm:text-2xl">
              {title}
            </h2>
            <div className="mt-3 grid w-full gap-2 sm:mt-4 sm:gap-3">
              {items.map((item, i) => (
                <ChangeCard
                  key={`${key}-${item.title}-${i}`}
                  item={item}
                  owner={owner}
                  repo={repo}
                  variant={variant}
                  index={i}
                />
              ))}
            </div>
          </motion.section>
        );
      })}
    </div>
  );
}

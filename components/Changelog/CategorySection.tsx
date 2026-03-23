"use client";

import { motion } from "framer-motion";
import type { ChangelogItem } from "@/lib/types";
import {
  CATEGORY_ORDER,
  CHANGELOG_SECTION_ID,
} from "@/lib/changelog-category-config";
import { ChangeCard } from "@/components/Changelog/ChangeCard";

type Variant = "feature" | "fix" | "breaking" | "perf" | "dx";

const h2Accent: Record<Variant, string> = {
  feature: "border-l-cat-feature text-cat-feature",
  fix: "border-l-cat-fix text-cat-fix",
  breaking: "border-l-cat-breaking text-cat-breaking",
  perf: "border-l-cat-perf text-cat-perf",
  dx: "border-l-cat-dx text-cat-dx",
};

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
      {CATEGORY_ORDER.map(({ key, label, accent }) => {
        const items: ChangelogItem[] = categories[key];
        if (!items.length) return null;
        const variant = accent;
        return (
          <motion.section
            key={key}
            id={CHANGELOG_SECTION_ID[key]}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.4 }}
            className="scroll-mt-28 w-full sm:scroll-mt-32"
          >
            <h2
              className={`font-display text-xl font-semibold text-foreground sm:text-2xl ${h2Accent[variant]} border-l-4 pl-3`}
            >
              {label}
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

"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { ChangelogCategories, ChangelogItem } from "@/lib/types";
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

const INITIAL_VISIBLE = 5;

function CategorySubsection({
  sectionKey,
  label,
  items,
  owner,
  repo,
  variant,
  className,
}: {
  sectionKey: keyof ChangelogCategories;
  label: string;
  items: ChangelogItem[];
  owner: string;
  repo: string;
  variant: Variant;
  className?: string;
}) {
  const [expanded, setExpanded] = useState(false);
  if (!items.length) return null;

  const head = items.slice(0, INITIAL_VISIBLE);
  const tail = items.slice(INITIAL_VISIBLE);
  const moreCount = tail.length;
  const useTwoCol = items.length >= 3;
  const cardsLayoutClass = useTwoCol
    ? "grid grid-cols-2 gap-3 items-start"
    : "flex flex-col gap-3";

  return (
    <motion.section
      id={CHANGELOG_SECTION_ID[sectionKey]}
      layout
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4 }}
      className={`scroll-mt-24 w-full sm:scroll-mt-28 ${className ?? ""}`}
    >
      <div className="relative">
        <span
          className="pointer-events-none absolute -top-2 right-0 select-none text-6xl font-black text-white/[0.03]"
          aria-hidden
        >
          {items.length}
        </span>
        <h2
          className={`relative z-10 font-display text-xl font-semibold text-foreground sm:text-2xl ${h2Accent[variant]} border-l-4 pl-3`}
        >
          {label}
        </h2>
      </div>
      <div className={`mt-3 w-full sm:mt-4 ${cardsLayoutClass}`}>
        {head.map((item, i) => (
          <motion.div key={`${sectionKey}-${i}`} layout transition={{ duration: 0.2 }}>
            <ChangeCard
              item={item}
              owner={owner}
              repo={repo}
              variant={variant}
              index={i}
            />
          </motion.div>
        ))}
        <AnimatePresence initial={false}>
          {expanded &&
            tail.map((item, j) => (
              <motion.div
                key={`${sectionKey}-${INITIAL_VISIBLE + j}`}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              >
                <ChangeCard
                  item={item}
                  owner={owner}
                  repo={repo}
                  variant={variant}
                  index={INITIAL_VISIBLE + j}
                />
              </motion.div>
            ))}
        </AnimatePresence>
        {moreCount > 0 && (
          <motion.button
            type="button"
            layout
            onClick={() => setExpanded((e) => !e)}
            className={`text-left text-sm font-medium text-muted underline-offset-4 transition hover:text-foreground hover:underline ${
              useTwoCol ? "col-span-2 mt-1 w-full" : "mt-3 w-full"
            }`}
          >
            {expanded ? "Show less ↑" : `Show ${moreCount} more ↓`}
          </motion.button>
        )}
      </div>
    </motion.section>
  );
}

function metaFor(key: keyof ChangelogCategories) {
  return CATEGORY_ORDER.find((c) => c.key === key)!;
}

export function CategorySection({
  categories,
  owner,
  repo,
}: {
  categories: ChangelogCategories;
  owner: string;
  repo: string;
}) {
  const f = metaFor("features");
  const b = metaFor("bugFixes");
  const br = metaFor("breakingChanges");
  const p = metaFor("performance");
  const d = metaFor("devExperience");

  return (
    <div className="flex w-full flex-col gap-10 sm:gap-12">
      <CategorySubsection
        sectionKey="features"
        label={f.label}
        items={categories.features}
        owner={owner}
        repo={repo}
        variant="feature"
      />
      <CategorySubsection
        sectionKey="bugFixes"
        label={b.label}
        items={categories.bugFixes}
        owner={owner}
        repo={repo}
        variant="fix"
      />
      <CategorySubsection
        sectionKey="breakingChanges"
        label={br.label}
        items={categories.breakingChanges}
        owner={owner}
        repo={repo}
        variant="breaking"
      />
      <CategorySubsection
        sectionKey="performance"
        label={p.label}
        items={categories.performance}
        owner={owner}
        repo={repo}
        variant="perf"
      />
      {categories.devExperience.length > 0 ? (
        <CategorySubsection
          sectionKey="devExperience"
          label={d.label}
          items={categories.devExperience}
          owner={owner}
          repo={repo}
          variant="dx"
        />
      ) : null}
    </div>
  );
}

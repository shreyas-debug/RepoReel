import type { ChangelogCategories } from "@/lib/types";

/** DOM ids for anchor links (`#changelog-features`, etc.) */
export const CHANGELOG_SECTION_ID: Record<keyof ChangelogCategories, string> = {
  features: "changelog-features",
  bugFixes: "changelog-bug-fixes",
  breakingChanges: "changelog-breaking",
  performance: "changelog-performance",
  devExperience: "changelog-dev-experience",
};

export const CATEGORY_ORDER: {
  key: keyof ChangelogCategories;
  label: string;
  /** Tailwind border/text/bg tokens (matches brief hex in tailwind.config) */
  accent: "feature" | "fix" | "breaking" | "perf" | "dx";
}[] = [
  { key: "features", label: "Features", accent: "feature" },
  { key: "bugFixes", label: "Bug fixes", accent: "fix" },
  { key: "breakingChanges", label: "Breaking", accent: "breaking" },
  { key: "performance", label: "Performance", accent: "perf" },
  { key: "devExperience", label: "Dev experience", accent: "dx" },
];

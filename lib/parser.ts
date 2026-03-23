export interface ParsedCategories {
  features: string[];
  bugFixes: string[];
  breakingChanges: string[];
  performance: string[];
  devExperience: string[];
  other: string[];
}

/** True when the line is only a semver-like version (e.g. 18.3.0, v2.0.0-rc.1). */
function isVersionOnlyLine(msg: string): boolean {
  const t = msg.trim();
  if (!t) return false;
  return /^v?\d+\.\d+(\.\d+)?(-[\w.-]+)?(\+[\w.-]+)?$/i.test(t);
}

/**
 * Drops noisy commits before categorization. Also removes revert lines here —
 * use {@link extractRevertCommits} on the same input and merge those into
 * `breakingChanges` in the caller.
 */
export function filterNoise(commits: string[]): string[] {
  const out: string[] = [];
  for (const msg of commits) {
    const clean = msg.toLowerCase().trim();
    if (clean.startsWith("bump version")) continue;
    if (clean.startsWith("backport")) continue;
    if (clean.startsWith("merge")) continue;
    if (clean.startsWith("revert")) continue;
    if (isVersionOnlyLine(msg)) continue;
    out.push(msg);
  }
  return out;
}

/** Commit first lines that are revert commits (for breakingChanges). */
export function extractRevertCommits(commits: string[]): string[] {
  return commits.filter((msg) =>
    msg.toLowerCase().trim().startsWith("revert"),
  );
}

export function categorizeCommits(commits: string[]): ParsedCategories {
  const categories: ParsedCategories = {
    features: [],
    bugFixes: [],
    breakingChanges: [],
    performance: [],
    devExperience: [],
    other: [],
  };

  for (const msg of commits) {
    const clean = msg.toLowerCase().trim();

    if (clean.includes("breaking") || clean.includes("!:")) {
      categories.breakingChanges.push(msg);
    } else if (
      clean.startsWith("feat") ||
      clean.startsWith("feature") ||
      clean.startsWith("add ") ||
      clean.startsWith("new ")
    ) {
      categories.features.push(msg);
    } else if (
      clean.startsWith("fix") ||
      clean.startsWith("bug") ||
      clean.startsWith("patch") ||
      clean.startsWith("hotfix")
    ) {
      categories.bugFixes.push(msg);
    } else if (
      clean.startsWith("perf") ||
      clean.startsWith("optim") ||
      clean.includes("performance") ||
      clean.includes("speed")
    ) {
      categories.performance.push(msg);
    } else if (
      clean.startsWith("chore") ||
      clean.startsWith("ci") ||
      clean.startsWith("build") ||
      clean.startsWith("dx") ||
      clean.startsWith("refactor") ||
      clean.startsWith("test") ||
      clean.startsWith("docs") ||
      clean.startsWith("style")
    ) {
      categories.devExperience.push(msg);
    } else {
      categories.other.push(msg);
    }
  }

  return categories;
}

export function buildMiniSummary(
  categories: ParsedCategories,
  stats: {
    commits: number;
    contributors: number;
    filesChanged: number;
  },
): string {
  const lines: string[] = [];

  if (categories.features.length > 0) {
    lines.push(
      `FEATURES (${categories.features.length} total):\n${categories.features.slice(0, 3).join("\n")}`,
    );
  }
  if (categories.bugFixes.length > 0) {
    lines.push(
      `BUG FIXES (${categories.bugFixes.length} total):\n${categories.bugFixes.slice(0, 3).join("\n")}`,
    );
  }
  if (categories.breakingChanges.length > 0) {
    lines.push(
      `BREAKING CHANGES (${categories.breakingChanges.length} total):\n${categories.breakingChanges.slice(0, 3).join("\n")}`,
    );
  }
  if (categories.performance.length > 0) {
    lines.push(
      `PERFORMANCE (${categories.performance.length} total):\n${categories.performance.slice(0, 3).join("\n")}`,
    );
  }
  if (categories.devExperience.length > 0) {
    lines.push(
      `DEV EXPERIENCE (${categories.devExperience.length} total):\n${categories.devExperience.slice(0, 3).join("\n")}`,
    );
  }

  lines.push(
    `\nStats: ${stats.commits} commits, ${stats.contributors} contributors, ${stats.filesChanged} files changed`,
  );

  return lines.join("\n\n");
}

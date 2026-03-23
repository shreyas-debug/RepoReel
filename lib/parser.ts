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

const CONVENTIONAL_PREFIX =
  /^(feat|fix|chore|docs|style|refactor|perf|test|build|ci)(\([^)]*\))?!?:\s*/i;

/** Strip PR refs, tags, backticks, and leading conventional commit prefixes for AI prompts. */
export function cleanForAI(msg: string): string {
  const s = msg
    .replace(/\(#\d+\)/g, "")
    .replace(/\[.*?\]/g, "")
    .replace(/`/g, "")
    .replace(CONVENTIONAL_PREFIX, "")
    .replace(/\s+/g, " ")
    .trim();
  return s;
}

function firstRepresentativeClean(messages: string[]): string {
  const first = messages[0];
  if (!first) return "none";
  const cleaned = cleanForAI(first);
  return cleaned || "none";
}

function truncateToMaxWords(text: string, maxWords: number): string {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) return text.trim();
  return `${words.slice(0, maxWords).join(" ")}…`;
}

const MAX_WORDS_MINI_SUMMARY = 200;

/**
 * Compact prompt for Gemini: aggregate stats, per-category counts, and one
 * cleaned representative commit per category only (no full lists).
 */
export function buildMiniSummary(
  categories: ParsedCategories,
  stats: {
    commits: number;
    contributors: number;
    filesChanged: number;
  },
): string {
  const body = `
Release stats:
- ${stats.commits} total commits by ${stats.contributors} contributors
- ${stats.filesChanged} files changed
- ${categories.features.length} new features
- ${categories.bugFixes.length} bug fixes
- ${categories.breakingChanges.length} breaking changes
- ${categories.performance.length} performance improvements
- ${categories.devExperience.length} developer experience updates

Representative commits (first per category, cleaned):
- Feature: ${firstRepresentativeClean(categories.features)}
- Fix: ${firstRepresentativeClean(categories.bugFixes)}
- Breaking: ${firstRepresentativeClean(categories.breakingChanges)}
- Performance: ${firstRepresentativeClean(categories.performance)}
- Dev experience: ${firstRepresentativeClean(categories.devExperience)}
  `.trim();

  return truncateToMaxWords(body, MAX_WORDS_MINI_SUMMARY);
}

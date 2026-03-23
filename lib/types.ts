/** GitHub commit normalized for changelog generation */
export interface GitHubCommit {
  sha: string;
  message: string;
  authorLogin: string | null;
  authorName: string | null;
  htmlUrl: string;
  committedDate: string;
}

/** Merged PR metadata used by Gemini */
export interface GitHubPR {
  number: number;
  title: string;
  mergedAt: string | null;
  htmlUrl: string;
}

export interface ChangelogItem {
  title: string;
  description: string;
  prNumber?: number | null;
}

export interface ChangelogCategories {
  features: ChangelogItem[];
  bugFixes: ChangelogItem[];
  breakingChanges: ChangelogItem[];
  performance: ChangelogItem[];
  devExperience: ChangelogItem[];
}

export interface ChangelogHighlight {
  title: string;
  description: string;
}

/** Structured changelog returned by Gemini and stored in KV */
export interface ChangelogResponse {
  summary: string;
  stats: {
    commits: number;
    contributors: number;
    filesChanged: number;
  };
  highlight: ChangelogHighlight;
  categories: ChangelogCategories;
}

export interface GenerateRequest {
  owner: string;
  repo: string;
  from: string;
  to: string;
}

/** Result of comparing two refs (tags, branches, or SHAs) */
export interface CompareVersionsResult {
  commits: GitHubCommit[];
  stats: {
    totalCommits: number;
    filesChanged: number;
    additions: number;
    deletions: number;
  };
  contributorLogins: string[];
}

/** One day in the contribution heatmap (null dateKey = alignment padding). */
export interface HeatmapCell {
  dateKey: string | null;
  count: number;
}

/** One week column: Mon–Sun cells; month label only on first column of a new month (GitHub-style). */
export interface HeatmapWeekRow {
  weekLabel: string;
  /** Short month ("Jan", "Mar") for top axis; null when same month as previous column. */
  monthLabel?: string | null;
  days: HeatmapCell[];
}

/** Cached payload for shareable URLs */
export interface CachedChangelogPayload {
  changelog: ChangelogResponse;
  /** Daily commit counts in a Mon–Sun grid; omitted in older cached payloads. */
  commitHeatmap?: HeatmapWeekRow[];
  owner: string;
  repo: string;
  from: string;
  to: string;
  generatedAt: string;
}

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

/** Cached payload for shareable URLs */
export interface CachedChangelogPayload {
  changelog: ChangelogResponse;
  owner: string;
  repo: string;
  from: string;
  to: string;
  generatedAt: string;
}

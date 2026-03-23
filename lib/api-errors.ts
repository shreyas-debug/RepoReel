export const ApiErrorCode = {
  GITHUB_RATE_LIMIT: "GITHUB_RATE_LIMIT",
  REPO_NOT_FOUND: "REPO_NOT_FOUND",
  NO_COMMITS: "NO_COMMITS",
  GEMINI_FAILED: "GEMINI_FAILED",
} as const;

export type ApiErrorCodeType = (typeof ApiErrorCode)[keyof typeof ApiErrorCode];

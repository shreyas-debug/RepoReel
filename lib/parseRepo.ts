const GITHUB_URL =
  /^https?:\/\/github\.com\/([^/]+)\/([^/]+?)(?:\/|\.git)?\/?$/i;

/** Accepts full GitHub URL or `owner/repo`. */
export function parseRepoInput(input: string): { owner: string; repo: string } | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const urlMatch = trimmed.match(GITHUB_URL);
  if (urlMatch) {
    return { owner: urlMatch[1], repo: urlMatch[2] };
  }

  const short = trimmed.replace(/^\/+/, "").split("/").filter(Boolean);
  if (
    short.length === 2 &&
    /^[a-zA-Z0-9_.-]+$/.test(short[0]) &&
    /^[a-zA-Z0-9_.-]+$/.test(short[1])
  ) {
    return { owner: short[0], repo: short[1] };
  }

  return null;
}

export function sessionPayloadKey(
  owner: string,
  repo: string,
  from: string,
  to: string,
): string {
  return `reporeel:${owner}:${repo}:${from}:${to}`;
}

import type { CachedChangelogPayload } from "@/lib/types";

const TTL_SECONDS = 60 * 60 * 24 * 7;

function cacheKey(owner: string, repo: string, from: string, to: string): string {
  return `changelog:${owner}:${repo}:${from}:${to}`;
}

export function buildChangelogCacheKey(
  owner: string,
  repo: string,
  from: string,
  to: string,
): string {
  return cacheKey(owner, repo, from, to);
}

function kvConfigured(): boolean {
  return Boolean(
    process.env.KV_REST_API_URL ||
      process.env.KV_URL ||
      process.env.KV_REST_API_TOKEN,
  );
}

export async function getCachedChangelog(
  owner: string,
  repo: string,
  from: string,
  to: string,
): Promise<CachedChangelogPayload | null> {
  if (!kvConfigured()) return null;
  try {
    const { kv } = await import("@vercel/kv");
    const key = cacheKey(owner, repo, from, to);
    const data = await kv.get<CachedChangelogPayload>(key);
    return data ?? null;
  } catch {
    return null;
  }
}

export async function setCachedChangelog(
  owner: string,
  repo: string,
  from: string,
  to: string,
  payload: CachedChangelogPayload,
): Promise<void> {
  if (!kvConfigured()) return;
  try {
    const { kv } = await import("@vercel/kv");
    const key = cacheKey(owner, repo, from, to);
    await kv.set(key, payload, { ex: TTL_SECONDS });
  } catch (e) {
    console.error("KV set failed:", e);
  }
}

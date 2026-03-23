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

/** Vercel-linked KV/Redis, or Upstash for Redis (REST URL + token). */
function redisRestConfig(): { url: string; token: string } | null {
  const url =
    process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
  const token =
    process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return { url, token };
}

function kvConfigured(): boolean {
  return (
    Boolean(process.env.KV_URL) ||
    redisRestConfig() !== null
  );
}

async function getKv() {
  const cfg = redisRestConfig();
  if (!cfg) return null;
  const { createClient } = await import("@vercel/kv");
  return createClient({ url: cfg.url, token: cfg.token });
}

export async function getCachedChangelog(
  owner: string,
  repo: string,
  from: string,
  to: string,
): Promise<CachedChangelogPayload | null> {
  if (!kvConfigured()) return null;
  try {
    const kv = await getKv();
    if (!kv) return null;
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
    const kv = await getKv();
    if (!kv) return;
    const key = cacheKey(owner, repo, from, to);
    await kv.set(key, payload, { ex: TTL_SECONDS });
  } catch (e) {
    console.error("KV set failed:", e);
  }
}

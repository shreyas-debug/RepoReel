import { getSiteUrl } from "@/lib/site-url";

export function buildOgImageUrl(params: {
  owner: string;
  repo: string;
  from: string;
  to: string;
  highlight: string;
  commits: number;
  contributors: number;
  filesChanged: number;
}): string {
  const u = new URL("/api/og", getSiteUrl());
  u.searchParams.set("owner", params.owner);
  u.searchParams.set("repo", params.repo);
  u.searchParams.set("from", params.from);
  u.searchParams.set("to", params.to);
  u.searchParams.set("highlight", params.highlight.slice(0, 280));
  u.searchParams.set("commits", String(params.commits));
  u.searchParams.set("contributors", String(params.contributors));
  u.searchParams.set("files", String(params.filesChanged));
  return u.toString();
}

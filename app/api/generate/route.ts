import { NextResponse } from "next/server";
import { buildChangelogPayload } from "@/lib/build-changelog";
import { ApiErrorCode, type ApiErrorCodeType } from "@/lib/api-errors";
import type { GenerateRequest } from "@/lib/types";

function isGenerateRequest(body: unknown): body is GenerateRequest {
  if (!body || typeof body !== "object") return false;
  const o = body as Record<string, unknown>;
  return (
    typeof o.owner === "string" &&
    typeof o.repo === "string" &&
    typeof o.from === "string" &&
    typeof o.to === "string" &&
    o.owner.length > 0 &&
    o.repo.length > 0 &&
    o.from.length > 0 &&
    o.to.length > 0
  );
}

const statusByCode: Record<ApiErrorCodeType, number> = {
  [ApiErrorCode.GITHUB_RATE_LIMIT]: 403,
  [ApiErrorCode.REPO_NOT_FOUND]: 404,
  [ApiErrorCode.NO_COMMITS]: 422,
  [ApiErrorCode.GEMINI_FAILED]: 503,
};

export async function POST(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!isGenerateRequest(json)) {
    return NextResponse.json(
      { error: "Expected { owner, repo, from, to }" },
      { status: 400 },
    );
  }

  const { owner, repo, from, to } = json;

  const result = await buildChangelogPayload(owner, repo, from, to);

  if (!result.ok) {
    const status = statusByCode[result.code] ?? 500;
    return NextResponse.json(
      { error: result.message, code: result.code },
      { status },
    );
  }

  // `data` is CachedChangelogPayload: changelog + stats + `commitHeatmap` (daily grid)
  return NextResponse.json({ ok: true, data: result.payload });
}

import { NextResponse } from "next/server";
import { getRepoTags } from "@/lib/github";
import { ApiErrorCode } from "@/lib/api-errors";

export async function GET(
  _request: Request,
  { params }: { params: { owner: string; repo: string } },
) {
  const { owner, repo } = params;
  if (!owner || !repo) {
    return NextResponse.json({ error: "Missing owner or repo" }, { status: 400 });
  }

  try {
    const tags = await getRepoTags(owner, repo);
    return NextResponse.json({ tags: tags.map((t) => t.name) });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to load tags";
    const status = (e as { status?: number }).status;
    if (status === 404 || message.includes("not found")) {
      return NextResponse.json(
        {
          error:
            "This repo is private or doesn't exist. RepoReel only works with public repositories.",
          code: ApiErrorCode.REPO_NOT_FOUND,
        },
        { status: 404 },
      );
    }
    if (status === 403 || message.includes("rate limit")) {
      return NextResponse.json(
        {
          error:
            "GitHub rate limit reached. Add a GITHUB_TOKEN in .env for higher limits.",
          code: ApiErrorCode.GITHUB_RATE_LIMIT,
        },
        { status: 403 },
      );
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

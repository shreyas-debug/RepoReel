import { NextResponse } from "next/server";
import { getRepoTags } from "@/lib/github";

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
    const status = message.includes("not found") ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

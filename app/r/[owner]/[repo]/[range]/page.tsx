import { ChangelogExperience } from "@/components/Changelog/ChangelogExperience";
import { getCachedChangelog } from "@/lib/cache";
import { decodeTagRange } from "@/lib/range";
import { notFound } from "next/navigation";

export default async function ChangelogPage({
  params,
}: {
  params: { owner: string; repo: string; range: string };
}) {
  let from: string;
  let to: string;
  try {
    ({ from, to } = decodeTagRange(params.range));
  } catch {
    notFound();
  }

  const cached = await getCachedChangelog(params.owner, params.repo, from, to);

  return (
    <ChangelogExperience
      owner={params.owner}
      repo={params.repo}
      from={from}
      to={to}
      initial={cached}
    />
  );
}

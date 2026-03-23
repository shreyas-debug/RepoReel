import { Octokit } from "@octokit/rest";
import type {
  CompareVersionsResult,
  GitHubCommit,
  GitHubPR,
} from "@/lib/types";

function createClient(): Octokit {
  const token = process.env.GITHUB_TOKEN;
  return new Octokit({ auth: token || undefined });
}

function mapCommit(
  sha: string,
  message: string,
  author: { login?: string | null; name?: string | null } | null | undefined,
  htmlUrl: string,
  committedDate: string,
): GitHubCommit {
  return {
    sha,
    message,
    authorLogin: author?.login ?? null,
    authorName: author?.name ?? null,
    htmlUrl,
    committedDate,
  };
}

/**
 * List version tags for a public repository (name + commit SHA).
 */
export async function getRepoTags(
  owner: string,
  repo: string,
): Promise<{ name: string; commitSha: string }[]> {
  const octokit = createClient();
  try {
    const tags = await octokit.paginate(octokit.repos.listTags, {
      owner,
      repo,
      per_page: 100,
    });
    return tags.map((t) => ({
      name: t.name,
      commitSha: t.commit.sha,
    }));
  } catch (err: unknown) {
    const status = (err as { status?: number }).status;
    if (status === 404) {
      throw new Error(`Repository not found: ${owner}/${repo}`);
    }
    if (status === 403) {
      throw new Error(
        "GitHub API rate limit or forbidden. Set GITHUB_TOKEN for higher limits.",
      );
    }
    throw err;
  }
}

const PR_NUMBER_REGEX = /(?:#|pull request\s*)(\d+)/gi;

function extractPrNumbersFromCommits(commits: GitHubCommit[]): Set<number> {
  const ids = new Set<number>();
  for (const c of commits) {
    let match: RegExpExecArray | null;
    const re = new RegExp(PR_NUMBER_REGEX.source, PR_NUMBER_REGEX.flags);
    while ((match = re.exec(c.message)) !== null) {
      const n = Number.parseInt(match[1], 10);
      if (!Number.isNaN(n)) ids.add(n);
    }
  }
  return ids;
}

/**
 * Compare two refs (tags, branches, or SHAs). Returns commits and diff stats.
 */
export async function compareVersions(
  owner: string,
  repo: string,
  base: string,
  head: string,
): Promise<CompareVersionsResult> {
  const octokit = createClient();
  try {
    const { data } = await octokit.repos.compareCommitsWithBasehead({
      owner,
      repo,
      basehead: `${base}...${head}`,
    });

    const commits: GitHubCommit[] = (data.commits || []).map((c) =>
      mapCommit(
        c.sha,
        c.commit.message?.trim() ?? "",
        c.author,
        c.html_url,
        c.commit.author?.date ?? new Date().toISOString(),
      ),
    );

    const contributorLogins = new Set<string>();
    for (const c of commits) {
      if (c.authorLogin) contributorLogins.add(c.authorLogin);
      else if (c.authorName) contributorLogins.add(c.authorName);
    }

    return {
      commits,
      stats: {
        totalCommits: data.total_commits ?? commits.length,
        filesChanged: data.files?.length ?? 0,
        additions: data.files?.reduce((s, f) => s + (f.additions ?? 0), 0) ?? 0,
        deletions: data.files?.reduce((s, f) => s + (f.deletions ?? 0), 0) ?? 0,
      },
      contributorLogins: Array.from(contributorLogins),
    };
  } catch (err: unknown) {
    const status = (err as { status?: number }).status;
    const message = (err as Error).message ?? "";
    if (status === 404) {
      throw new Error(
        `Could not compare ${base}...${head}. Check that both tags or refs exist.`,
      );
    }
    if (message.includes("No common ancestor")) {
      throw new Error("The chosen versions do not share a common history.");
    }
    throw err;
  }
}

/**
 * Resolve merged PRs linked from commit messages in the compare range.
 */
export async function getMergedPRs(
  owner: string,
  repo: string,
  commits: GitHubCommit[],
): Promise<GitHubPR[]> {
  const octokit = createClient();
  const numbers = extractPrNumbersFromCommits(commits);
  if (numbers.size === 0) return [];

  const results: GitHubPR[] = [];
  const batch = Array.from(numbers).slice(0, 50);

  await Promise.all(
    batch.map(async (number) => {
      try {
        const { data } = await octokit.pulls.get({
          owner,
          repo,
          pull_number: number,
        });
        if (data.merged_at) {
          results.push({
            number: data.number,
            title: data.title,
            mergedAt: data.merged_at,
            htmlUrl: data.html_url,
          });
        }
      } catch {
        // PR may have been deleted or is not a PR; skip
      }
    }),
  );

  results.sort((a, b) => {
    const ta = a.mergedAt ?? "";
    const tb = b.mergedAt ?? "";
    return tb.localeCompare(ta);
  });

  return results;
}

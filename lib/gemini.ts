import { GoogleGenerativeAI } from "@google/generative-ai";
import type {
  ChangelogResponse,
  GitHubCommit,
  GitHubPR,
} from "@/lib/types";

const SYSTEM_PROMPT = `You are a technical writer that specializes in software release notes.
You will receive a list of git commit messages and pull request titles from a GitHub repository.
Your job is to analyze them and return a structured changelog.

RULES:
- Return ONLY valid JSON. No markdown, no backticks, no explanation.
- Categorize each change into exactly one of: features, bugFixes, breakingChanges, performance, devExperience
- Write descriptions in plain English that a non-expert can understand
- The "highlight" field should be the single most impactful change
- If a category has no changes, return an empty array for it
- Keep each description under 20 words

Return this exact JSON structure:
{
  "summary": "string",
  "stats": { "commits": number, "contributors": number, "filesChanged": number },
  "highlight": { "title": "string", "description": "string" },
  "categories": {
    "features": [{ "title": "string", "description": "string", "prNumber": number | null }],
    "bugFixes": [...],
    "breakingChanges": [...],
    "performance": [...],
    "devExperience": [...]
  }
}`;

function buildUserContent(
  commits: GitHubCommit[],
  prs: GitHubPR[],
  stats: {
    commits: number;
    contributors: number;
    filesChanged: number;
  },
): string {
  const commitLines = commits
    .slice(0, 200)
    .map((c) => `- ${c.sha.slice(0, 7)} ${c.message.split("\n")[0]}`)
    .join("\n");
  const prLines = prs
    .map((p) => `- #${p.number} ${p.title}`)
    .join("\n");

  return `Repository activity between the two selected versions.

Known stats (use these exact numbers for the "stats" field in your JSON):
- commits: ${stats.commits}
- contributors: ${stats.contributors}
- filesChanged: ${stats.filesChanged}

Commits (sample):
${commitLines || "(none)"}

Pull requests merged in this range (titles):
${prLines || "(none — infer only from commits)"}`;
}

function stripJsonFence(text: string): string {
  const trimmed = text.trim();
  if (trimmed.startsWith("```")) {
    const withoutOpen = trimmed.replace(/^```(?:json)?\s*/i, "");
    return withoutOpen.replace(/\s*```\s*$/, "").trim();
  }
  return trimmed;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseChangelogResponse(raw: string): ChangelogResponse {
  const parsed: unknown = JSON.parse(stripJsonFence(raw));
  if (!isRecord(parsed)) throw new Error("Invalid JSON root");

  const summary = parsed.summary;
  if (typeof summary !== "string") throw new Error("Missing summary");

  const stats = parsed.stats;
  if (!isRecord(stats)) throw new Error("Missing stats");
  const commits = stats.commits;
  const contributors = stats.contributors;
  const filesChanged = stats.filesChanged;
  if (
    typeof commits !== "number" ||
    typeof contributors !== "number" ||
    typeof filesChanged !== "number"
  ) {
    throw new Error("Invalid stats fields");
  }

  const highlight = parsed.highlight;
  if (!isRecord(highlight)) throw new Error("Missing highlight");
  const ht = highlight.title;
  const hd = highlight.description;
  if (typeof ht !== "string" || typeof hd !== "string") {
    throw new Error("Invalid highlight");
  }

  const categories = parsed.categories;
  if (!isRecord(categories)) throw new Error("Missing categories");

  const keys = [
    "features",
    "bugFixes",
    "breakingChanges",
    "performance",
    "devExperience",
  ] as const;

  const outCategories: ChangelogResponse["categories"] = {
    features: [],
    bugFixes: [],
    breakingChanges: [],
    performance: [],
    devExperience: [],
  };

  for (const key of keys) {
    const arr = categories[key];
    if (!Array.isArray(arr)) throw new Error(`Invalid category ${key}`);
    for (const item of arr) {
      if (!isRecord(item)) throw new Error(`Invalid item in ${key}`);
      const title = item.title;
      const description = item.description;
      const prNumber = item.prNumber;
      if (typeof title !== "string" || typeof description !== "string") {
        throw new Error(`Invalid item fields in ${key}`);
      }
      if (
        prNumber !== null &&
        prNumber !== undefined &&
        typeof prNumber !== "number"
      ) {
        throw new Error(`Invalid prNumber in ${key}`);
      }
      outCategories[key].push({
        title,
        description,
        prNumber: typeof prNumber === "number" ? prNumber : null,
      });
    }
  }

  return {
    summary,
    stats: { commits, contributors, filesChanged },
    highlight: { title: ht, description: hd },
    categories: outCategories,
  };
}

export async function generateChangelog(
  commits: GitHubCommit[],
  prs: GitHubPR[],
  stats: {
    commits: number;
    contributors: number;
    filesChanged: number;
  },
): Promise<ChangelogResponse> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const modelName =
    process.env.GEMINI_MODEL?.trim() || "gemini-2.0-flash";
  const model = genAI.getGenerativeModel({
    model: modelName,
    systemInstruction: SYSTEM_PROMPT,
  });

  const userContent = buildUserContent(commits, prs, stats);

  async function runOnce(): Promise<ChangelogResponse> {
    const result = await model.generateContent(userContent);
    const text = result.response.text();
    if (!text) throw new Error("Empty response from Gemini");
    return parseChangelogResponse(text);
  }

  try {
    return await runOnce();
  } catch {
    const retryModel = genAI.getGenerativeModel({
      model: modelName,
      systemInstruction: `${SYSTEM_PROMPT}

CRITICAL: Your previous output was invalid. Reply with ONLY a single JSON object. No prose.`,
    });
    const result = await retryModel.generateContent(userContent);
    const text = result.response.text();
    if (!text) throw new Error("Empty response from Gemini on retry");
    return parseChangelogResponse(text);
  }
}

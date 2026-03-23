import { GoogleGenerativeAI } from "@google/generative-ai";

/** Tried in order; earlier entries are cheaper. 404/unsupported skips to next. */
const MODEL_FALLBACK_CHAIN = [
  "gemini-2.0-flash-lite",
  "gemini-2.0-flash",
  "gemini-2.5-flash-lite",
  "gemini-2.5-flash",
  "gemini-1.5-flash-8b",
];

export interface GeminiNarrative {
  summary: string;
  highlight: {
    title: string;
    description: string;
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseNarrativeJson(text: string): GeminiNarrative {
  const clean = text.replace(/```json|```/g, "").trim();
  const parsed: unknown = JSON.parse(clean);
  if (!isRecord(parsed)) throw new Error("Invalid narrative JSON");
  const summary = parsed.summary;
  const highlight = parsed.highlight;
  if (typeof summary !== "string") throw new Error("Missing summary");
  if (!isRecord(highlight)) throw new Error("Missing highlight");
  const title = highlight.title;
  const description = highlight.description;
  if (typeof title !== "string" || typeof description !== "string") {
    throw new Error("Invalid highlight");
  }
  return { summary, highlight: { title, description } };
}

function errorText(err: unknown): string {
  if (err instanceof Error) {
    const cause = (err as Error & { cause?: unknown }).cause;
    return `${err.message}${cause != null ? ` ${String(cause)}` : ""}`;
  }
  return String(err);
}

/** True only for real quota / rate-limit signals (avoid "rate" substring false positives). */
function isQuotaError(err: unknown): boolean {
  const raw = errorText(err);
  const msg = raw.toLowerCase();
  return (
    msg.includes("429") ||
    msg.includes("resource_exhausted") ||
    msg.includes("resource exhausted") ||
    msg.includes("quota") ||
    msg.includes("rate limit") ||
    msg.includes("ratelimit") ||
    msg.includes("too many requests") ||
    /\b429\b/.test(raw)
  );
}

function shouldRetryWithNextModel(err: unknown): boolean {
  const msg = errorText(err).toLowerCase();
  if (isQuotaError(err)) return true;
  if (err instanceof SyntaxError) return true;
  if (msg.includes("invalid narrative") || msg.includes("missing summary")) {
    return true;
  }
  if (msg.includes("json")) return true;
  if (msg.includes("404")) return true;
  if (msg.includes("empty response")) return true;
  if (msg.includes("not found")) return true;
  if (msg.includes("not supported")) return true;
  if (msg.includes("does not exist")) return true;
  if (msg.includes("was not found")) return true;
  return false;
}

export async function generateNarrative(
  miniSummary: string,
): Promise<GeminiNarrative> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const genAI = new GoogleGenerativeAI(apiKey);

  const prompt = `
You are a technical writer creating release notes.
Below is a pre-categorized summary of changes in a software release.
Your job is ONLY to write a brief narrative — do NOT re-categorize anything.

${miniSummary}

Return ONLY valid JSON with no markdown, no backticks, no explanation:
{
  "summary": "2 sentence plain English overview of this release that a non-technical person can understand",
  "highlight": {
    "title": "The single most important change in 5 words or less",
    "description": "One sentence explaining why this change matters"
  }
}
`;

  let lastError: Error | null = null;

  for (const modelName of MODEL_FALLBACK_CHAIN) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();
      if (!text) throw new Error("Empty response from Gemini");
      return parseNarrativeJson(text);
    } catch (err: unknown) {
      const asErr = err instanceof Error ? err : new Error(errorText(err));
      lastError = asErr;
      if (shouldRetryWithNextModel(err)) {
        continue;
      }
      throw asErr;
    }
  }

  if (lastError) {
    if (isQuotaError(lastError)) {
      throw new Error(
        "AI quota exceeded across all models. Please try again tomorrow or add billing to your Google AI account at aistudio.google.com.",
      );
    }
    throw new Error(
      `AI generation failed after trying ${MODEL_FALLBACK_CHAIN.length} models: ${lastError.message}`,
    );
  }

  throw new Error("AI generation failed");
}

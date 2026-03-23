import { GoogleGenerativeAI } from "@google/generative-ai";

const MODEL_FALLBACK_CHAIN = [
  "gemini-2.0-flash-lite",
  "gemini-2.0-flash",
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

function isQuotaError(err: unknown): boolean {
  const msg =
    err instanceof Error
      ? err.message
      : typeof err === "string"
        ? err
        : "";
  return (
    msg.includes("429") ||
    msg.includes("quota") ||
    msg.includes("rate") ||
    msg.includes("RESOURCE_EXHAUSTED")
  );
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
      if (isQuotaError(err)) {
        lastError = err instanceof Error ? err : new Error(String(err));
        continue;
      }
      if (err instanceof SyntaxError) {
        lastError = err;
        continue;
      }
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("JSON") || msg.includes("Invalid narrative")) {
        lastError = err instanceof Error ? err : new Error(msg);
        continue;
      }
      throw err;
    }
  }

  if (lastError) {
    if (isQuotaError(lastError)) {
      throw new Error(
        "AI quota exceeded across all models. Please try again tomorrow or add billing to your Google AI account at aistudio.google.com.",
      );
    }
    throw lastError;
  }

  throw new Error("AI generation failed");
}

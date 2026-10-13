import "server-only";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";

const AMA_PROMPT_MAX_LENGTH = 120;
const SUGGESTION_COUNT = 3;
const SEPARATOR = "||";

export const FALLBACK_AMA_SUGGESTIONS = [
  "Ask me anything about what I'm working on",
  "Tell me something you've never said to my face",
  "What should I try next?",
] as const;

/** Splits "a||b||c", trims, drops empties and over-long prompts. */
export function parseAmaSuggestions(text: string): string[] {
  return text
    .split(SEPARATOR)
    .map((item) => item.replace(/^["'\s-]+|["'\s]+$/g, "").trim())
    .filter((item) => item.length > 0 && item.length <= AMA_PROMPT_MAX_LENGTH)
    .slice(0, SUGGESTION_COUNT);
}

/**
 * Three short AMA Prompts for the recipient's profile, optionally riffing on
 * their current prompt. Falls back to fixed ideas without an AI key.
 */
export async function generateAmaSuggestions(
  currentPrompt?: string
): Promise<string[]> {
  const apiKey = process.env.GOOGLE_AI_STUDIO_SECRET;
  if (!apiKey) {
    return [...FALLBACK_AMA_SUGGESTIONS];
  }

  try {
    const model = createGoogleGenerativeAI({ apiKey }).chat(
      "gemini-2.5-flash-lite"
    );
    const context = currentPrompt
      ? `Their current prompt is: "${currentPrompt}". Offer fresh variations on that theme.`
      : "Offer varied, friendly themes.";
    const { text } = await generateText({
      model,
      prompt: `Write ${SUGGESTION_COUNT} short "Ask me anything" prompts a person could show on their anonymous-message profile. ${context}
Each under 80 characters, warm and safe for a broad audience, no hashtags or emoji.
Output ONLY the prompts separated by '${SEPARATOR}'.`,
    });
    const suggestions = parseAmaSuggestions(text);
    return suggestions.length > 0 ? suggestions : [...FALLBACK_AMA_SUGGESTIONS];
  } catch (error) {
    console.warn("AMA suggestions fallback used:", error);
    return [...FALLBACK_AMA_SUGGESTIONS];
  }
}

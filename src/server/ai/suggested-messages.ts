import "server-only";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";

const SUGGESTIONS_PROMPT =
  "Create a list of three open-ended and engaging questions formatted as a single string. Each question should be separated by '||'. These questions are for an anonymous social messaging platform, like Qooh.me, and should be suitable for a diverse audience. Avoid personal or sensitive topics, focusing instead on universal themes that encourage friendly interaction. For example, your output should be structured like this: 'What\\'s a hobby you\\'ve recently started?||If you could have dinner with any historical figure, who would it be?||What\\'s a simple thing that makes you happy?'. Ensure the questions are intriguing, foster curiosity, and contribute to a positive and welcoming conversational environment.";

export const FALLBACK_SUGGESTIONS = [
  "What is a hobby you have recently started?||If you could have dinner with any historical figure, who would it be?||What is a simple thing that makes you happy?",
  "What is the best piece of advice you have ever received?||What is your favorite book or movie and why?||If you could master any skill instantly, what would it be?",
  "What is a goal you are working toward right now?||What is something that always brings a smile to your face?||If you could travel anywhere tomorrow, where would you go?",
  "What is a song that always lifts your mood?||What is a small act of kindness you recently witnessed?||What is something you are proud of accomplishing this year?",
] as const;

/**
 * Long enough that most visitors within the window share one AI call
 * (this prompt takes no input, so every call would otherwise ask the model
 * for the same kind of thing), short enough that the questions stay fresh.
 */
const CACHE_TTL_MS = 15 * 60 * 1000;

interface SuggestionsCache {
  expiresAt: number;
  messages: string;
}

function randomFallback(): string {
  return FALLBACK_SUGGESTIONS[
    Math.floor(Math.random() * FALLBACK_SUGGESTIONS.length)
  ];
}

/**
 * Builds an independent `getSuggestedMessages`, each with its own cache
 * slot. Production uses the one singleton below; tests call this directly
 * so one test's cached result can never leak into another's.
 */
export function createSuggestedMessagesSource(): (
  now?: number
) => Promise<string> {
  let cached: SuggestionsCache | null = null;

  return async (now: number = Date.now()): Promise<string> => {
    if (cached && now < cached.expiresAt) {
      return cached.messages;
    }

    const apiKey = process.env.GOOGLE_AI_STUDIO_SECRET;
    if (!apiKey) {
      return randomFallback();
    }

    try {
      const model = createGoogleGenerativeAI({
        apiKey,
      }).chat("gemini-2.5-flash-lite");

      const { text } = await generateText({
        model,
        prompt: SUGGESTIONS_PROMPT,
      });

      cached = { expiresAt: now + CACHE_TTL_MS, messages: text };
      return text;
    } catch (error) {
      console.error(
        "Failed to get suggested messages via AI, using fallback:",
        error
      );
      return randomFallback();
    }
  };
}

/**
 * Three generic conversation-starter questions for the send-message form.
 * Not personalized (no input), so one AI result is cached and reused for
 * every visitor until it expires: most requests cost no AI call at all.
 * The fallback path is never cached, so it keeps picking a random set.
 */
export const getSuggestedMessages = createSuggestedMessagesSource();

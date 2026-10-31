import "server-only";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";
import { SMART_REPLY_TONES } from "@/schemas/message-schema";

export type ReplyTone = (typeof SMART_REPLY_TONES)[number];

export interface SmartReplyDraft {
  text: string;
  tone: ReplyTone;
}

/** Drafts stay short enough to read at a glance (at most 2 sentences). */
const DRAFT_MAX_LENGTH = 180;

const TONE_INSTRUCTIONS: Record<ReplyTone, string> = {
  thoughtful:
    "reflective depth, honesty, maturity and insight: a meaningful, well-considered perspective.",
  wholesome:
    "genuine gratitude, warmth, positive energy and kindness: make the sender feel appreciated.",
  witty:
    "sharp wit, clever humour or lighthearted playful sarcasm: funny and memorable, never cruel.",
};

/** Used without an AI key or when the call fails, so the list is never empty. */
export const FALLBACK_DRAFTS: Record<ReplyTone, string> = {
  thoughtful:
    "That's a really interesting point. It definitely got me thinking!",
  wholesome: "Thank you so much! That means a lot to me. ✨",
  witty: "Haha, thanks for keeping me on my toes! 😉",
};

/**
 * Gemini's structured-output mode returns all three drafts in one call; an
 * object that doesn't fit fails the call, which falls back below.
 */
const draftsSchema = z.object({
  thoughtful: z.string().min(1),
  wholesome: z.string().min(1),
  witty: z.string().min(1),
});

const QUOTE_EDGES = /^["']|["']$/g;

const clean = (text: string): string =>
  text.replace(QUOTE_EDGES, "").trim().slice(0, DRAFT_MAX_LENGTH);

const toDrafts = (byTone: Record<ReplyTone, string>): SmartReplyDraft[] =>
  SMART_REPLY_TONES.map((tone) => ({ text: byTone[tone], tone }));

const buildPrompt = (messageContent: string): string =>
  [
    "You help a person reply to an Anonymous Message they received on their GhostMsg profile.",
    `Anonymous Message: "${messageContent}"`,
    "Write three different replies, one per tone:",
    ...SMART_REPLY_TONES.map((tone) => `- ${tone}: ${TONE_INSTRUCTIONS[tone]}`),
    `Each reply is the reply text only: no quotes, explanations or greetings, at most 2 sentences and under ${DRAFT_MAX_LENGTH} characters.`,
  ].join("\n");

/** Three Smart Reply drafts (thoughtful, witty, wholesome) for one message. */
export async function generateSmartReplies(
  messageContent: string
): Promise<SmartReplyDraft[]> {
  const apiKey = process.env.GOOGLE_AI_STUDIO_SECRET;
  if (!apiKey) {
    return toDrafts(FALLBACK_DRAFTS);
  }

  try {
    const model = createGoogleGenerativeAI({
      apiKey,
    }).chat("gemini-2.5-flash-lite");

    const { object } = await generateObject({
      model,
      prompt: buildPrompt(messageContent),
      schema: draftsSchema,
    });

    return toDrafts({
      thoughtful: clean(object.thoughtful),
      wholesome: clean(object.wholesome),
      witty: clean(object.witty),
    });
  } catch (err) {
    console.warn("AI smart reply failed, using fallback:", err);
    return toDrafts(FALLBACK_DRAFTS);
  }
}

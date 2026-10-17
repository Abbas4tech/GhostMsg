import "server-only";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";
import { sentimentTagEnum } from "@/schemas/message-schema";
import type { SentimentTag } from "@/server/models/message.model";
import { TOXICITY_LEVELS, type ToxicityLevel } from "./quarantine-policy";

export interface ModerationResult {
  /** Kept for callers that only need a yes/no (hurtful or worse). */
  isToxic: boolean;
  sentimentTag: SentimentTag;
  toxicity: ToxicityLevel;
}

/**
 * Constrains the model's output to this exact shape (Gemini's structured-
 * output mode), so there is no markdown-fenced JSON to strip and no manual
 * parsing or validity checks: an object that doesn't fit the schema fails
 * the call outright, which the caller already treats as fail-open.
 */
const moderationSchema = z.object({
  sentimentTag: sentimentTagEnum,
  toxicity: z.enum(TOXICITY_LEVELS),
});

const MODERATION_PROMPT = `Analyze the following anonymous message submitted to a social platform:
Evaluate carefully:
1. toxicity: Choose exactly ONE level:
   - "severe": violent threats, doxxing, hate speech, sexual harassment, explicit abuse.
   - "hurtful": insults, demeaning or bullying language, spam or scam links.
   - "borderline": rude, mean-spirited or crude but not clearly abusive.
   - "none": everything else, including playful teasing.
2. sentimentTag: Choose exactly ONE label from:
   - "sweet": Compliments, gratitude, kindness, heartfelt appreciation.
   - "curious": Questions, inquiries, asking about opinions, thoughts, or life.
   - "spicy": Playful roasts, daring banter, confessions, secrets, teasing.
   - "advice": Constructive suggestions, life tips, supportive guidance.
   - "neutral": Plain greetings or casual statements.`;

export async function moderateAndClassifyMessage(
  content: string
): Promise<ModerationResult> {
  const apiKey = process.env.GOOGLE_AI_STUDIO_SECRET;
  if (!apiKey) {
    return { isToxic: false, sentimentTag: "neutral", toxicity: "none" };
  }

  try {
    const model = createGoogleGenerativeAI({
      apiKey,
    }).chat("gemini-2.5-flash-lite");

    const { object } = await generateObject({
      model,
      prompt: `${MODERATION_PROMPT}\n\nMessage:\n"${content}"`,
      schema: moderationSchema,
    });

    return {
      isToxic: object.toxicity === "hurtful" || object.toxicity === "severe",
      sentimentTag: object.sentimentTag,
      toxicity: object.toxicity,
    };
  } catch (err) {
    console.warn("AI moderation/sentiment fallback used due to error:", err);
    return {
      isToxic: false,
      sentimentTag: "neutral",
      toxicity: "none",
    };
  }
}

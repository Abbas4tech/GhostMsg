import "server-only";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";
import type { SentimentTag } from "@/server/models/message.model";
import { isToxicityLevel, type ToxicityLevel } from "./quarantine-policy";

export interface ModerationResult {
  /** Kept for callers that only need a yes/no (hurtful or worse). */
  isToxic: boolean;
  sentimentTag: SentimentTag;
  toxicity: ToxicityLevel;
}

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
   - "neutral": Plain greetings or casual statements.

Respond ONLY with valid JSON in this exact structure without markdown or explanation:
{"toxicity": "none", "sentimentTag": "neutral"}`;

export async function moderateAndClassifyMessage(
  content: string
): Promise<ModerationResult> {
  const apiKey = process.env.GOOGLE_AI_STUDIO_SECRET;
  if (!apiKey) {
    return { isToxic: false, toxicity: "none", sentimentTag: "neutral" };
  }

  try {
    const model = createGoogleGenerativeAI({
      apiKey,
    }).chat("gemini-2.5-flash-lite");

    const response = await generateText({
      model,
      prompt: `${MODERATION_PROMPT}\n\nMessage:\n"${content}"`,
    });

    const cleanText = response.text
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    const parsed = JSON.parse(cleanText);

    const validSentiments: SentimentTag[] = [
      "sweet",
      "curious",
      "spicy",
      "advice",
      "neutral",
    ];

    const sentimentTag: SentimentTag = validSentiments.includes(
      parsed.sentimentTag
    )
      ? parsed.sentimentTag
      : "neutral";

    // Older prompt shape ({ isToxic }) still maps onto a level.
    let toxicity: ToxicityLevel = "none";
    if (isToxicityLevel(parsed.toxicity)) {
      toxicity = parsed.toxicity;
    } else if (parsed.isToxic) {
      toxicity = "severe";
    }

    return {
      isToxic: toxicity === "hurtful" || toxicity === "severe",
      toxicity,
      sentimentTag,
    };
  } catch (err) {
    console.warn("AI moderation/sentiment fallback used due to error:", err);
    return {
      isToxic: false,
      toxicity: "none",
      sentimentTag: "neutral",
    };
  }
}

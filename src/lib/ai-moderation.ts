import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";
import type { SentimentTag } from "@/model/message.model";

export interface ModerationResult {
  isToxic: boolean;
  sentimentTag: SentimentTag;
}

const MODERATION_PROMPT = `Analyze the following anonymous message submitted to a social platform:
Evaluate carefully:
1. isToxic: Set to true if the text contains severe harassment, violent threats, doxxing, hate speech, or explicit abuse. Otherwise false.
2. sentimentTag: Choose exactly ONE label from:
   - "sweet": Compliments, gratitude, kindness, heartfelt appreciation.
   - "curious": Questions, inquiries, asking about opinions, thoughts, or life.
   - "spicy": Playful roasts, daring banter, confessions, secrets, teasing.
   - "advice": Constructive suggestions, life tips, supportive guidance.
   - "neutral": Plain greetings or casual statements.

Respond ONLY with valid JSON in this exact structure without markdown or explanation:
{"isToxic": false, "sentimentTag": "neutral"}`;

export async function moderateAndClassifyMessage(
  content: string
): Promise<ModerationResult> {
  const apiKey = process.env.GOOGLE_AI_STUDIO_SECRET;
  if (!apiKey) {
    return { isToxic: false, sentimentTag: "neutral" };
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

    return {
      isToxic: Boolean(parsed.isToxic),
      sentimentTag,
    };
  } catch (err) {
    console.warn("AI moderation/sentiment fallback used due to error:", err);
    return {
      isToxic: false,
      sentimentTag: "neutral",
    };
  }
}

import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";

export type ReplyTone = "witty" | "wholesome" | "thoughtful";

const TONE_INSTRUCTIONS: Record<ReplyTone, string> = {
  witty:
    "Respond with sharp wit, clever humor, or lighthearted playful sarcasm. Keep it funny and memorable without being genuinely cruel.",
  wholesome:
    "Respond with genuine gratitude, warmth, positive energy, and kindness. Make the sender feel appreciated.",
  thoughtful:
    "Respond with reflective depth, honesty, maturity, and insight. Give a meaningful, well-considered perspective.",
};

export async function generateSmartReply(
  messageContent: string,
  tone: ReplyTone
): Promise<string> {
  const apiKey = process.env.GOOGLE_AI_STUDIO_SECRET;
  if (!apiKey) {
    const fallbacks: Record<ReplyTone, string> = {
      witty: "Haha, thanks for keeping me on my toes! 😉",
      wholesome: "Thank you so much! That means a lot to me. ✨",
      thoughtful:
        "That's a really interesting point. It definitely got me thinking!",
    };
    return fallbacks[tone];
  }

  try {
    const model = createGoogleGenerativeAI({
      apiKey,
    }).chat("gemini-2.5-flash-lite");

    const instruction = TONE_INSTRUCTIONS[tone] || TONE_INSTRUCTIONS.wholesome;

    const prompt = `You are an AI assistant helping a user reply to an anonymous message received on their GhostMsg profile.
Anonymous Message: "${messageContent}"
Tone Required: ${tone.toUpperCase()}
Style Guidelines: ${instruction}
Constraint: Output ONLY the reply text directly. Do not add quotes, explanations, or greeting boilerplate. Maximum 2 sentences (under 180 characters).`;

    const response = await generateText({
      model,
      prompt,
    });

    return response.text.replace(/^["']|["']$/g, "").trim();
  } catch (err) {
    console.warn("AI smart reply failed, using fallback:", err);
    return "Thanks for sending this message!";
  }
}

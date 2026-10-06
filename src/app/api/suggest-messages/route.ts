import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";

export const runtime = "edge";

const prompt =
  "Create a list of three open-ended and engaging questions formatted as a single string. Each question should be separated by '||'. These questions are for an anonymous social messaging platform, like Qooh.me, and should be suitable for a diverse audience. Avoid personal or sensitive topics, focusing instead on universal themes that encourage friendly interaction. For example, your output should be structured like this: 'What\\'s a hobby you\\'ve recently started?||If you could have dinner with any historical figure, who would it be?||What\\'s a simple thing that makes you happy?'. Ensure the questions are intriguing, foster curiosity, and contribute to a positive and welcoming conversational environment.";

const FALLBACK_SUGGESTIONS = [
  "What is a hobby you have recently started?||If you could have dinner with any historical figure, who would it be?||What is a simple thing that makes you happy?",
  "What is the best piece of advice you have ever received?||What is your favorite book or movie and why?||If you could master any skill instantly, what would it be?",
  "What is a goal you are working toward right now?||What is something that always brings a smile to your face?||If you could travel anywhere tomorrow, where would you go?",
  "What is a song that always lifts your mood?||What is a small act of kindness you recently witnessed?||What is something you are proud of accomplishing this year?",
];

export async function GET(): Promise<Response> {
  try {
    const apiKey = process.env.GOOGLE_AI_STUDIO_SECRET;
    if (!apiKey) {
      const fallback =
        FALLBACK_SUGGESTIONS[
          Math.floor(Math.random() * FALLBACK_SUGGESTIONS.length)
        ];
      return Response.json(
        {
          success: true,
          messages: fallback,
        },
        { status: 200 }
      );
    }

    const model = createGoogleGenerativeAI({
      apiKey,
    }).chat("gemini-2.5-flash-lite");

    const res = await generateText({
      model,
      prompt,
    });

    return Response.json(
      {
        success: true,
        messages: res.text,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "Failed to get suggested messages via AI, using fallback: ",
      error
    );

    const fallback =
      FALLBACK_SUGGESTIONS[
        Math.floor(Math.random() * FALLBACK_SUGGESTIONS.length)
      ];

    return Response.json(
      {
        success: true,
        messages: fallback,
      },
      { status: 200 }
    );
  }
}

import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";

export const runtime = "edge";

const prompt =
  "Create a list of three open-ended and engaging questions formatted as a single string. Each question should be separated by '||'. These questions are for an anonymous social messaging platform, like Qooh.me, and should be suitable for a diverse audience. Avoid personal or sensitive topics, focusing instead on universal themes that encourage friendly interaction. For example, your output should be structured like this: 'What's a hobby you've recently started?||If you could have dinner with any historical figure, who would it be?||What's a simple thing that makes you happy?'. Ensure the questions are intriguing, foster curiosity, and contribute to a positive and welcoming conversational environment.";

export async function GET(): Promise<Response> {
  try {
    const model = createGoogleGenerativeAI({
      apiKey: process.env.GOOGLE_AI_STUDIO_SECRET,
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
      "Failed to get suggested messages - Internal Server Error: ",
      error
    );
    return Response.json(
      {
        success: false,
        message: "Failed to get suggested messages - Internal Server Error",
      },
      {
        status: 500,
      }
    );
  }
}

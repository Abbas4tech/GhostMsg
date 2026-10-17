import type { NextRequest } from "next/server";
import { amaSuggestionsRequestSchema } from "@/schemas/user-settings-schema";
import { generateAmaSuggestions } from "@/server/ai/ama-suggestions";
import { getSessionUserId, unauthorizedResponse } from "@/server/auth/session";

/** "Suggest with AI" on the AMA Prompt card. */
export async function POST(request: NextRequest): Promise<Response> {
  try {
    const userId = await getSessionUserId();
    if (!userId) {
      return unauthorizedResponse();
    }

    const parsed = amaSuggestionsRequestSchema.safeParse(
      await request.json().catch(() => ({}))
    );
    const suggestions = await generateAmaSuggestions(
      parsed.success ? parsed.data.currentPrompt : undefined
    );

    return Response.json({ success: true, suggestions }, { status: 200 });
  } catch (error) {
    console.error("Failed to suggest AMA prompts:", error);
    return Response.json(
      { message: "Internal server error", success: false },
      { status: 500 }
    );
  }
}

import type { NextRequest } from "next/server";
import { getServerSession, type User } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { amaSuggestionsRequestSchema } from "@/schemas/user-settings-schema";
import { generateAmaSuggestions } from "@/server/ai/ama-suggestions";

/** "Suggest with AI" on the AMA Prompt card. */
export async function POST(request: NextRequest): Promise<Response> {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as User;
    if (!user?._id) {
      return Response.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
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
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

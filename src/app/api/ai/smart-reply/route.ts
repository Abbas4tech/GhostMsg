import type { NextRequest } from "next/server";
import { smartReplySchema } from "@/schemas/message-schema";
import { generateSmartReplies } from "@/server/ai/smart-reply";
import { getSessionUserId, unauthorizedResponse } from "@/server/auth/session";

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const userId = await getSessionUserId();
    if (!userId) {
      return unauthorizedResponse();
    }

    const body = await request.json();
    const parseResult = smartReplySchema.safeParse(body);

    if (!parseResult.success) {
      return Response.json(
        { message: "Invalid payload", success: false },
        { status: 400 }
      );
    }

    // One AI call returns a draft per tone (thoughtful, witty, wholesome).
    const drafts = await generateSmartReplies(parseResult.data.content);

    return Response.json({ drafts, success: true }, { status: 200 });
  } catch (error) {
    console.error("Failed to generate smart reply:", error);
    return Response.json(
      { message: "Internal server error", success: false },
      { status: 500 }
    );
  }
}

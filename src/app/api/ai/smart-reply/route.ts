import type { NextRequest } from "next/server";
import { smartReplySchema } from "@/schemas/message-schema";
import { generateSmartReply } from "@/server/ai/smart-reply";
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
        { success: false, message: "Invalid payload" },
        { status: 400 }
      );
    }

    const { content, tone } = parseResult.data;
    const reply = await generateSmartReply(content, tone);

    return Response.json(
      {
        success: true,
        reply,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to generate smart reply:", error);
    return Response.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

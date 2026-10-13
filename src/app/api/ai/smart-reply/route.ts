import type { NextRequest } from "next/server";
import { getServerSession, type User } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { generateSmartReply } from "@/lib/ai-smart-reply";
import { smartReplySchema } from "@/schemas/message-schema";

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

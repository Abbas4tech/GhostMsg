import type { NextRequest } from "next/server";
import { amaPromptSchema } from "@/schemas/message-schema";
import { getSessionUserId, unauthorizedResponse } from "@/server/auth/session";
import dbConnect from "@/server/db/db-connect";
import UserModel from "@/server/models/user.model";

export async function PATCH(request: NextRequest): Promise<Response> {
  try {
    await dbConnect();
    const userId = await getSessionUserId();
    if (!userId) {
      return unauthorizedResponse();
    }

    const body = await request.json();
    const parseResult = amaPromptSchema.safeParse(body);

    if (!parseResult.success) {
      return Response.json(
        { message: "Invalid AMA prompt payload", success: false },
        { status: 400 }
      );
    }

    const { amaPrompt } = parseResult.data;

    await UserModel.updateOne({ _id: userId }, { $set: { amaPrompt } });

    return Response.json(
      {
        amaPrompt,
        message: "AMA prompt updated successfully!",
        success: true,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to update AMA prompt:", error);
    return Response.json(
      { message: "Internal server error", success: false },
      { status: 500 }
    );
  }
}

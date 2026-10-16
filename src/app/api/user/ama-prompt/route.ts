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
        { success: false, message: "Invalid AMA prompt payload" },
        { status: 400 }
      );
    }

    const { amaPrompt } = parseResult.data;

    await UserModel.updateOne({ _id: userId }, { $set: { amaPrompt } });

    return Response.json(
      {
        success: true,
        amaPrompt,
        message: "AMA prompt updated successfully!",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to update AMA prompt:", error);
    return Response.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

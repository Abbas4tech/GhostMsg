import type { NextRequest } from "next/server";
import { changeUsernameRequestSchema } from "@/schemas/user-settings-schema";
import { getSessionUserId, unauthorizedResponse } from "@/server/auth/session";
import dbConnect from "@/server/db/db-connect";
import UserModel from "@/server/models/user.model";

/**
 * Changes the username, and with it the Public Profile Link. The client
 * refreshes the session (NextAuth `update`) after a 200.
 */
export async function PATCH(request: NextRequest): Promise<Response> {
  try {
    await dbConnect();
    const userId = await getSessionUserId();
    if (!userId) {
      return unauthorizedResponse();
    }

    const parsed = changeUsernameRequestSchema.safeParse(await request.json());
    if (!parsed.success) {
      return Response.json(
        {
          success: false,
          message: parsed.error.issues[0]?.message ?? "Invalid username",
        },
        { status: 400 }
      );
    }

    const { username } = parsed.data;
    const taken = await UserModel.exists({
      username,
      _id: { $ne: userId },
    });
    if (taken) {
      return Response.json(
        { success: false, message: "Username is already taken" },
        { status: 409 }
      );
    }

    await UserModel.updateOne({ _id: userId }, { $set: { username } });

    return Response.json(
      { success: true, message: "Username updated", username },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to change username:", error);
    return Response.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

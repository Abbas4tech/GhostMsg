import type { NextRequest } from "next/server";
import { deleteAccountRequestSchema } from "@/schemas/user-settings-schema";
import { getSessionUserId, unauthorizedResponse } from "@/server/auth/session";
import dbConnect from "@/server/db/db-connect";
import MessageModel from "@/server/models/message.model";
import UserModel from "@/server/models/user.model";

/**
 * Deletes the account, its link and every message. The caller must type
 * the username; the client signs out after a 200.
 */
export async function DELETE(request: NextRequest): Promise<Response> {
  try {
    await dbConnect();
    const userId = await getSessionUserId();
    if (!userId) {
      return unauthorizedResponse();
    }

    const parsed = deleteAccountRequestSchema.safeParse(
      await request.json().catch(() => ({}))
    );
    const userDoc = await UserModel.findById(userId).select("username");
    if (!userDoc) {
      return Response.json(
        { message: "User not found", success: false },
        { status: 404 }
      );
    }
    if (!parsed.success || parsed.data.confirmUsername !== userDoc.username) {
      return Response.json(
        { message: "Type your username exactly to confirm", success: false },
        { status: 400 }
      );
    }

    await MessageModel.deleteMany({ recipientId: userDoc._id });
    await UserModel.deleteOne({ _id: userDoc._id });

    return Response.json(
      { message: "Account deleted", success: true },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to delete account:", error);
    return Response.json(
      { message: "Internal server error", success: false },
      { status: 500 }
    );
  }
}

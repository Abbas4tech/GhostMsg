import type { NextRequest } from "next/server";
import { getServerSession, type User } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { deleteAccountRequestSchema } from "@/schemas/user-settings-schema";
import dbConnect from "@/server/db/db-connect";
import MessageModel from "@/server/models/message.model";
import UserModel from "@/server/models/user.model";

/**
 * Deletes the account, its link and every message. The caller must type
 * the username; the client signs out after a 200.
 */
export async function DELETE(request: NextRequest): Promise<Response> {
  await dbConnect();
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as User;
    if (!user?._id) {
      return Response.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    const parsed = deleteAccountRequestSchema.safeParse(
      await request.json().catch(() => ({}))
    );
    const userDoc = await UserModel.findById(user._id).select("username");
    if (!userDoc) {
      return Response.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }
    if (!parsed.success || parsed.data.confirmUsername !== userDoc.username) {
      return Response.json(
        { success: false, message: "Type your username exactly to confirm" },
        { status: 400 }
      );
    }

    await MessageModel.deleteMany({ recipientId: userDoc._id });
    await UserModel.deleteOne({ _id: userDoc._id });

    return Response.json(
      { success: true, message: "Account deleted" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to delete account:", error);
    return Response.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

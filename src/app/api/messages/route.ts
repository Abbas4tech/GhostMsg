import { getSessionUserId, unauthorizedResponse } from "@/server/auth/session";
import dbConnect from "@/server/db/db-connect";
import MessageModel from "@/server/models/message.model";

/** Danger zone: deletes every message (and so every public answer). */
export async function DELETE(): Promise<Response> {
  try {
    await dbConnect();
    const userId = await getSessionUserId();
    if (!userId) {
      return unauthorizedResponse();
    }

    const { deletedCount } = await MessageModel.deleteMany({
      recipientId: userId,
    });

    return Response.json(
      { deletedCount, message: "All messages deleted", success: true },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to delete all messages:", error);
    return Response.json(
      { message: "Internal server error", success: false },
      { status: 500 }
    );
  }
}

import mongoose from "mongoose";
import type { NextRequest } from "next/server";
import { getSessionUserId, unauthorizedResponse } from "@/server/auth/session";
import dbConnect from "@/server/db/db-connect";
import MessageModel from "@/server/models/message.model";

export async function DELETE(
  _request: NextRequest,
  props: { params: Promise<{ messageId: string }> }
): Promise<Response> {
  const params = await props.params;
  const messageId = params.messageId;

  try {
    await dbConnect();
    const userId = await getSessionUserId();
    if (!userId) {
      return unauthorizedResponse();
    }

    if (!mongoose.Types.ObjectId.isValid(messageId)) {
      return Response.json(
        { success: false, message: "Invalid message ID format" },
        { status: 400 }
      );
    }

    const deleteResult = await MessageModel.deleteOne({
      _id: messageId,
      recipientId: userId,
    });

    if (deleteResult.deletedCount === 0) {
      return Response.json(
        {
          success: false,
          message: "Message not found or already deleted",
        },
        { status: 404 }
      );
    }

    return Response.json(
      { success: true, message: "Message deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to delete message:", error);
    return Response.json(
      {
        success: false,
        message: "Failed to delete message - Internal Server Error",
      },
      { status: 500 }
    );
  }
}

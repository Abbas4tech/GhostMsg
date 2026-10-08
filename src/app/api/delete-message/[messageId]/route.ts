import mongoose from "mongoose";
import type { NextRequest } from "next/server";
import { getServerSession, type User } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import dbConnect from "@/lib/db-connect";
import MessageModel from "@/model/message.model";

export async function DELETE(
  _request: NextRequest,
  props: { params: Promise<{ messageId: string }> }
): Promise<Response> {
  const params = await props.params;
  const messageId = params.messageId;

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

    if (!mongoose.Types.ObjectId.isValid(messageId)) {
      return Response.json(
        { success: false, message: "Invalid message ID format" },
        { status: 400 }
      );
    }

    const deleteResult = await MessageModel.deleteOne({
      _id: messageId,
      recipientId: user._id,
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

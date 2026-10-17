import mongoose from "mongoose";
import type { NextRequest } from "next/server";
import { updateMessageSchema } from "@/schemas/message-schema";
import { getSessionUserId, unauthorizedResponse } from "@/server/auth/session";
import dbConnect from "@/server/db/db-connect";
import MessageModel from "@/server/models/message.model";

export async function PATCH(
  request: NextRequest,
  props: { params: Promise<{ messageId: string }> }
): Promise<Response> {
  const { messageId } = await props.params;

  try {
    await dbConnect();
    const userId = await getSessionUserId();
    if (!userId) {
      return unauthorizedResponse();
    }

    if (!mongoose.Types.ObjectId.isValid(messageId)) {
      return Response.json(
        { message: "Invalid message ID", success: false },
        { status: 400 }
      );
    }

    const body = await request.json();
    const parseResult = updateMessageSchema.safeParse(body);

    if (!parseResult.success) {
      return Response.json(
        { message: "Invalid payload", success: false },
        { status: 400 }
      );
    }

    const updateFields: Record<string, unknown> = {};
    if (typeof parseResult.data.isPinned === "boolean") {
      updateFields.isPinned = parseResult.data.isPinned;
    }
    if (typeof parseResult.data.isRead === "boolean") {
      updateFields.isRead = parseResult.data.isRead;
    }

    const updated = await MessageModel.findOneAndUpdate(
      { _id: messageId, recipientId: userId },
      { $set: updateFields },
      { new: true }
    );

    if (!updated) {
      return Response.json(
        { message: "Message not found", success: false },
        { status: 404 }
      );
    }

    return Response.json(
      { message: "Message updated successfully", success: true },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to update message:", error);
    return Response.json(
      { message: "Internal server error", success: false },
      { status: 500 }
    );
  }
}

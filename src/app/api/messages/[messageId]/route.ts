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
        { success: false, message: "Invalid message ID" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const parseResult = updateMessageSchema.safeParse(body);

    if (!parseResult.success) {
      return Response.json(
        { success: false, message: "Invalid payload" },
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
        { success: false, message: "Message not found" },
        { status: 404 }
      );
    }

    return Response.json(
      { success: true, message: "Message updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to update message:", error);
    return Response.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

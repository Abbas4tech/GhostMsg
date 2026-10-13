import mongoose from "mongoose";
import type { NextRequest } from "next/server";
import { getServerSession, type User } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import dbConnect from "@/lib/db-connect";
import MessageModel from "@/model/message.model";
import { updateMessageSchema } from "@/schemas/message-schema";

export async function PATCH(
  request: NextRequest,
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
      { _id: messageId, recipientId: user._id },
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

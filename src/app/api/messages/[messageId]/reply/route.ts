import mongoose from "mongoose";
import type { NextRequest } from "next/server";
import { replyMessageSchema } from "@/schemas/message-schema";
import { getSessionUserId, unauthorizedResponse } from "@/server/auth/session";
import dbConnect from "@/server/db/db-connect";
import MessageModel from "@/server/models/message.model";

export async function POST(
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
    const parseResult = replyMessageSchema.safeParse(body);

    if (!parseResult.success) {
      return Response.json(
        { success: false, message: "Invalid reply payload" },
        { status: 400 }
      );
    }

    const { text, isPublished } = parseResult.data;

    const updated = await MessageModel.findOneAndUpdate(
      { _id: messageId, recipientId: userId },
      {
        $set: {
          reply: {
            text,
            isPublished: Boolean(isPublished),
            publishedAt: isPublished ? new Date() : undefined,
          },
          // Answering a message means it has been read.
          isRead: true,
        },
      },
      { new: true }
    );

    if (!updated) {
      return Response.json(
        { success: false, message: "Message not found" },
        { status: 404 }
      );
    }

    return Response.json(
      { success: true, message: "Reply saved successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to save reply:", error);
    return Response.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

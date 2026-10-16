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
        { message: "Invalid message ID", success: false },
        { status: 400 }
      );
    }

    const body = await request.json();
    const parseResult = replyMessageSchema.safeParse(body);

    if (!parseResult.success) {
      return Response.json(
        { message: "Invalid reply payload", success: false },
        { status: 400 }
      );
    }

    const { text, isPublished } = parseResult.data;

    const updated = await MessageModel.findOneAndUpdate(
      { _id: messageId, recipientId: userId },
      {
        $set: {
          // Answering a message means it has been read.
          isRead: true,
          reply: {
            isPublished: Boolean(isPublished),
            publishedAt: isPublished ? new Date() : undefined,
            text,
          },
        },
      },
      { new: true }
    );

    if (!updated) {
      return Response.json(
        { message: "Message not found", success: false },
        { status: 404 }
      );
    }

    return Response.json(
      { message: "Reply saved successfully", success: true },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to save reply:", error);
    return Response.json(
      { message: "Internal server error", success: false },
      { status: 500 }
    );
  }
}

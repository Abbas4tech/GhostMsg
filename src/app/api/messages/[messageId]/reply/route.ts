import mongoose from "mongoose";
import type { NextRequest } from "next/server";
import { getServerSession, type User } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import dbConnect from "@/lib/db-connect";
import MessageModel from "@/model/message.model";
import { replyMessageSchema } from "@/schemas/message-schema";

export async function POST(
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
    const parseResult = replyMessageSchema.safeParse(body);

    if (!parseResult.success) {
      return Response.json(
        { success: false, message: "Invalid reply payload" },
        { status: 400 }
      );
    }

    const { text, isPublished } = parseResult.data;

    const updated = await MessageModel.findOneAndUpdate(
      { _id: messageId, recipientId: user._id },
      {
        $set: {
          reply: {
            text,
            isPublished: Boolean(isPublished),
            publishedAt: isPublished ? new Date() : undefined,
          },
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

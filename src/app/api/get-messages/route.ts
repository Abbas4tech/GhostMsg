import mongoose from "mongoose";
import type { NextRequest } from "next/server";
import { getServerSession, type User } from "next-auth";
import dbConnect from "@/lib/db-connect";
import MessageModel from "@/model/message.model";
import UserModel from "@/model/user.model";
import { authOptions } from "../auth/[...nextauth]/options";

export async function GET(req: NextRequest): Promise<Response> {
  await dbConnect();
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as User;

    if (!user?._id) {
      return Response.json(
        { success: false, message: "Not authenticated, please login first!" },
        { status: 401 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(user._id as string)) {
      return Response.json(
        { success: false, message: "Invalid user ID format" },
        { status: 400 }
      );
    }

    const userId = new mongoose.Types.ObjectId(user._id);

    const userExists = await UserModel.exists({ _id: userId });
    if (!userExists) {
      return Response.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    const url = new URL(req.url);
    const status = url.searchParams.get("status") || "all";
    const search = url.searchParams.get("q") || "";
    const limit = Math.min(Number(url.searchParams.get("limit") || 50), 100);

    // Build query filter
    const query: Record<string, unknown> = { recipientId: userId };

    switch (status) {
      case "unread":
        query.isQuarantined = false;
        query.isRead = false;
        break;
      case "starred":
        query.isPinned = true;
        break;
      case "quarantined":
        query.isQuarantined = true;
        break;
      case "answered":
        query["reply.text"] = { $exists: true, $ne: "" };
        break;
      default:
        query.isQuarantined = false;
        break;
    }

    if (search.trim()) {
      query.content = { $regex: search.trim(), $options: "i" };
    }

    const [messages, total] = await Promise.all([
      MessageModel.find(query).sort({ createdAt: -1 }).limit(limit).lean(),
      MessageModel.countDocuments(query),
    ]);

    const formattedMessages = messages.map((msg) => ({
      _id: String(msg._id),
      content: msg.content,
      sentimentTag: msg.sentimentTag || "neutral",
      isQuarantined: Boolean(msg.isQuarantined),
      isPinned: Boolean(msg.isPinned),
      isRead: Boolean(msg.isRead),
      reply: msg.reply
        ? {
            text: msg.reply.text,
            isPublished: Boolean(msg.reply.isPublished),
            publishedAt: msg.reply.publishedAt
              ? new Date(msg.reply.publishedAt).toISOString()
              : undefined,
          }
        : null,
      senderHash: msg.senderHash,
      createdAt: new Date(msg.createdAt).toISOString(),
    }));

    return Response.json(
      {
        success: true,
        messages: formattedMessages,
        total,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to get messages:", error);
    return Response.json(
      {
        success: false,
        message: "Failed to get messages - Internal Server Error",
      },
      { status: 500 }
    );
  }
}

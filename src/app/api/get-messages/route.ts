import mongoose from "mongoose";
import type { NextRequest } from "next/server";
import { getServerSession, type User } from "next-auth";
import {
  decodeInboxCursor,
  encodeInboxCursor,
} from "@/lib/messages/inbox-cursor";
import { isInboxQueryStatus } from "@/lib/messages/inbox-filter";
import dbConnect from "@/server/db/db-connect";
import { buildInboxFilter, parsePageSize } from "@/server/messages/inbox-query";
import MessageModel from "@/server/models/message.model";
import UserModel from "@/server/models/user.model";
import { authOptions } from "../auth/[...nextauth]/options";

const badRequest = (message: string) =>
  Response.json({ success: false, message }, { status: 400 });

/**
 * One page of the inbox for a filter + search, newest first, with a keyset
 * `nextCursor` and the `total` matching the filter (Chapter 16 §6).
 */
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
      return badRequest("Invalid user ID format");
    }

    const userId = new mongoose.Types.ObjectId(user._id);
    const userExists = await UserModel.exists({ _id: userId });
    if (!userExists) {
      return Response.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") ?? "all";
    if (!isInboxQueryStatus(status)) {
      return badRequest("Unknown status filter");
    }
    const rawCursor = searchParams.get("cursor");
    const cursor = decodeInboxCursor(rawCursor);
    if (rawCursor && !(cursor && mongoose.Types.ObjectId.isValid(cursor.id))) {
      return badRequest("Invalid cursor");
    }
    const q = searchParams.get("q") ?? "";
    const limit = parsePageSize(searchParams.get("limit"));

    // Fetch one extra to know whether another page exists.
    const [found, total] = await Promise.all([
      MessageModel.find(buildInboxFilter(userId, { status, q, cursor }))
        .sort({ createdAt: -1, _id: -1 })
        .limit(limit + 1)
        .lean(),
      MessageModel.countDocuments(buildInboxFilter(userId, { status, q })),
    ]);
    const page = found.slice(0, limit);
    const last = page.at(-1);
    const nextCursor =
      found.length > limit && last ? encodeInboxCursor(last) : null;

    const messages = page.map((msg) => ({
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
      { success: true, messages, total, nextCursor },
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

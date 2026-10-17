import mongoose from "mongoose";
import type { NextRequest } from "next/server";
import {
  decodeInboxCursor,
  encodeInboxCursor,
} from "@/lib/messages/inbox-cursor";
import { isInboxQueryStatus } from "@/lib/messages/inbox-filter";
import { getSessionUserId, unauthorizedResponse } from "@/server/auth/session";
import dbConnect from "@/server/db/db-connect";
import { buildInboxFilter, parsePageSize } from "@/server/messages/inbox-query";
import MessageModel from "@/server/models/message.model";
import UserModel from "@/server/models/user.model";

const badRequest = (message: string) =>
  Response.json({ message, success: false }, { status: 400 });

/**
 * One page of the inbox for a filter + search, newest first, with a keyset
 * `nextCursor` and the `total` matching the filter (Chapter 16 §6).
 */
export async function GET(req: NextRequest): Promise<Response> {
  try {
    await dbConnect();
    const sessionUserId = await getSessionUserId();

    if (!sessionUserId) {
      return unauthorizedResponse();
    }

    if (!mongoose.Types.ObjectId.isValid(sessionUserId)) {
      return badRequest("Invalid user ID format");
    }

    const userId = new mongoose.Types.ObjectId(sessionUserId);
    const userExists = await UserModel.exists({ _id: userId });
    if (!userExists) {
      return Response.json(
        { message: "User not found", success: false },
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
      MessageModel.find(buildInboxFilter(userId, { cursor, q, status }))
        .sort({ _id: -1, createdAt: -1 })
        .limit(limit + 1)
        .lean(),
      MessageModel.countDocuments(buildInboxFilter(userId, { q, status })),
    ]);
    const page = found.slice(0, limit);
    const last = page.at(-1);
    const nextCursor =
      found.length > limit && last ? encodeInboxCursor(last) : null;

    const messages = page.map((msg) => ({
      _id: String(msg._id),
      content: msg.content,
      createdAt: new Date(msg.createdAt).toISOString(),
      isPinned: Boolean(msg.isPinned),
      isQuarantined: Boolean(msg.isQuarantined),
      isRead: Boolean(msg.isRead),
      reply: msg.reply
        ? {
            isPublished: Boolean(msg.reply.isPublished),
            publishedAt: msg.reply.publishedAt
              ? new Date(msg.reply.publishedAt).toISOString()
              : undefined,
            text: msg.reply.text,
          }
        : null,
      senderHash: msg.senderHash,
      sentimentTag: msg.sentimentTag || "neutral",
    }));

    return Response.json(
      { messages, nextCursor, success: true, total },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to get messages:", error);
    return Response.json(
      {
        message: "Failed to get messages - Internal Server Error",
        success: false,
      },
      { status: 500 }
    );
  }
}

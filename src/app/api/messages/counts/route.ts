import mongoose from "mongoose";
import { getSessionUserId, unauthorizedResponse } from "@/server/auth/session";
import dbConnect from "@/server/db/db-connect";
import {
  inboxCountsPipeline,
  toInboxCounts,
} from "@/server/messages/inbox-query";
import MessageModel from "@/server/models/message.model";

/**
 * Per-filter message counts for the inbox badges, the unread badge and
 * "Delete all N messages" (independent of how many pages are loaded).
 */
export async function GET(): Promise<Response> {
  try {
    await dbConnect();
    const userId = await getSessionUserId();
    if (!(userId && mongoose.Types.ObjectId.isValid(userId))) {
      return unauthorizedResponse();
    }

    const [row] = await MessageModel.aggregate(
      inboxCountsPipeline(new mongoose.Types.ObjectId(userId))
    );

    return Response.json(
      { counts: toInboxCounts(row), success: true },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to count messages:", error);
    return Response.json(
      { message: "Internal server error", success: false },
      { status: 500 }
    );
  }
}

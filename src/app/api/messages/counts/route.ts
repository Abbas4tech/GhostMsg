import mongoose from "mongoose";
import { getServerSession, type User } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
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
  await dbConnect();
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as User;
    if (!(user?._id && mongoose.Types.ObjectId.isValid(user._id as string))) {
      return Response.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    const [row] = await MessageModel.aggregate(
      inboxCountsPipeline(new mongoose.Types.ObjectId(user._id))
    );

    return Response.json(
      { success: true, counts: toInboxCounts(row) },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to count messages:", error);
    return Response.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

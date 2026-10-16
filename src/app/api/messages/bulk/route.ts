import mongoose from "mongoose";
import type { NextRequest } from "next/server";
import { bulkActionSchema } from "@/schemas/message-schema";
import { getSessionUserId, unauthorizedResponse } from "@/server/auth/session";
import dbConnect from "@/server/db/db-connect";
import MessageModel from "@/server/models/message.model";

export async function POST(request: NextRequest): Promise<Response> {
  try {
    await dbConnect();
    const userId = await getSessionUserId();
    if (!userId) {
      return unauthorizedResponse();
    }

    const body = await request.json();
    const parseResult = bulkActionSchema.safeParse(body);

    if (!parseResult.success) {
      return Response.json(
        { success: false, message: "Invalid bulk action payload" },
        { status: 400 }
      );
    }

    const { action, ids } = parseResult.data;
    const validIds = ids
      .filter((id) => mongoose.Types.ObjectId.isValid(id))
      .map((id) => new mongoose.Types.ObjectId(id));

    if (validIds.length === 0) {
      return Response.json(
        { success: false, message: "No valid message IDs provided" },
        { status: 400 }
      );
    }

    const filter = {
      _id: { $in: validIds },
      recipientId: userId,
    };

    if (action === "delete") {
      await MessageModel.deleteMany(filter);
    } else if (action === "read") {
      await MessageModel.updateMany(filter, { $set: { isRead: true } });
    } else if (action === "star") {
      await MessageModel.updateMany(filter, { $set: { isPinned: true } });
    }

    return Response.json(
      { success: true, message: `Bulk ${action} executed successfully` },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to execute bulk action:", error);
    return Response.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

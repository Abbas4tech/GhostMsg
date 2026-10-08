import mongoose from "mongoose";
import type { NextRequest } from "next/server";
import { getServerSession, type User } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import dbConnect from "@/lib/db-connect";
import MessageModel from "@/model/message.model";
import { bulkActionSchema } from "@/schemas/message-schema";

export async function POST(request: NextRequest): Promise<Response> {
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
      recipientId: user._id,
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

import type { NextRequest } from "next/server";
import { blockSenderSchema } from "@/schemas/message-schema";
import { getSessionUserId, unauthorizedResponse } from "@/server/auth/session";
import dbConnect from "@/server/db/db-connect";
import UserModel from "@/server/models/user.model";
import { toBlockedSenders } from "@/server/users/user-dto";

export async function GET(): Promise<Response> {
  try {
    await dbConnect();
    const userId = await getSessionUserId();

    if (!userId) {
      return unauthorizedResponse();
    }

    const userDoc = await UserModel.findById(userId).select(
      "blockedSenderHashes blockedSenders"
    );
    const hashes = userDoc?.blockedSenderHashes || [];

    return Response.json(
      {
        blockedSenderHashes: hashes,
        blockedSenders: toBlockedSenders(hashes, userDoc?.blockedSenders),
        success: true,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to fetch blocked senders:", error);
    return Response.json(
      { message: "Internal server error", success: false },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest): Promise<Response> {
  try {
    await dbConnect();
    const userId = await getSessionUserId();

    if (!userId) {
      return unauthorizedResponse();
    }

    const body = await request.json();
    const parseResult = blockSenderSchema.safeParse(body);

    if (!parseResult.success) {
      return Response.json(
        { message: "Invalid sender hash payload", success: false },
        { status: 400 }
      );
    }

    const { senderHash } = parseResult.data;

    // Record the date once; re-blocking keeps the original date.
    await UserModel.updateOne(
      { _id: userId, "blockedSenders.hash": { $ne: senderHash } },
      { $push: { blockedSenders: { blockedAt: new Date(), hash: senderHash } } }
    );
    await UserModel.updateOne(
      { _id: userId },
      { $addToSet: { blockedSenderHashes: senderHash } }
    );

    return Response.json(
      { message: "Sender blocked successfully", success: true },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to block sender:", error);
    return Response.json(
      { message: "Internal server error", success: false },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest): Promise<Response> {
  try {
    await dbConnect();
    const userId = await getSessionUserId();

    if (!userId) {
      return unauthorizedResponse();
    }

    const body = await request.json().catch(() => ({}));
    const senderHash = body.senderHash;

    if (senderHash === "ALL") {
      await UserModel.updateOne(
        { _id: userId },
        { $set: { blockedSenderHashes: [], blockedSenders: [] } }
      );
      return Response.json(
        { message: "All blocked senders cleared successfully", success: true },
        { status: 200 }
      );
    }

    const parseResult = blockSenderSchema.safeParse(body);

    if (!parseResult.success) {
      return Response.json(
        { message: "Invalid sender hash payload", success: false },
        { status: 400 }
      );
    }

    await UserModel.updateOne(
      { _id: userId },
      {
        $pull: {
          blockedSenderHashes: parseResult.data.senderHash,
          blockedSenders: { hash: parseResult.data.senderHash },
        },
      }
    );

    return Response.json(
      { message: "Sender unblocked successfully", success: true },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to unblock sender:", error);
    return Response.json(
      { message: "Internal server error", success: false },
      { status: 500 }
    );
  }
}

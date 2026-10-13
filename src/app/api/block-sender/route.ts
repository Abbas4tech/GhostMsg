import type { NextRequest } from "next/server";
import { getServerSession, type User } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import dbConnect from "@/lib/db-connect";
import UserModel from "@/model/user.model";
import { blockSenderSchema } from "@/schemas/message-schema";

export async function GET(): Promise<Response> {
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

    const userDoc = await UserModel.findById(user._id).select(
      "blockedSenderHashes"
    );

    return Response.json(
      {
        success: true,
        blockedSenderHashes: userDoc?.blockedSenderHashes || [],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to fetch blocked senders:", error);
    return Response.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

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
    const parseResult = blockSenderSchema.safeParse(body);

    if (!parseResult.success) {
      return Response.json(
        { success: false, message: "Invalid sender hash payload" },
        { status: 400 }
      );
    }

    const { senderHash } = parseResult.data;

    await UserModel.updateOne(
      { _id: user._id },
      { $addToSet: { blockedSenderHashes: senderHash } }
    );

    return Response.json(
      { success: true, message: "Sender blocked successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to block sender:", error);
    return Response.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest): Promise<Response> {
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

    const body = await request.json().catch(() => ({}));
    const senderHash = body.senderHash;

    if (senderHash === "ALL") {
      await UserModel.updateOne(
        { _id: user._id },
        { $set: { blockedSenderHashes: [] } }
      );
      return Response.json(
        { success: true, message: "All blocked senders cleared successfully" },
        { status: 200 }
      );
    }

    const parseResult = blockSenderSchema.safeParse(body);

    if (!parseResult.success) {
      return Response.json(
        { success: false, message: "Invalid sender hash payload" },
        { status: 400 }
      );
    }

    await UserModel.updateOne(
      { _id: user._id },
      { $pull: { blockedSenderHashes: parseResult.data.senderHash } }
    );

    return Response.json(
      { success: true, message: "Sender unblocked successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to unblock sender:", error);
    return Response.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

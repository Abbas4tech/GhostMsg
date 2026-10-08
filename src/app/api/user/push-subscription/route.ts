import type { NextRequest } from "next/server";
import { getServerSession, type User } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import dbConnect from "@/lib/db-connect";
import UserModel from "@/model/user.model";

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

    const subscription = await request.json();

    await UserModel.findByIdAndUpdate(user._id, {
      $set: { "notificationSettings.webPushEnabled": true },
      $addToSet: { pushSubscriptions: subscription },
    });

    return Response.json(
      { success: true, message: "Push subscription registered" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to register push subscription:", error);
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

    const { endpoint } = await request.json();

    await UserModel.findByIdAndUpdate(user._id, {
      $pull: { pushSubscriptions: { endpoint } },
    });

    return Response.json(
      { success: true, message: "Push subscription removed" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to remove push subscription:", error);
    return Response.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

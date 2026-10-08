import type { NextRequest } from "next/server";
import { getServerSession, type User } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import dbConnect from "@/lib/db-connect";
import UserModel from "@/model/user.model";

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
      "notificationSettings isAcceptingMessage"
    );

    return Response.json(
      {
        success: true,
        notificationSettings: userDoc?.notificationSettings || {
          emailAlerts: "instant",
          webPushEnabled: false,
        },
        isAcceptingMessage: userDoc?.isAcceptingMessage ?? true,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to fetch notification settings:", error);
    return Response.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest): Promise<Response> {
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
    const { emailAlerts, webPushEnabled } = body;

    const updateFields: Record<string, unknown> = {};
    if (["instant", "daily", "off"].includes(emailAlerts)) {
      updateFields["notificationSettings.emailAlerts"] = emailAlerts;
    }
    if (typeof webPushEnabled === "boolean") {
      updateFields["notificationSettings.webPushEnabled"] = webPushEnabled;
    }

    const updated = await UserModel.findByIdAndUpdate(
      user._id,
      { $set: updateFields },
      { new: true }
    ).select("notificationSettings");

    return Response.json(
      {
        success: true,
        message: "Notification settings updated successfully!",
        notificationSettings: updated?.notificationSettings,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to update notification settings:", error);
    return Response.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

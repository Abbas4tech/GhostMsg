import type { NextRequest } from "next/server";
import { updateNotificationsRequestSchema } from "@/schemas/notification-schema";
import { getSessionUserId, unauthorizedResponse } from "@/server/auth/session";
import dbConnect from "@/server/db/db-connect";
import UserModel from "@/server/models/user.model";
import { toNotificationSettings } from "@/server/users/user-dto";

export async function GET(): Promise<Response> {
  try {
    await dbConnect();
    const userId = await getSessionUserId();
    if (!userId) {
      return unauthorizedResponse();
    }

    const userDoc = await UserModel.findById(userId).select(
      "notificationSettings isAcceptingMessage"
    );

    return Response.json(
      {
        isAcceptingMessage: userDoc?.isAcceptingMessage ?? true,
        notificationSettings: toNotificationSettings(
          userDoc?.notificationSettings
        ),
        success: true,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to fetch notification settings:", error);
    return Response.json(
      { message: "Internal server error", success: false },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest): Promise<Response> {
  try {
    await dbConnect();
    const userId = await getSessionUserId();
    if (!userId) {
      return unauthorizedResponse();
    }

    const parsed = updateNotificationsRequestSchema.safeParse(
      await request.json()
    );
    if (!parsed.success) {
      return Response.json(
        { message: "Invalid notification settings", success: false },
        { status: 400 }
      );
    }

    // Dot paths so one control never resets its siblings.
    const updateFields: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(parsed.data)) {
      if (value !== undefined) {
        updateFields[`notificationSettings.${key}`] = value;
      }
    }

    const updated = await UserModel.findByIdAndUpdate(
      userId,
      { $set: updateFields },
      { new: true }
    ).select("notificationSettings");

    return Response.json(
      {
        message: "Notification settings updated successfully!",
        notificationSettings: toNotificationSettings(
          updated?.notificationSettings
        ),
        success: true,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to update notification settings:", error);
    return Response.json(
      { message: "Internal server error", success: false },
      { status: 500 }
    );
  }
}

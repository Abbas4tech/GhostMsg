import type { NextRequest } from "next/server";
import { getServerSession, type User } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import {
  pushSubscriptionRequestSchema,
  pushUnsubscribeRequestSchema,
} from "@/schemas/notification-schema";
import dbConnect from "@/server/db/db-connect";
import UserModel from "@/server/models/user.model";
import { disablePushWhenNoDevices } from "@/server/push/web-push";

async function getSessionUserId(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  const user = session?.user as User | undefined;
  return user?._id ? String(user._id) : null;
}

const notAuthenticated = () =>
  Response.json(
    { success: false, message: "Not authenticated" },
    { status: 401 }
  );

const invalidPayload = (message: string) =>
  Response.json({ success: false, message }, { status: 400 });

export async function POST(request: NextRequest): Promise<Response> {
  await dbConnect();
  try {
    const userId = await getSessionUserId();
    if (!userId) {
      return notAuthenticated();
    }

    const parsed = pushSubscriptionRequestSchema.safeParse(
      await request.json()
    );
    if (!parsed.success) {
      return invalidPayload("Invalid push subscription");
    }
    const { endpoint, keys } = parsed.data;

    // Replace any previous record for this device (keys rotate on resubscribe).
    await UserModel.updateOne(
      { _id: userId },
      { $pull: { pushSubscriptions: { endpoint } } }
    );
    await UserModel.updateOne(
      { _id: userId },
      {
        $set: { "notificationSettings.webPushEnabled": true },
        $push: {
          pushSubscriptions: { endpoint, keys, createdAt: new Date() },
        },
      }
    );

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
    const userId = await getSessionUserId();
    if (!userId) {
      return notAuthenticated();
    }

    const parsed = pushUnsubscribeRequestSchema.safeParse(await request.json());
    if (!parsed.success) {
      return invalidPayload("Invalid push subscription endpoint");
    }

    await UserModel.updateOne(
      { _id: userId },
      { $pull: { pushSubscriptions: { endpoint: parsed.data.endpoint } } }
    );
    // Push stays on while any other device is still subscribed.
    await disablePushWhenNoDevices(userId);

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

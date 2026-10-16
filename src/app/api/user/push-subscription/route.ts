import type { NextRequest } from "next/server";
import {
  pushSubscriptionRequestSchema,
  pushUnsubscribeRequestSchema,
} from "@/schemas/notification-schema";
import {
  getSessionUserId,
  unauthorizedResponse as notAuthenticated,
} from "@/server/auth/session";
import dbConnect from "@/server/db/db-connect";
import UserModel from "@/server/models/user.model";
import { disablePushWhenNoDevices } from "@/server/push/web-push";

const invalidPayload = (message: string) =>
  Response.json({ message, success: false }, { status: 400 });

export async function POST(request: NextRequest): Promise<Response> {
  try {
    await dbConnect();
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
        $push: {
          pushSubscriptions: { createdAt: new Date(), endpoint, keys },
        },
        $set: { "notificationSettings.webPushEnabled": true },
      }
    );

    return Response.json(
      { message: "Push subscription registered", success: true },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to register push subscription:", error);
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
      { message: "Push subscription removed", success: true },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to remove push subscription:", error);
    return Response.json(
      { message: "Internal server error", success: false },
      { status: 500 }
    );
  }
}

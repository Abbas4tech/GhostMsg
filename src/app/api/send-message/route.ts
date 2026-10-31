import type { NextRequest } from "next/server";
import { moderateAndClassifyMessage } from "@/server/ai/moderation";
import {
  shouldQuarantine,
  toQuarantineReason,
} from "@/server/ai/quarantine-policy";
import dbConnect from "@/server/db/db-connect";
import { sendMessageAlertEmail } from "@/server/email/send-message-alert-email";
import MessageModel from "@/server/models/message.model";
import UserModel from "@/server/models/user.model";
import {
  buildAlertPreview,
  isWithinQuietHours,
} from "@/server/notifications/delivery-policy";
import { sendPushToUser } from "@/server/push/web-push";
import { publishNewMessage } from "@/server/realtime/event-bus";
import { checkRateLimit, computeSenderHash } from "@/server/security/security";

export async function POST(req: NextRequest): Promise<Response> {
  try {
    await dbConnect();
    const body = await req.json();
    const { username, content } = body;

    if (
      !(username && content) ||
      content.trim().length < 10 ||
      content.trim().length > 300
    ) {
      return Response.json(
        {
          message: "Message content must be between 10 and 300 characters",
          success: false,
        },
        { status: 400 }
      );
    }

    // 1. Find recipient (projected: this is the hottest write path, and the
    // document otherwise carries an avatar blob and unbounded block lists).
    const user = await UserModel.findOne({ username }).select(
      "username email isAcceptingMessage safetySettings notificationSettings pushSubscriptions"
    );
    if (!user) {
      return Response.json(
        {
          message: "Recipient not found",
          success: false,
        },
        { status: 404 }
      );
    }

    if (!user.isAcceptingMessage) {
      return Response.json(
        {
          message: "Recipient is not accepting messages at this time",
          success: false,
        },
        { status: 404 }
      );
    }

    // 2. Extract Client IP and verify sliding window rate limit
    const forwardedFor = req.headers.get("x-forwarded-for");
    const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : "127.0.0.1";

    const rateLimit = await checkRateLimit(`send-msg:${ip}`, 5, 600_000);
    if (!rateLimit.success) {
      return Response.json(
        {
          message:
            "Too many messages sent. Please wait a few minutes before trying again.",
          success: false,
        },
        { status: 429 }
      );
    }

    // 3. Compute Salted Sender Hash & Check Recipient Blocklist
    const senderHash = computeSenderHash(ip, String(user._id));
    if (user?.blockedSenderHashes?.includes(senderHash)) {
      // Silent shadowban: return 200 OK so attacker is unaware they are blocked, but drop the payload
      return Response.json(
        {
          message: "Message sent successfully!",
          success: true,
        },
        { status: 200 }
      );
    }

    // 4. Synchronous AI Moderation & Sentiment Classification
    const moderation = await moderateAndClassifyMessage(content.trim());
    // The recipient's Safety settings decide what is held back.
    const isQuarantined = shouldQuarantine(
      moderation.toxicity,
      user.safetySettings
    );

    // 5. Create Standalone Message Document
    const messageDoc = await MessageModel.create({
      content: content.trim(),
      isArchived: false,
      isPinned: false,
      isQuarantined,
      ...(isQuarantined
        ? { quarantineReason: toQuarantineReason(moderation.category) }
        : {}),
      isRead: false,
      recipientId: user._id,
      senderHash,
      sentimentTag: moderation.sentimentTag,
    });

    // 6. Publish real-time event
    publishNewMessage(String(user._id), {
      _id: String(messageDoc._id),
      content: messageDoc.content,
      createdAt: messageDoc.createdAt.toISOString(),
      isArchived: false,
      isPinned: messageDoc.isPinned,
      isQuarantined: messageDoc.isQuarantined,
      isRead: messageDoc.isRead,
      quarantineReason: messageDoc.quarantineReason,
      sentimentTag: messageDoc.sentimentTag,
    });

    // 7–8. Alerts: never for quarantined messages or during quiet hours;
    // the text is hidden unless the recipient opted to show it.
    const settings = user.notificationSettings;
    const canAlert = !(
      isQuarantined || isWithinQuietHours(new Date(), settings?.quietHours)
    );
    const hideText = settings?.hideMessageText ?? true;
    const preview = buildAlertPreview(messageDoc.content, hideText);

    if (canAlert && user.email && settings?.emailAlerts === "instant") {
      sendMessageAlertEmail({
        email: user.email,
        preview: hideText ? null : preview,
        sentimentTag: messageDoc.sentimentTag,
        username: user.username,
      }).catch((e) => console.warn("Email alert error:", e));
    }

    if (
      canAlert &&
      settings?.webPushEnabled &&
      user.pushSubscriptions?.length
    ) {
      sendPushToUser(String(user._id), user.pushSubscriptions, {
        body: preview,
        title: "New anonymous message 👻",
        url: "/dashboard",
      }).catch((e) => console.warn("Web push error:", e));
    }

    return Response.json(
      {
        message: "Message sent successfully!",
        success: true,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to send message:", error);
    return Response.json(
      {
        message: "Failed to send message - Internal Server Error",
        success: false,
      },
      { status: 500 }
    );
  }
}

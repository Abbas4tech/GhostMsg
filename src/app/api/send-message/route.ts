import type { NextRequest } from "next/server";
import { sendMessageAlertEmail } from "@/helpers/send-message-alert-email";
import { moderateAndClassifyMessage } from "@/lib/ai-moderation";
import dbConnect from "@/lib/db-connect";
import { publishNewMessage } from "@/lib/event-bus";
import { checkRateLimit, computeSenderHash } from "@/lib/security";
import MessageModel from "@/model/message.model";
import UserModel from "@/model/user.model";

export async function POST(req: NextRequest): Promise<Response> {
  await dbConnect();
  try {
    const body = await req.json();
    const { username, content } = body;

    if (
      !(username && content) ||
      content.trim().length < 10 ||
      content.trim().length > 300
    ) {
      return Response.json(
        {
          success: false,
          message: "Message content must be between 10 and 300 characters",
        },
        { status: 400 }
      );
    }

    // 1. Find recipient
    const user = await UserModel.findOne({ username });
    if (!user) {
      return Response.json(
        {
          success: false,
          message: "Recipient not found",
        },
        { status: 404 }
      );
    }

    if (!user.isAcceptingMessage) {
      return Response.json(
        {
          success: false,
          message: "Recipient is not accepting messages at this time",
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
          success: false,
          message:
            "Too many messages sent. Please wait a few minutes before trying again.",
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
          success: true,
          message: "Message sent successfully!",
        },
        { status: 200 }
      );
    }

    // 4. Synchronous AI Moderation & Sentiment Classification
    const moderation = await moderateAndClassifyMessage(content.trim());

    // 5. Create Standalone Message Document
    const messageDoc = await MessageModel.create({
      recipientId: user._id,
      content: content.trim(),
      sentimentTag: moderation.sentimentTag,
      isQuarantined: moderation.isToxic,
      isPinned: false,
      isRead: false,
      senderHash,
    });

    // 6. Publish real-time event
    publishNewMessage(String(user._id), {
      _id: String(messageDoc._id),
      content: messageDoc.content,
      sentimentTag: messageDoc.sentimentTag,
      isQuarantined: messageDoc.isQuarantined,
      isPinned: messageDoc.isPinned,
      isRead: messageDoc.isRead,
      createdAt: messageDoc.createdAt.toISOString(),
    });

    // 7. Dispatch instant email alert if enabled and not quarantined
    if (
      user.email &&
      user.notificationSettings?.emailAlerts === "instant" &&
      !moderation.isToxic
    ) {
      sendMessageAlertEmail(
        user.email,
        user.username,
        messageDoc.content,
        messageDoc.sentimentTag
      ).catch((e) => console.warn("Email alert error:", e));
    }

    return Response.json(
      {
        success: true,
        message: "Message sent successfully!",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to send message:", error);
    return Response.json(
      {
        success: false,
        message: "Failed to send message - Internal Server Error",
      },
      { status: 500 }
    );
  }
}

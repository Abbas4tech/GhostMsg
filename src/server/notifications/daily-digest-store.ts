import "server-only";
import { sendDailyDigestEmail } from "@/server/email/send-daily-digest-email";
import MessageModel from "@/server/models/message.model";
import UserModel from "@/server/models/user.model";
import { type DailyDigestDeps, DIGEST_PREVIEW_COUNT } from "./daily-digest";

/** MongoDB + SMTP implementation of the daily digest dependencies. */
export function createMongoDigestDeps(): DailyDigestDeps {
  return {
    loadRecipients: async () => {
      const users = await UserModel.find({
        "notificationSettings.emailAlerts": "daily",
        isVerified: true,
      })
        .select("email username notificationSettings lastDigestSentAt")
        .lean();
      return users
        .filter((user) => Boolean(user.email))
        .map((user) => ({
          id: String(user._id),
          email: user.email,
          username: user.username,
          hideMessageText: user.notificationSettings?.hideMessageText ?? true,
          quietHours: user.notificationSettings?.quietHours,
          lastDigestSentAt: user.lastDigestSentAt ?? null,
        }));
    },

    loadNewMessages: async (recipientId, since) => {
      const filter = {
        recipientId,
        isQuarantined: false,
        createdAt: { $gt: since },
      };
      const [total, recent] = await Promise.all([
        MessageModel.countDocuments(filter),
        MessageModel.find(filter)
          .sort({ createdAt: -1 })
          .limit(DIGEST_PREVIEW_COUNT)
          .select("content sentimentTag")
          .lean(),
      ]);
      return {
        total,
        recent: recent.map((message) => ({
          content: message.content,
          sentimentTag: message.sentimentTag,
        })),
      };
    },

    sendDigest: async (recipient, summary) => {
      const result = await sendDailyDigestEmail({
        email: recipient.email,
        username: recipient.username,
        summary,
      });
      return result.success;
    },

    markSent: async (recipientId, at) => {
      await UserModel.updateOne(
        { _id: recipientId },
        { $set: { lastDigestSentAt: at } }
      );
    },
  };
}

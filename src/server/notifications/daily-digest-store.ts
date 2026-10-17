import "server-only";
import { sendDailyDigestEmail } from "@/server/email/send-daily-digest-email";
import MessageModel from "@/server/models/message.model";
import UserModel from "@/server/models/user.model";
import { type DailyDigestDeps, DIGEST_PREVIEW_COUNT } from "./daily-digest";

/** MongoDB + SMTP implementation of the daily digest dependencies. */
export function createMongoDigestDeps(): DailyDigestDeps {
  return {
    loadNewMessages: async (recipientId, since) => {
      const filter = {
        createdAt: { $gt: since },
        isQuarantined: false,
        recipientId,
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
        recent: recent.map((message) => ({
          content: message.content,
          sentimentTag: message.sentimentTag,
        })),
        total,
      };
    },
    loadRecipients: async () => {
      const users = await UserModel.find({
        isVerified: true,
        "notificationSettings.emailAlerts": "daily",
      })
        .select("email username notificationSettings lastDigestSentAt")
        .lean();
      return users
        .filter((user) => Boolean(user.email))
        .map((user) => ({
          email: user.email,
          hideMessageText: user.notificationSettings?.hideMessageText ?? true,
          id: String(user._id),
          lastDigestSentAt: user.lastDigestSentAt ?? null,
          quietHours: user.notificationSettings?.quietHours,
          username: user.username,
        }));
    },

    markSent: async (recipientId, at) => {
      await UserModel.updateOne(
        { _id: recipientId },
        { $set: { lastDigestSentAt: at } }
      );
    },

    sendDigest: async (recipient, summary) => {
      const result = await sendDailyDigestEmail({
        email: recipient.email,
        summary,
        username: recipient.username,
      });
      return result.success;
    },
  };
}

import "server-only";
import { cache } from "react";
import dbConnect from "@/server/db/db-connect";
import MessageModel from "@/server/models/message.model";
import UserModel from "@/server/models/user.model";
import { DEFAULT_AMA_PROMPT } from "./user-dto";

const PUBLIC_ANSWERS_LIMIT = 50;

/**
 * Everything `/u/[username]` shows, in the exact JSON shape of
 * `GET /api/public/{username}/answers`. Only public fields (Chapter 17, S8).
 * Cached per request so the page and its metadata share one lookup.
 */
export const getPublicProfile = cache(async (username: string) => {
  await dbConnect();
  // Projected to just what this page needs: still includes avatarUrl (it's
  // rendered here), but drops email, password, blocked-sender lists and
  // push subscriptions, which this route never reads.
  const user = await UserModel.findOne({ username }).select(
    "username amaPrompt displayName avatarUrl showAmaBanner messagePreferences.offerSuggestions isAcceptingMessage"
  );
  if (!user) {
    return null;
  }

  const answers = await MessageModel.find({
    recipientId: user._id,
    "reply.isPublished": true,
  })
    .sort({ "reply.publishedAt": -1, createdAt: -1 })
    .limit(PUBLIC_ANSWERS_LIMIT)
    .lean();

  return {
    success: true,
    username: user.username,
    amaPrompt: user.amaPrompt || DEFAULT_AMA_PROMPT,
    displayName: user.displayName || undefined,
    avatarUrl: user.avatarUrl ?? null,
    showAmaBanner: user.showAmaBanner ?? true,
    offerSuggestions: user.messagePreferences?.offerSuggestions ?? true,
    isAcceptingMessages: user.isAcceptingMessage,
    answers: answers.map((item) => ({
      _id: String(item._id),
      content: item.content,
      sentimentTag: item.sentimentTag || "neutral",
      reply: {
        text: item.reply?.text || "",
        publishedAt: item.reply?.publishedAt
          ? new Date(item.reply.publishedAt).toISOString()
          : undefined,
      },
      createdAt: new Date(item.createdAt).toISOString(),
    })),
  };
});

export type PublicProfileData = NonNullable<
  Awaited<ReturnType<typeof getPublicProfile>>
>;

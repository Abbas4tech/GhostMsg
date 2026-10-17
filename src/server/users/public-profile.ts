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
    .sort({ createdAt: -1, "reply.publishedAt": -1 })
    .limit(PUBLIC_ANSWERS_LIMIT)
    .lean();

  return {
    amaPrompt: user.amaPrompt || DEFAULT_AMA_PROMPT,
    answers: answers.map((item) => ({
      _id: String(item._id),
      content: item.content,
      createdAt: new Date(item.createdAt).toISOString(),
      reply: {
        publishedAt: item.reply?.publishedAt
          ? new Date(item.reply.publishedAt).toISOString()
          : undefined,
        text: item.reply?.text || "",
      },
      sentimentTag: item.sentimentTag || "neutral",
    })),
    avatarUrl: user.avatarUrl ?? null,
    displayName: user.displayName || undefined,
    isAcceptingMessages: user.isAcceptingMessage,
    offerSuggestions: user.messagePreferences?.offerSuggestions ?? true,
    showAmaBanner: user.showAmaBanner ?? true,
    success: true,
    username: user.username,
  };
});

export type PublicProfileData = NonNullable<
  Awaited<ReturnType<typeof getPublicProfile>>
>;

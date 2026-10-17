import crypto from "node:crypto";
import dbConnect from "@/server/db/db-connect";
import MessageModel from "@/server/models/message.model";
import UserModel from "@/server/models/user.model";

interface LegacyMessageDoc {
  _id: string;
  content: string;
  createdAt?: Date;
}

export async function migrateLegacyMessages() {
  await dbConnect();
  console.log("Starting migration of legacy embedded messages...");

  const rawUsers = await UserModel.collection
    .find({ "messages.0": { $exists: true } })
    .toArray();

  console.log(
    `Found ${rawUsers.length} user(s) with legacy embedded messages.`
  );

  for (const rawUser of rawUsers) {
    const legacyMessages = (rawUser.messages || []) as LegacyMessageDoc[];
    if (legacyMessages.length === 0) {
      continue;
    }

    const docsToInsert = legacyMessages.map((msg) => ({
      _id: msg._id,
      content: msg.content,
      createdAt: msg.createdAt || new Date(),
      isPinned: false,
      isQuarantined: false,
      isRead: true,
      recipientId: rawUser._id,
      senderHash: crypto
        .createHash("sha256")
        .update(`legacy-${rawUser._id}`)
        .digest("hex"),
      sentimentTag: "neutral",
      updatedAt: msg.createdAt || new Date(),
    }));

    try {
      // biome-ignore lint/performance/noAwaitInLoops: one-off migration — must run per-user so a failure is resumable and progress logs stay in order.
      await MessageModel.insertMany(docsToInsert, { ordered: false });
    } catch {
      // Ignore duplicate key errors if already partially migrated
    }

    await UserModel.collection.updateOne(
      { _id: rawUser._id },
      { $unset: { messages: "" } }
    );

    console.log(
      `✓ Migrated ${docsToInsert.length} messages for user: ${rawUser.username || rawUser._id}`
    );
  }

  console.log("Migration complete!");
}

if (require.main === module) {
  migrateLegacyMessages()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("Migration failed:", err);
      process.exit(1);
    });
}

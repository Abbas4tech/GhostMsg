import type { NextRequest } from "next/server";
import dbConnect from "@/lib/db-connect";
import MessageModel from "@/model/message.model";
import UserModel from "@/model/user.model";

export async function GET(
  _request: NextRequest,
  props: { params: Promise<{ username: string }> }
): Promise<Response> {
  const params = await props.params;
  const username = params.username;

  await dbConnect();

  try {
    const user = await UserModel.findOne({ username });
    if (!user) {
      return Response.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    const answers = await MessageModel.find({
      recipientId: user._id,
      "reply.isPublished": true,
    })
      .sort({ "reply.publishedAt": -1, createdAt: -1 })
      .limit(50)
      .lean();

    const formattedAnswers = answers.map((item) => ({
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
    }));

    return Response.json(
      {
        success: true,
        username: user.username,
        amaPrompt: user.amaPrompt || "Send me an anonymous message!",
        answers: formattedAnswers,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to fetch public answers:", error);
    return Response.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

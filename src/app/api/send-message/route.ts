import { NextRequest } from "next/server";

import dbConnect from "@/lib/dbConnect";
import UserModel, { Message } from "@/model/User";

export async function POST(req: NextRequest): Promise<Response> {
  await dbConnect();
  const { username, content } = await req.json();
  try {
    const user = await UserModel.findOne({ username });

    if (!user) {
      return Response.json(
        {
          success: false,
          message: "Failed to send message - User not found",
        },
        {
          status: 404,
        }
      );
    }

    if (!user.isAcceptingMessage) {
      return Response.json(
        {
          success: false,
          message: "Failed to send message - User is not accepting messages",
        },
        {
          status: 404,
        }
      );
    }

    const newMessage = {
      content,
      createdAt: new Date(),
    };

    user.messages.push(newMessage as Message);

    await user.save();

    return Response.json(
      {
        success: true,
        message: "Message sent successfully!",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to send message - Internal Server Error: ", error);
    return Response.json(
      {
        success: false,
        message: "Failed to send message - Internal Server Error",
      },
      {
        status: 500,
      }
    );
  }
}

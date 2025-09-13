import { getServerSession, User } from "next-auth";
import mongoose from "mongoose";

import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";

import { authOptions } from "../auth/[...nextauth]/options";

export async function GET(): Promise<Response> {
  await dbConnect();
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as User;

    if (!user || !session?.user) {
      return Response.json(
        {
          success: false,
          message: "Not authenticated, Please login first!",
        },
        {
          status: 401,
        }
      );
    }

    const userId = new mongoose.Types.ObjectId(user._id);

    const aggregatedUser = await UserModel.aggregate([
      {
        $match: { id: userId },
      },
      {
        $unwind: "$messages",
      },
      {
        $sort: { "messages.createdAt": -1 },
      },
      {
        $group: { _id: "$_id", messages: { $push: "$messages" } },
      },
    ]);

    if (!aggregatedUser || aggregatedUser.length === 0) {
      return Response.json(
        {
          success: false,
          message: "User not found",
        },
        {
          status: 500,
        }
      );
    }

    return Response.json(
      {
        success: true,
        messages: aggregatedUser[0].messages,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("Failed to get messages - Internal Server Error: ", error);
    return Response.json(
      {
        success: false,
        message: "Failed to get messages - Internal Server Error",
      },
      {
        status: 500,
      }
    );
  }
}

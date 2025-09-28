import mongoose from "mongoose";

import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { getCurrentUser } from "@/helpers/currentUser";

export async function GET(): Promise<Response> {
  await dbConnect();
  try {
    const response = await getCurrentUser();
    if (response instanceof Response) {
      return response;
    }

    if (!mongoose.Types.ObjectId.isValid(response._id as string)) {
      return Response.json(
        { success: false, message: "Invalid user ID format" },
        { status: 400 }
      );
    }

    const userId = new mongoose.Types.ObjectId(response._id);

    const userExists = await UserModel.exists({ _id: userId });
    if (!userExists) {
      return Response.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    const aggregatedUser = await UserModel.aggregate([
      { $match: { _id: userId } },
      { $unwind: "$messages" },
      { $sort: { "messages.createdAt": -1 } },
      { $group: { _id: "$_id", messages: { $push: "$messages" } } },
    ]);

    if (aggregatedUser.length === 0) {
      return Response.json({ success: true, messages: [] }, { status: 200 });
    }

    return Response.json(
      { success: true, messages: aggregatedUser[0].messages },
      { status: 200 }
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

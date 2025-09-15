import { getServerSession, User } from "next-auth";
import { NextRequest } from "next/server";

import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";

import { authOptions } from "../../auth/[...nextauth]/options";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ messageId: string }> }
): Promise<Response> {
  await dbConnect();
  try {
    const { messageId } = await params;

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

    const updatedResult = await UserModel.updateOne(
      { _id: user._id },
      { $pull: { messages: { _id: messageId } } }
    );

    if (updatedResult.modifiedCount === 0) {
      return Response.json(
        {
          success: false,
          message: "Message not found, or Already Deleted!",
        },
        {
          status: 404,
        }
      );
    }

    return Response.json(
      {
        success: true,
        message: "Message deleted successfully!",
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("Failed to delete message - Internal Server Error: ", error);
    return Response.json(
      {
        success: false,
        message: "Failed to delete message - Internal Server Error",
      },
      {
        status: 500,
      }
    );
  }
}

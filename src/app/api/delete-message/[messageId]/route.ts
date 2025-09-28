import { NextRequest } from "next/server";

import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { getCurrentUser } from "@/helpers/currentUser";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ messageId: string }> }
): Promise<Response> {
  await dbConnect();
  try {
    const { messageId } = await params;

    const response = await getCurrentUser();
    if (response instanceof Response) {
      return response;
    }

    const updatedResult = await UserModel.updateOne(
      { _id: response._id },
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

import type { NextRequest } from "next/server";
import { acceptMessageSchema } from "@/schemas/accept-message-schema";
import { getSessionUserId, unauthorizedResponse } from "@/server/auth/session";
import dbConnect from "@/server/db/db-connect";
import UserModel from "@/server/models/user.model";

export async function POST(req: NextRequest): Promise<Response> {
  try {
    await dbConnect();
    const userId = await getSessionUserId();

    if (!userId) {
      return unauthorizedResponse();
    }

    const { acceptMessages } = await req.json();

    const res = acceptMessageSchema.safeParse({ acceptMessages });

    if (!res.success) {
      return Response.json(
        {
          message: "Invalid acceptMessages value",
          success: false,
        },
        {
          status: 400,
        }
      );
    }

    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { isAcceptingMessage: res.data.acceptMessages },
      { new: true }
    ).select("isAcceptingMessage");

    if (!updatedUser) {
      return Response.json(
        {
          message:
            "Failed to update user status to accept messages - Updated User not found",
          success: false,
        },
        {
          status: 401,
        }
      );
    }

    return Response.json(
      {
        message: "Message acceptance status updated successfully!",
        success: true,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "Failed to update user status to accept messages - Internal Server Error: ",
      error
    );
    return Response.json(
      {
        message:
          "Failed to update user status to accept messages - Internal Server Error",
        success: false,
      },
      {
        status: 500,
      }
    );
  }
}

export async function GET(): Promise<Response> {
  try {
    await dbConnect();
    const userId = await getSessionUserId();

    if (!userId) {
      return unauthorizedResponse();
    }

    const foundUser =
      await UserModel.findById(userId).select("isAcceptingMessage");

    if (!foundUser) {
      return Response.json(
        {
          message: "User not found",
          success: false,
        },
        {
          status: 404,
        }
      );
    }

    return Response.json(
      {
        isAcceptingMessage: foundUser.isAcceptingMessage,
        message: "Message acceptance status fetched successfully!",
        success: true,
      },

      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "Failed to get user status to accept messages - Internal Server Error: ",
      error
    );
    return Response.json(
      {
        message:
          "Failed to get user status to accept messages - Internal Server Error",
        success: false,
      },
      {
        status: 500,
      }
    );
  }
}

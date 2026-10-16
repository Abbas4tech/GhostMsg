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
          success: false,
          message: "Invalid acceptMessages value",
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
          success: false,
          message:
            "Failed to update user status to accept messages - Updated User not found",
        },
        {
          status: 401,
        }
      );
    }

    return Response.json(
      {
        success: true,
        message: "Message acceptance status updated successfully!",
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
        success: false,
        message:
          "Failed to update user status to accept messages - Internal Server Error",
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
          success: false,
          message: "User not found",
        },
        {
          status: 404,
        }
      );
    }

    return Response.json(
      {
        success: true,
        message: "Message acceptance status fetched successfully!",
        isAcceptingMessage: foundUser.isAcceptingMessage,
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
        success: false,
        message:
          "Failed to get user status to accept messages - Internal Server Error",
      },
      {
        status: 500,
      }
    );
  }
}

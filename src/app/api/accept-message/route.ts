import { getServerSession, User } from "next-auth";
import { NextRequest } from "next/server";

import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";

import { authOptions } from "../auth/[...nextauth]/options";

export async function POST(req: NextRequest): Promise<Response> {
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
          status: 400,
        }
      );
    }

    const userId = user._id;
    const { acceptMessages } = await req.json();

    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { isAcceptingMessage: Boolean(acceptMessages) },
      { new: true }
    );

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
        updatedUser,
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
          status: 400,
        }
      );
    }

    const userId = user._id;

    const foundUser = await UserModel.findById(userId);

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

import { NextResponse } from "next/server";

import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";

export async function POST(req: NextResponse): Promise<Response> {
  await dbConnect();

  try {
    const { username, code } = await req.json();

    const user = await UserModel.findOne({
      username,
    });

    if (!user) {
      return Response.json(
        {
          success: false,
          message: "User not found!!",
        },
        {
          status: 404,
        }
      );
    }

    const isCodeValid = user.verifyCode === code;
    const isCodeExpired = new Date(user.verifyCodeExpiry) > new Date();

    if (isCodeValid && isCodeExpired) {
      user.isVerified = true;
      await user.save();
      return Response.json(
        {
          success: true,
          message: "Account Verified Successfully!",
        },
        { status: 200 }
      );
    } else if (!isCodeExpired) {
      return Response.json(
        {
          success: false,
          message:
            "Verification code has expired. Please signup again to get a new code",
        },
        { status: 400 }
      );
    } else {
      return Response.json(
        {
          success: false,
          message: "Verify is code is incorrect",
        },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error("Error verifying code: ", error);
    return Response.json(
      {
        success: false,
        message: "Error verifying code: Internal server error",
      },
      {
        status: 500,
      }
    );
  }
}

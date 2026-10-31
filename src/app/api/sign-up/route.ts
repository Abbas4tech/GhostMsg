import bcrypt from "bcryptjs";
import type { NextRequest } from "next/server";
import dbConnect from "@/server/db/db-connect";
import { sendVerificationEmail } from "@/server/email/send-verification-email";
import UserModel from "@/server/models/user.model";
import { issueVerificationCode } from "@/server/users/verification-code";
export async function POST(req: NextRequest): Promise<Response> {
  try {
    await dbConnect();
    const { username, email, password } = await req.json();
    const existingUserVerifiedByUsername = await UserModel.findOne({
      isVerified: true,
      username,
    });
    if (existingUserVerifiedByUsername) {
      return Response.json(
        {
          message: "Username is already taken",
          success: false,
        },
        { status: 400 }
      );
    }

    const existingUserByEmail = await UserModel.findOne({ email });

    const issued = issueVerificationCode();
    const { verifyCode } = issued;

    if (existingUserByEmail) {
      if (existingUserByEmail.isVerified) {
        return Response.json(
          {
            message: "User already exist with this email",
            success: false,
          },
          {
            status: 400,
          }
        );
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      existingUserByEmail.password = hashedPassword;
      Object.assign(existingUserByEmail, issued);

      await existingUserByEmail.save();
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new UserModel({
        email,
        isAcceptingMessage: true,
        isVerified: false,
        messages: [],
        password: hashedPassword,
        username,
        ...issued,
      });

      await newUser.save();
    }

    //Send Verification Email
    const emailResponse = await sendVerificationEmail(
      email,
      username,
      verifyCode
    );

    if (!emailResponse.success) {
      return Response.json(
        {
          message: emailResponse.message,
          success: false,
        },
        {
          status: 500,
        }
      );
    }

    return Response.json(
      {
        message: "User registered successfully. Please verify your email",
        success: true,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error("Internal Server Error", error);
    return Response.json(
      {
        message: "Internal Server Error",
        success: false,
      },
      {
        status: 500,
      }
    );
  }
}

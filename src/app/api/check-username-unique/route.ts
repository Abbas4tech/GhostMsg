import { NextRequest } from "next/server";
import z from "zod";

import dbConnect from "@/lib/dbConnect";
import { usernameValidation } from "@/schemas/signUpSchema";
import UserModel from "@/model/User";

const usernameQuerySchema = z.object({
  username: usernameValidation,
});

export async function GET(req: NextRequest): Promise<Response> {
  await dbConnect();

  try {
    const { searchParams } = req.nextUrl;

    const queryParams = {
      username: searchParams.get("username"),
    };

    const { success, data, error } = usernameQuerySchema.safeParse(queryParams);
    if (!success) {
      return Response.json(
        {
          success: false,
          message: error.format().username?._errors.join(","),
        },
        {
          status: 400,
        }
      );
    }

    const { username } = data;

    const exisitingVerifiedUser = await UserModel.findOne({
      username,
      isVerified: true,
    });

    if (exisitingVerifiedUser) {
      return Response.json(
        {
          success: false,
          message: "Username is already taken",
        },
        {
          status: 400,
        }
      );
    }

    return Response.json(
      {
        success: true,
        message: "Username is unique",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error checking username: ", error);
    return Response.json(
      {
        success: false,
        message: "Error checking username: Internal Server Error",
      },
      { status: 500 }
    );
  }
}

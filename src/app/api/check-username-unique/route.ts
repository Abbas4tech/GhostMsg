import type { NextRequest } from "next/server";
import z from "zod";
import { usernameValidation } from "@/schemas/sign-up-schema";
import dbConnect from "@/server/db/db-connect";
import UserModel from "@/server/models/user.model";

const usernameQuerySchema = z.object({
  username: usernameValidation,
});

export async function GET(req: NextRequest): Promise<Response> {
  try {
    await dbConnect();
    const { searchParams } = req.nextUrl;

    const queryParams = {
      username: searchParams.get("username"),
    };

    const { success, data, error } = usernameQuerySchema.safeParse(queryParams);
    if (!success) {
      return Response.json(
        {
          message: error.format().username?._errors.join(","),
          success: false,
        },
        {
          status: 400,
        }
      );
    }

    const { username } = data;

    const exisitingVerifiedUser = await UserModel.findOne({
      isVerified: true,
      username,
    });

    if (exisitingVerifiedUser) {
      return Response.json(
        {
          message: "Username is already taken",
          success: false,
        },
        {
          status: 400,
        }
      );
    }

    return Response.json(
      {
        message: "Username is unique",
        success: true,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error checking username: ", error);
    return Response.json(
      {
        message: "Error checking username: Internal Server Error",
        success: false,
      },
      { status: 500 }
    );
  }
}

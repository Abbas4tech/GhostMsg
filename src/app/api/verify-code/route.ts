import dbConnect from "@/server/db/db-connect";
import UserModel from "@/server/models/user.model";

export async function POST(req: Request): Promise<Response> {
  try {
    await dbConnect();
    const { username, code } = await req.json();

    const user = await UserModel.findOne({
      username,
    });

    if (!user) {
      return Response.json(
        {
          message: "User not found!!",
          success: false,
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
          message: "Account Verified Successfully!",
          success: true,
        },
        { status: 200 }
      );
    }
    if (isCodeExpired) {
      return Response.json(
        {
          message: "Verify is code is incorrect",
          success: false,
        },
        { status: 200 }
      );
    }
    return Response.json(
      {
        message:
          "Verification code has expired. Please signup again to get a new code",
        success: false,
      },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error verifying code: ", error);
    return Response.json(
      {
        message: "Error verifying code: Internal server error",
        success: false,
      },
      {
        status: 500,
      }
    );
  }
}

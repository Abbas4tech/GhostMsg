import { attemptsLeft, MAX_VERIFY_ATTEMPTS } from "@/lib/users/verification";
import { verifyCodeRequestSchema } from "@/schemas/verify-schema";
import dbConnect from "@/server/db/db-connect";
import UserModel from "@/server/models/user.model";

/**
 * Checks a Verification Code. Three tries per code: each wrong guess counts,
 * and once they're used up the code is locked until a new one is requested
 * (POST /api/verify-code/resend). Expired codes need a new one too.
 */
export async function POST(req: Request): Promise<Response> {
  try {
    await dbConnect();
    const parsed = verifyCodeRequestSchema.safeParse(await req.json());
    if (!parsed.success) {
      return Response.json(
        { message: "Enter the 6-digit code from the email.", success: false },
        { status: 400 }
      );
    }
    const { username, code } = parsed.data;

    const user = await UserModel.findOne({ username });
    if (!user) {
      return Response.json(
        { message: "User not found!!", success: false },
        { status: 404 }
      );
    }

    if (user.isVerified) {
      return Response.json(
        { message: "Account already verified.", success: true },
        { status: 200 }
      );
    }

    const attempts = user.verifyAttempts ?? 0;
    if (attempts >= MAX_VERIFY_ATTEMPTS) {
      return Response.json(
        {
          attemptsLeft: 0,
          message: "Too many tries. Get a new code.",
          reason: "locked",
          success: false,
        },
        { status: 429 }
      );
    }

    if (new Date(user.verifyCodeExpiry) <= new Date()) {
      return Response.json(
        {
          message: "That code has expired. Get a new one.",
          reason: "expired",
          success: false,
        },
        { status: 400 }
      );
    }

    if (user.verifyCode !== code) {
      user.verifyAttempts = attempts + 1;
      await user.save();
      const left = attemptsLeft(user.verifyAttempts);
      return Response.json(
        {
          attemptsLeft: left,
          message: "That code isn't right.",
          reason: left === 0 ? "locked" : "wrong",
          success: false,
        },
        { status: 200 }
      );
    }

    user.isVerified = true;
    user.verifyAttempts = 0;
    await user.save();
    return Response.json(
      { message: "Account Verified Successfully!", success: true },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error verifying code: ", error);
    return Response.json(
      {
        message: "Error verifying code: Internal server error",
        success: false,
      },
      { status: 500 }
    );
  }
}

import {
  RESEND_COOLDOWN_SECONDS,
  secondsUntilResend,
} from "@/lib/users/verification";
import { resendCodeRequestSchema } from "@/schemas/verify-schema";
import dbConnect from "@/server/db/db-connect";
import { sendVerificationEmail } from "@/server/email/send-verification-email";
import UserModel from "@/server/models/user.model";
import { checkRateLimit } from "@/server/security/security";
import { issueVerificationCode } from "@/server/users/verification-code";

/** At most five resends per username every 10 minutes, on top of the cooldown. */
const RESEND_LIMIT = 5;
const RESEND_WINDOW_MS = 10 * 60 * 1000;

/**
 * Emails a new Verification Code and resets the tries. Refuses (429 with
 * `retryAfterSeconds`) within a minute of the last code, and for verified or
 * unknown accounts answers like a normal 404/400.
 */
export async function POST(req: Request): Promise<Response> {
  try {
    await dbConnect();
    const parsed = resendCodeRequestSchema.safeParse(await req.json());
    if (!parsed.success) {
      return Response.json(
        { message: "Username is required.", success: false },
        { status: 400 }
      );
    }
    const { username } = parsed.data;

    const limit = await checkRateLimit(
      `resend-code:${username}`,
      RESEND_LIMIT,
      RESEND_WINDOW_MS
    );
    if (!limit.success) {
      return Response.json(
        {
          message: "Too many new codes. Try again in a few minutes.",
          retryAfterSeconds: Math.ceil((limit.resetTime - Date.now()) / 1000),
          success: false,
        },
        { status: 429 }
      );
    }

    const user = await UserModel.findOne({ username });
    if (!user) {
      return Response.json(
        { message: "User not found!!", success: false },
        { status: 404 }
      );
    }
    if (user.isVerified) {
      return Response.json(
        { message: "Account already verified.", success: false },
        { status: 400 }
      );
    }

    const wait = secondsUntilResend(user.verifyCodeSentAt);
    if (wait > 0) {
      return Response.json(
        {
          message: `You can get a new code in ${wait} seconds.`,
          retryAfterSeconds: wait,
          success: false,
        },
        { status: 429 }
      );
    }

    const issued = issueVerificationCode();
    Object.assign(user, issued);
    await user.save();

    const email = await sendVerificationEmail(
      user.email,
      user.username,
      issued.verifyCode
    );
    if (!email.success) {
      return Response.json(
        { message: email.message, success: false },
        { status: 500 }
      );
    }

    return Response.json(
      {
        message: "We sent you a new code.",
        retryAfterSeconds: RESEND_COOLDOWN_SECONDS,
        success: true,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error resending verification code: ", error);
    return Response.json(
      { message: "Couldn't send a new code. Try again.", success: false },
      { status: 500 }
    );
  }
}

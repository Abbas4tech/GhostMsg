import { resend } from "@/lib/resend";
import type { ApiResponse } from "@/types/api-response";

import VerificationEmail from "../../emails/verification-email";

export async function sendVerificationEmail(
  email: string,
  username: string,
  verifyCode: string
): Promise<ApiResponse> {
  try {
    await resend.emails.send({
      from: "Acme <onboarding@resend.dev>",
      to: email,
      subject: "GhostMsg | Verification Code",
      react: VerificationEmail({ username, otp: verifyCode }),
    });
    return { success: true, message: "Verification email sent successfully!" };
  } catch (error) {
    console.error("Error sending verification email", error);
    return { success: false, message: "Failed to send verification email" };
  }
}

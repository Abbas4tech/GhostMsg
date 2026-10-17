import "server-only";
import { render } from "@react-email/render";
import { FROM_ADDRESS, transporter } from "@/server/email/mailer";
import VerificationEmail from "../../../emails/verification-email";
import type { EmailResult } from "./email-result";

export async function sendVerificationEmail(
  email: string,
  username: string,
  verifyCode: string
): Promise<EmailResult> {
  try {
    const html = await render(VerificationEmail({ otp: verifyCode, username }));

    await transporter.sendMail({
      from: FROM_ADDRESS,
      html,
      subject: "GhostMsg | Verification Code",
      to: email,
    });

    return { message: "Verification email sent successfully!", success: true };
  } catch (error) {
    console.error("Error sending verification email", error);
    return { message: "Failed to send verification email", success: false };
  }
}

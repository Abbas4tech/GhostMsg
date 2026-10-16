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
    const html = await render(VerificationEmail({ username, otp: verifyCode }));

    await transporter.sendMail({
      from: FROM_ADDRESS,
      to: email,
      subject: "GhostMsg | Verification Code",
      html,
    });

    return { success: true, message: "Verification email sent successfully!" };
  } catch (error) {
    console.error("Error sending verification email", error);
    return { success: false, message: "Failed to send verification email" };
  }
}

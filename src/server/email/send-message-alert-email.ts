import "server-only";
import { render } from "@react-email/render";
import NewMessageAlertEmail from "@/../emails/new-message-alert";
import { APP_URL, FROM_ADDRESS, transporter } from "@/server/email/mailer";
import type { EmailResult } from "./email-result";

export interface MessageAlertEmail {
  email: string;
  /**
   * Preview built by `buildAlertPreview`, or `null` when the recipient hides
   * message text (the email then shows neither text nor tone).
   */
  preview: string | null;
  sentimentTag?: string;
  username: string;
}

export async function sendMessageAlertEmail({
  email,
  username,
  preview,
  sentimentTag = "neutral",
}: MessageAlertEmail): Promise<EmailResult> {
  try {
    const html = await render(
      NewMessageAlertEmail({
        username,
        messagePreview: preview,
        sentimentTag,
        dashboardUrl: `${APP_URL}/dashboard`,
      })
    );

    await transporter.sendMail({
      from: FROM_ADDRESS,
      to: email,
      subject: "GhostMsg 👻 | You received a new anonymous message!",
      html,
    });

    return { success: true, message: "Alert email dispatched successfully" };
  } catch (error) {
    console.warn("Error sending message alert email:", error);
    return { success: false, message: "Failed to send alert email" };
  }
}

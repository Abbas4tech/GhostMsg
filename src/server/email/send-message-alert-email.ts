import "server-only";
import { render } from "@react-email/render";
import NewMessageAlertEmail from "@/../emails/new-message-alert";
import { FROM_ADDRESS, transporter } from "@/server/email/mailer";
import type { EmailResult } from "./email-result";

export async function sendMessageAlertEmail(
  email: string,
  username: string,
  messageContent: string,
  sentimentTag = "neutral"
): Promise<EmailResult> {
  try {
    const preview =
      messageContent.length > 80
        ? `${messageContent.slice(0, 80)}...`
        : messageContent;

    const html = await render(
      NewMessageAlertEmail({ username, messagePreview: preview, sentimentTag })
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

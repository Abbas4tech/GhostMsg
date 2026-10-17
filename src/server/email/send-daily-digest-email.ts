import "server-only";
import { render } from "@react-email/render";
import DailyDigestEmail from "@/../emails/daily-digest";
import { APP_URL, FROM_ADDRESS, transporter } from "@/server/email/mailer";
import type { DigestSummary } from "@/server/notifications/daily-digest";
import type { EmailResult } from "./email-result";

export interface DailyDigestEmailInput {
  email: string;
  summary: DigestSummary;
  username: string;
}

export async function sendDailyDigestEmail({
  email,
  username,
  summary,
}: DailyDigestEmailInput): Promise<EmailResult> {
  try {
    const html = await render(
      DailyDigestEmail({
        dashboardUrl: `${APP_URL}/dashboard`,
        previews: summary.previews,
        total: summary.total,
        username,
      })
    );

    await transporter.sendMail({
      from: FROM_ADDRESS,
      html,
      subject: `GhostMsg 👻 | ${summary.total} new anonymous ${
        summary.total === 1 ? "message" : "messages"
      } today`,
      to: email,
    });

    return { message: "Digest email dispatched successfully", success: true };
  } catch (error) {
    console.warn("Error sending daily digest email:", error);
    return { message: "Failed to send digest email", success: false };
  }
}

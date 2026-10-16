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
        username,
        total: summary.total,
        previews: summary.previews,
        dashboardUrl: `${APP_URL}/dashboard`,
      })
    );

    await transporter.sendMail({
      from: FROM_ADDRESS,
      to: email,
      subject: `GhostMsg 👻 | ${summary.total} new anonymous ${
        summary.total === 1 ? "message" : "messages"
      } today`,
      html,
    });

    return { success: true, message: "Digest email dispatched successfully" };
  } catch (error) {
    console.warn("Error sending daily digest email:", error);
    return { success: false, message: "Failed to send digest email" };
  }
}

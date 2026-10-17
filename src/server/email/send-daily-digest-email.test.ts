import { beforeEach, describe, expect, it, vi } from "vitest";
import { sendDailyDigestEmail } from "./send-daily-digest-email";

const { sendMail } = vi.hoisted(() => ({ sendMail: vi.fn() }));

vi.mock("@/server/email/mailer", () => ({
  APP_URL: "https://ghost.test",
  FROM_ADDRESS: "GhostMsg <noreply@ghost.test>",
  transporter: { sendMail },
}));

const lastMail = () => sendMail.mock.calls[0]?.[0] ?? {};

describe("sendDailyDigestEmail", () => {
  beforeEach(() => {
    sendMail.mockReset();
    sendMail.mockResolvedValue({});
  });

  it("lists previews and the remaining count when text is shown", async () => {
    await sendDailyDigestEmail({
      email: "maya@example.com",
      summary: {
        previews: [
          { sentimentTag: "sweet", text: "You always make my day better!" },
          { sentimentTag: "spicy", text: "Roast my portfolio" },
        ],
        total: 5,
      },
      username: "maya",
    });

    expect(lastMail().subject).toContain("5 new anonymous messages");
    expect(lastMail().html).toContain("You always make my day better!");
    expect(lastMail().html).toContain("3 more in your inbox");
    expect(lastMail().html).toContain("https://ghost.test/dashboard");
  });

  it("sends only the count when text is hidden", async () => {
    await sendDailyDigestEmail({
      email: "maya@example.com",
      summary: { previews: [], total: 1 },
      username: "maya",
    });

    expect(lastMail().subject).toContain("1 new anonymous message today");
    expect(lastMail().html).toContain("keep message text out of notifications");
    expect(lastMail().html).not.toContain("Tone:");
  });
});

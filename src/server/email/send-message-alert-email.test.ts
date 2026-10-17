import { beforeEach, describe, expect, it, vi } from "vitest";
import { sendMessageAlertEmail } from "./send-message-alert-email";

const { sendMail } = vi.hoisted(() => ({ sendMail: vi.fn() }));

vi.mock("@/server/email/mailer", () => ({
  APP_URL: "https://ghost.test",
  FROM_ADDRESS: "GhostMsg <noreply@ghost.test>",
  transporter: { sendMail },
}));

const sentHtml = (): string => sendMail.mock.calls[0]?.[0]?.html ?? "";

describe("sendMessageAlertEmail", () => {
  beforeEach(() => {
    sendMail.mockReset();
    sendMail.mockResolvedValue({});
  });

  it("shows the preview and tone when text is allowed", async () => {
    const result = await sendMessageAlertEmail({
      email: "maya@example.com",
      preview: "You always make my day better!",
      sentimentTag: "sweet",
      username: "maya",
    });

    expect(result.success).toBe(true);
    expect(sentHtml()).toContain("You always make my day better!");
    expect(sentHtml()).toContain("SWEET");
    expect(sentHtml()).toContain("https://ghost.test/dashboard");
  });

  it("shows neither text nor tone when the recipient hides message text", async () => {
    await sendMessageAlertEmail({
      email: "maya@example.com",
      preview: null,
      sentimentTag: "spicy",
      username: "maya",
    });

    expect(sentHtml()).toContain("Open your inbox to read");
    expect(sentHtml()).not.toContain("SPICY");
    expect(sentHtml()).not.toContain("Tone:");
    expect(sentHtml()).not.toContain("Someone just sent you");
  });

  it("reports a failed send without throwing", async () => {
    sendMail.mockRejectedValueOnce(new Error("smtp down"));
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);

    const result = await sendMessageAlertEmail({
      email: "maya@example.com",
      preview: null,
      username: "maya",
    });
    warn.mockRestore();

    expect(result.success).toBe(false);
  });
});

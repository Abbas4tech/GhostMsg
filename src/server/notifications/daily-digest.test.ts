import { describe, expect, it, vi } from "vitest";
import {
  buildDigestSummary,
  type DailyDigestDeps,
  type DigestMessage,
  type DigestRecipient,
  digestWindowStart,
  runDailyDigest,
} from "./daily-digest";
import { HIDDEN_ALERT_TEXT } from "./delivery-policy";

const NOW = new Date("2026-10-14T17:00:00.000Z");
const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

const recipient = (
  overrides: Partial<DigestRecipient> = {}
): DigestRecipient => ({
  id: "u1",
  email: "maya@example.com",
  username: "maya",
  hideMessageText: true,
  lastDigestSentAt: null,
  ...overrides,
});

const messages: DigestMessage[] = [
  { content: "You always make my day better!", sentimentTag: "sweet" },
  { content: "What's your favourite design tool?", sentimentTag: "curious" },
  { content: "Roast my portfolio in one sentence.", sentimentTag: "spicy" },
  {
    content: "A fourth message that is not previewed.",
    sentimentTag: "neutral",
  },
];

const deps = (overrides: Partial<DailyDigestDeps> = {}): DailyDigestDeps => ({
  loadRecipients: vi.fn(async () => [recipient()]),
  loadNewMessages: vi.fn(async () => ({ total: 4, recent: messages })),
  sendDigest: vi.fn(async () => true),
  markSent: vi.fn(async () => undefined),
  ...overrides,
});

describe("digestWindowStart", () => {
  it("covers the last day for a first digest", () => {
    expect(digestWindowStart(null, NOW)).toEqual(new Date(NOW.getTime() - DAY));
  });

  it("starts at the last digest", () => {
    const last = new Date(NOW.getTime() - 30 * HOUR);
    expect(digestWindowStart(last, NOW)).toEqual(last);
  });

  it("never reaches back more than a week", () => {
    const longAgo = new Date(NOW.getTime() - 40 * DAY);
    expect(digestWindowStart(longAgo, NOW)).toEqual(
      new Date(NOW.getTime() - 7 * DAY)
    );
  });
});

describe("buildDigestSummary", () => {
  it("keeps only the count when message text is hidden", () => {
    expect(buildDigestSummary(4, messages, true)).toEqual({
      total: 4,
      previews: [],
    });
  });

  it("previews at most three messages when text is shown", () => {
    const summary = buildDigestSummary(4, messages, false);
    expect(summary.previews).toHaveLength(3);
    expect(summary.previews[0]).toEqual({
      text: messages[0].content,
      sentimentTag: "sweet",
    });
    expect(summary.previews.map((p) => p.text)).not.toContain(
      HIDDEN_ALERT_TEXT
    );
  });
});

describe("runDailyDigest", () => {
  it("emails recipients with new messages and moves their window", async () => {
    const d = deps();
    const result = await runDailyDigest(d, NOW);

    expect(d.loadNewMessages).toHaveBeenCalledWith(
      "u1",
      new Date(NOW.getTime() - DAY)
    );
    expect(d.sendDigest).toHaveBeenCalledWith(recipient(), {
      total: 4,
      previews: [],
    });
    expect(d.markSent).toHaveBeenCalledWith("u1", NOW);
    expect(result).toEqual({
      considered: 1,
      sent: 1,
      empty: 0,
      skippedQuietHours: 0,
      failed: 0,
    });
  });

  it("sends nothing when no new messages arrived", async () => {
    const d = deps({
      loadNewMessages: vi.fn(async () => ({ total: 0, recent: [] })),
    });
    const result = await runDailyDigest(d, NOW);

    expect(d.sendDigest).not.toHaveBeenCalled();
    expect(d.markSent).not.toHaveBeenCalled();
    expect(result.empty).toBe(1);
  });

  it("skips recipients inside quiet hours without moving their window", async () => {
    const d = deps({
      loadRecipients: vi.fn(async () => [
        recipient({
          quietHours: {
            enabled: true,
            start: "16:00",
            end: "20:00",
            timeZone: "UTC",
          },
        }),
      ]),
    });
    const result = await runDailyDigest(d, NOW);

    expect(d.loadNewMessages).not.toHaveBeenCalled();
    expect(d.markSent).not.toHaveBeenCalled();
    expect(result.skippedQuietHours).toBe(1);
  });

  it("keeps the window when the email fails, so the next run retries", async () => {
    const d = deps({ sendDigest: vi.fn(async () => false) });
    const result = await runDailyDigest(d, NOW);

    expect(d.markSent).not.toHaveBeenCalled();
    expect(result.failed).toBe(1);
  });

  it("continues with other recipients when one throws", async () => {
    const d = deps({
      loadRecipients: vi.fn(async () => [
        recipient({ id: "broken" }),
        recipient({ id: "u2" }),
      ]),
      loadNewMessages: vi.fn((id: string) =>
        id === "broken"
          ? Promise.reject(new Error("db down"))
          : Promise.resolve({ total: 1, recent: messages.slice(0, 1) })
      ),
    });
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const result = await runDailyDigest(d, NOW);
    warn.mockRestore();

    expect(result).toMatchObject({ considered: 2, sent: 1, failed: 1 });
    expect(d.markSent).toHaveBeenCalledWith("u2", NOW);
  });
});

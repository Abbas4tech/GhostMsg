import { describe, expect, it } from "vitest";
import { formatLastChecked, formatRelativeTime } from "./relative-time";

const NOW = new Date("2026-10-12T12:00:00Z");
const ago = (seconds: number): Date => new Date(NOW.getTime() - seconds * 1000);

describe("formatRelativeTime", () => {
  it("says now under a minute", () => {
    expect(formatRelativeTime(ago(30), NOW)).toBe("now");
  });

  it("uses minutes, hours and days", () => {
    expect(formatRelativeTime(ago(2 * 60), NOW)).toBe("2m");
    expect(formatRelativeTime(ago(3 * 3600), NOW)).toBe("3h");
    expect(formatRelativeTime(ago(4 * 86_400), NOW)).toBe("4d");
  });

  it("falls back to a short date after a week", () => {
    expect(formatRelativeTime("2026-09-01T12:00:00Z", NOW)).toBe("Sep 1");
  });

  it("never goes negative for future dates", () => {
    expect(formatRelativeTime(ago(-120), NOW)).toBe("now");
  });
});

describe("formatLastChecked", () => {
  const now = new Date("2026-10-31T12:00:00.000Z");
  const secondsAgo = (seconds: number) => now.getTime() - seconds * 1000;

  it("reads naturally for the inbox subtitle", () => {
    expect(formatLastChecked(secondsAgo(20), now)).toBe("a moment ago");
    expect(formatLastChecked(secondsAgo(60), now)).toBe("1 minute ago");
    expect(formatLastChecked(secondsAgo(5 * 60), now)).toBe("5 minutes ago");
    expect(formatLastChecked(secondsAgo(2 * 3600), now)).toBe("2 hours ago");
  });

  it("falls back to a date after a day", () => {
    expect(formatLastChecked(secondsAgo(3 * 86_400), now)).toBe("on Oct 28");
  });
});

import { describe, expect, it } from "vitest";
import {
  buildAlertPreview,
  HIDDEN_ALERT_TEXT,
  isWithinQuietHours,
} from "./delivery-policy";

const overnight = {
  enabled: true,
  start: "22:00",
  end: "08:00",
  timeZone: "UTC",
};

describe("isWithinQuietHours", () => {
  it("is off unless enabled", () => {
    expect(
      isWithinQuietHours(new Date("2026-10-12T23:00:00Z"), {
        ...overnight,
        enabled: false,
      })
    ).toBe(false);
    expect(isWithinQuietHours(new Date(), undefined)).toBe(false);
  });

  it("handles windows that cross midnight", () => {
    expect(
      isWithinQuietHours(new Date("2026-10-12T23:30:00Z"), overnight)
    ).toBe(true);
    expect(
      isWithinQuietHours(new Date("2026-10-12T07:59:00Z"), overnight)
    ).toBe(true);
    expect(
      isWithinQuietHours(new Date("2026-10-12T08:00:00Z"), overnight)
    ).toBe(false);
    expect(
      isWithinQuietHours(new Date("2026-10-12T12:00:00Z"), overnight)
    ).toBe(false);
  });

  it("handles same-day windows", () => {
    const lunch = { ...overnight, start: "12:00", end: "13:00" };
    expect(isWithinQuietHours(new Date("2026-10-12T12:30:00Z"), lunch)).toBe(
      true
    );
    expect(isWithinQuietHours(new Date("2026-10-12T13:30:00Z"), lunch)).toBe(
      false
    );
  });

  it("uses the recipient's time zone", () => {
    // 21:30 UTC is 23:30 in Europe/Berlin (summer time, UTC+2).
    expect(
      isWithinQuietHours(new Date("2026-07-12T21:30:00Z"), {
        ...overnight,
        timeZone: "Europe/Berlin",
      })
    ).toBe(true);
  });

  it("falls back to UTC for an unknown zone", () => {
    expect(
      isWithinQuietHours(new Date("2026-10-12T23:00:00Z"), {
        ...overnight,
        timeZone: "Not/AZone",
      })
    ).toBe(true);
  });
});

describe("buildAlertPreview", () => {
  it("hides the text when asked", () => {
    expect(buildAlertPreview("secret", true)).toBe(HIDDEN_ALERT_TEXT);
  });

  it("truncates long text", () => {
    expect(buildAlertPreview("x".repeat(100), false)).toBe(
      `${"x".repeat(80)}…`
    );
    expect(buildAlertPreview("short", false)).toBe("short");
  });
});

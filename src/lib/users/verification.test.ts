import { describe, expect, it } from "vitest";
import {
  attemptsLeft,
  formatCountdown,
  MAX_VERIFY_ATTEMPTS,
  RESEND_COOLDOWN_SECONDS,
  secondsUntilResend,
} from "./verification";

const NOW = new Date("2026-10-31T12:00:00.000Z");

describe("attemptsLeft", () => {
  it("counts down from three and never goes below zero", () => {
    expect(attemptsLeft(0)).toBe(MAX_VERIFY_ATTEMPTS);
    expect(attemptsLeft(1)).toBe(2);
    expect(attemptsLeft(5)).toBe(0);
  });
});

describe("secondsUntilResend", () => {
  it("is zero when no code was sent", () => {
    expect(secondsUntilResend(undefined, NOW)).toBe(0);
    expect(secondsUntilResend(null, NOW)).toBe(0);
  });

  it("is the rest of the cooldown, rounded up", () => {
    const sentAt = new Date(NOW.getTime() - 17_500);
    expect(secondsUntilResend(sentAt, NOW)).toBe(43);
    expect(secondsUntilResend(sentAt.toISOString(), NOW)).toBe(43);
  });

  it("is zero once the cooldown has passed", () => {
    const sentAt = new Date(
      NOW.getTime() - (RESEND_COOLDOWN_SECONDS + 1) * 1000
    );
    expect(secondsUntilResend(sentAt, NOW)).toBe(0);
  });
});

describe("formatCountdown", () => {
  it("formats m:ss", () => {
    expect(formatCountdown(42)).toBe("0:42");
    expect(formatCountdown(60)).toBe("1:00");
    expect(formatCountdown(5)).toBe("0:05");
  });

  it("clamps negatives and drops fractions", () => {
    expect(formatCountdown(-3)).toBe("0:00");
    expect(formatCountdown(9.8)).toBe("0:09");
  });
});

import { describe, expect, it } from "vitest";
import { ApiError } from "@/data/api-client";
import {
  readRetryAfter,
  toVerifyFailure,
  toVerifyFailureFromError,
} from "./verify.utils";

describe("toVerifyFailure", () => {
  it("shows the tries left for a wrong code", () => {
    expect(toVerifyFailure({ attemptsLeft: 2, reason: "wrong" })).toEqual({
      error: {
        detail: "2 tries left. Check for the newest email.",
        title: "That code isn't right.",
      },
      needsNewCode: false,
    });
  });

  it("uses the singular for the last try", () => {
    expect(
      toVerifyFailure({ attemptsLeft: 1, reason: "wrong" }).error.detail
    ).toBe("1 try left. Check for the newest email.");
  });

  it("needs a new code when locked or expired", () => {
    expect(toVerifyFailure({ reason: "locked" })).toMatchObject({
      error: { title: "Too many tries." },
      needsNewCode: true,
    });
    expect(toVerifyFailure({ reason: "expired" })).toMatchObject({
      error: { title: "That code has expired." },
      needsNewCode: true,
    });
  });

  it("falls back to the server message", () => {
    expect(toVerifyFailure({ message: "Nope" }).error).toEqual({
      title: "Nope",
    });
    expect(toVerifyFailure({}).error.title).toBe("That code isn't right.");
  });
});

describe("toVerifyFailureFromError", () => {
  it("reads the reason from the error body", () => {
    const error = new ApiError("expired", 400, { reason: "expired" });
    expect(toVerifyFailureFromError(error).needsNewCode).toBe(true);
  });

  it("treats a bare 429 as locked", () => {
    expect(
      toVerifyFailureFromError(new ApiError("Too many", 429)).error.title
    ).toBe("Too many tries.");
  });

  it("shows other errors as they are", () => {
    expect(toVerifyFailureFromError(new ApiError("Server down", 500))).toEqual({
      error: { title: "Server down" },
      needsNewCode: false,
    });
    expect(toVerifyFailureFromError("boom").error.title).toBe(
      "Couldn't check your code. Try again."
    );
  });
});

describe("readRetryAfter", () => {
  it("reads retryAfterSeconds from a refused resend", () => {
    expect(
      readRetryAfter(new ApiError("wait", 429, { retryAfterSeconds: 42 }))
    ).toBe(42);
  });

  it("is null without a positive number", () => {
    expect(readRetryAfter(new ApiError("x", 429, {}))).toBeNull();
    expect(
      readRetryAfter(new ApiError("x", 429, { retryAfterSeconds: 0 }))
    ).toBeNull();
    expect(readRetryAfter(new Error("x"))).toBeNull();
  });
});

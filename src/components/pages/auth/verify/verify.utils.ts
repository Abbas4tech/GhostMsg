import type { VerifyCodeError } from "@/components/patterns/verify-code-form";
import { ApiError } from "@/data/api-client";

/** The verify API's reply after a submitted code (see POST /api/verify-code). */
export interface VerifyCodeReply {
  attemptsLeft?: number;
  message?: string;
  reason?: "wrong" | "expired" | "locked";
  success?: boolean;
}

/** What the verify screen shows after a failed attempt. */
export interface VerifyFailure {
  error: VerifyCodeError;
  /** Locked or expired: only a new code helps, so the slots are disabled. */
  needsNewCode: boolean;
}

const HTTP_TOO_MANY_REQUESTS = 429;

const NEW_CODE_DETAIL = "Get a new code to try again.";

const triesLeftLabel = (left: number): string =>
  left === 1 ? "1 try left" : `${left} tries left`;

/** Maps a failed verify reply (wrong / expired / locked) to the on-screen error. */
export function toVerifyFailure(reply: VerifyCodeReply): VerifyFailure {
  if (reply.reason === "locked") {
    return {
      error: { detail: NEW_CODE_DETAIL, title: "Too many tries." },
      needsNewCode: true,
    };
  }
  if (reply.reason === "expired") {
    return {
      error: { detail: NEW_CODE_DETAIL, title: "That code has expired." },
      needsNewCode: true,
    };
  }
  if (reply.reason === "wrong" && typeof reply.attemptsLeft === "number") {
    return {
      error: {
        detail: `${triesLeftLabel(reply.attemptsLeft)}. Check for the newest email.`,
        title: "That code isn't right.",
      },
      needsNewCode: false,
    };
  }
  return {
    error: { title: reply.message || "That code isn't right." },
    needsNewCode: false,
  };
}

/** The error body of a failed request (ApiError keeps it in `details`). */
function errorBody(error: unknown): Record<string, unknown> | null {
  if (!(error instanceof ApiError)) {
    return null;
  }
  const { details } = error;
  return details && typeof details === "object"
    ? (details as Record<string, unknown>)
    : null;
}

/** A thrown verify request (400 expired, 429 locked, 5xx) as an on-screen error. */
export function toVerifyFailureFromError(error: unknown): VerifyFailure {
  const body = errorBody(error);
  const reason = body?.reason;
  if (reason === "expired" || reason === "locked") {
    return toVerifyFailure({ reason });
  }
  if (error instanceof ApiError && error.status === HTTP_TOO_MANY_REQUESTS) {
    return toVerifyFailure({ reason: "locked" });
  }
  const message = error instanceof Error ? error.message : "";
  return {
    error: { title: message || "Couldn't check your code. Try again." },
    needsNewCode: false,
  };
}

/** `retryAfterSeconds` from a refused resend (429), if the server sent one. */
export function readRetryAfter(error: unknown): number | null {
  const value = errorBody(error)?.retryAfterSeconds;
  return typeof value === "number" && value > 0 ? value : null;
}

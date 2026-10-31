/**
 * Verification Code rules shared by the API (src/app/api/verify-code) and the
 * verify page: three tries per code, a new code at most once a minute, and an
 * hour before a code expires.
 */

/** Wrong guesses allowed per code (design: "That code isn't right. 2 tries left."). */
export const MAX_VERIFY_ATTEMPTS = 3;

/** Wait between "Resend code" requests (design: "Resend in 0:42"). */
export const RESEND_COOLDOWN_SECONDS = 60;

/** How long a Verification Code stays valid. */
export const VERIFY_CODE_TTL_MS = 60 * 60 * 1000;

/** Tries left after `attempts` wrong guesses (never below 0). */
export const attemptsLeft = (attempts: number): number =>
  Math.max(0, MAX_VERIFY_ATTEMPTS - attempts);

/** Seconds until another code may be sent, given when the last one went out. */
export function secondsUntilResend(
  sentAt: Date | string | null | undefined,
  now: Date = new Date()
): number {
  if (!sentAt) {
    return 0;
  }
  const elapsed = (now.getTime() - new Date(sentAt).getTime()) / 1000;
  return Math.max(0, Math.ceil(RESEND_COOLDOWN_SECONDS - elapsed));
}

/** "0:42" for the resend countdown. */
export function formatCountdown(seconds: number): string {
  const safe = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(safe / 60);
  const rest = String(safe % 60).padStart(2, "0");
  return `${minutes}:${rest}`;
}

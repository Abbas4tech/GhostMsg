import "server-only";
import { randomInt } from "node:crypto";
import { VERIFY_CODE_TTL_MS } from "@/lib/users/verification";

export interface IssuedVerificationCode {
  verifyAttempts: number;
  verifyCode: string;
  verifyCodeExpiry: Date;
  verifyCodeSentAt: Date;
}

/**
 * A fresh 6-digit Verification Code with its expiry, a reset attempt count
 * and the send time (for the resend cooldown). Spread onto the user document.
 */
export function issueVerificationCode(
  now: Date = new Date()
): IssuedVerificationCode {
  return {
    verifyAttempts: 0,
    verifyCode: String(randomInt(100_000, 1_000_000)),
    verifyCodeExpiry: new Date(now.getTime() + VERIFY_CODE_TTL_MS),
    verifyCodeSentAt: now,
  };
}

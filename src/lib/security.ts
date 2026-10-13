import crypto from "node:crypto";

/**
 * Computes a one-way salted cryptographic fingerprint for an anonymous sender.
 * Senders cannot be reverse-engineered to their IP address, but identical IP + recipient
 * combinations produce matching hashes to facilitate recipient-controlled blocklists.
 */
export function computeSenderHash(ip: string, recipientId: string): string {
  const secretPepper =
    process.env.SENDER_PEPPER_SECRET ||
    process.env.NEXT_AUTH_SECRET ||
    "ghostmsg-default-secret-pepper-salt";

  return crypto
    .createHmac("sha256", secretPepper)
    .update(`${ip}:${recipientId}`)
    .digest("hex");
}

interface RateLimitRecord {
  timestamps: number[];
}

const memoryRateLimitStore = new Map<string, RateLimitRecord>();

if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of memoryRateLimitStore.entries()) {
      record.timestamps = record.timestamps.filter((ts) => now - ts < 600_000);
      if (record.timestamps.length === 0) {
        memoryRateLimitStore.delete(key);
      }
    }
  }, 300_000);
}

/**
 * In-memory sliding window rate limiter.
 * Limits requests to `limit` operations per `windowMs` (default: 5 requests per 10 minutes).
 */
export async function checkRateLimit(
  identifier: string,
  limit = 5,
  windowMs = 600_000
): Promise<{ success: boolean; remaining: number; resetTime: number }> {
  await Promise.resolve();
  const now = Date.now();
  const windowStart = now - windowMs;

  let record = memoryRateLimitStore.get(identifier);
  if (!record) {
    record = { timestamps: [] };
    memoryRateLimitStore.set(identifier, record);
  }

  record.timestamps = record.timestamps.filter((ts) => ts > windowStart);

  if (record.timestamps.length >= limit) {
    const oldestTimestamp = record.timestamps[0];
    const resetTime = oldestTimestamp + windowMs;
    return {
      success: false,
      remaining: 0,
      resetTime,
    };
  }

  record.timestamps.push(now);
  return {
    success: true,
    remaining: limit - record.timestamps.length,
    resetTime: now + windowMs,
  };
}

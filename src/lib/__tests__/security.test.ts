import { describe, expect, it } from "vitest";
import { checkRateLimit, computeSenderHash } from "../security";

const SHA256_HEX_REGEX = /^[a-f0-9]{64}$/;

describe("security.ts", () => {
  describe("computeSenderHash", () => {
    it("should generate a consistent SHA-256 HMAC hex hash for identical IP and recipientId", () => {
      const hash1 = computeSenderHash("192.168.1.1", "recipient123");
      const hash2 = computeSenderHash("192.168.1.1", "recipient123");

      expect(hash1).toBe(hash2);
      expect(hash1).toMatch(SHA256_HEX_REGEX);
    });

    it("should generate different hashes for different IPs or different recipients", () => {
      const hash1 = computeSenderHash("192.168.1.1", "recipient123");
      const hash2 = computeSenderHash("192.168.1.2", "recipient123");
      const hash3 = computeSenderHash("192.168.1.1", "recipient456");

      expect(hash1).not.toBe(hash2);
      expect(hash1).not.toBe(hash3);
    });
  });

  describe("checkRateLimit", () => {
    it("should allow requests under the specified limit", async () => {
      const id = `test-client-${Math.random()}`;

      const res1 = await checkRateLimit(id, 3, 60_000);
      expect(res1.success).toBe(true);
      expect(res1.remaining).toBe(2);

      const res2 = await checkRateLimit(id, 3, 60_000);
      expect(res2.success).toBe(true);
      expect(res2.remaining).toBe(1);

      const res3 = await checkRateLimit(id, 3, 60_000);
      expect(res3.success).toBe(true);
      expect(res3.remaining).toBe(0);
    });

    it("should reject requests that exceed the limit", async () => {
      const id = `test-blocked-${Math.random()}`;

      await checkRateLimit(id, 2, 60_000);
      await checkRateLimit(id, 2, 60_000);

      const res3 = await checkRateLimit(id, 2, 60_000);
      expect(res3.success).toBe(false);
      expect(res3.remaining).toBe(0);
      expect(res3.resetTime).toBeGreaterThan(Date.now());
    });
  });
});

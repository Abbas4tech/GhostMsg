import { describe, expect, it } from "vitest";
import {
  pushSubscriptionRequestSchema,
  updateNotificationsRequestSchema,
} from "../notification-schema";

describe("notification-schema.ts", () => {
  describe("updateNotificationsRequestSchema", () => {
    it("should accept valid emailAlerts modes (instant, daily, off)", () => {
      const r1 = updateNotificationsRequestSchema.safeParse({
        emailAlerts: "instant",
      });
      expect(r1.success).toBe(true);

      const r2 = updateNotificationsRequestSchema.safeParse({
        emailAlerts: "daily",
      });
      expect(r2.success).toBe(true);

      const r3 = updateNotificationsRequestSchema.safeParse({
        emailAlerts: "off",
        webPushEnabled: true,
      });
      expect(r3.success).toBe(true);
    });

    it("should reject invalid emailAlerts enum values", () => {
      const result = updateNotificationsRequestSchema.safeParse({
        emailAlerts: "hourly",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("pushSubscriptionRequestSchema", () => {
    it("should accept valid push subscription payload with endpoint and keys", () => {
      const result = pushSubscriptionRequestSchema.safeParse({
        endpoint: "https://fcm.googleapis.com/fcm/send/123",
        keys: {
          p256dh: "mock_p256dh_key",
          auth: "mock_auth_secret",
        },
      });
      expect(result.success).toBe(true);
    });

    it("should reject missing endpoint", () => {
      const result = pushSubscriptionRequestSchema.safeParse({
        endpoint: "",
        keys: {
          p256dh: "mock_key",
          auth: "mock_secret",
        },
      });
      expect(result.success).toBe(false);
    });
  });
});

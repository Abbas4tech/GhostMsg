import { describe, expect, it } from "vitest";
import {
  pushSubscriptionRequestSchema,
  updateNotificationsRequestSchema,
} from "./notification-schema";

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

    it("accepts quiet hours and hide-text toggles", () => {
      const result = updateNotificationsRequestSchema.safeParse({
        hideMessageText: false,
        quietHours: {
          enabled: true,
          end: "08:00",
          start: "22:00",
          timeZone: "Europe/London",
        },
      });
      expect(result.success).toBe(true);
    });

    it("rejects malformed quiet-hour times", () => {
      const result = updateNotificationsRequestSchema.safeParse({
        quietHours: {
          enabled: true,
          end: "8am",
          start: "25:00",
          timeZone: "UTC",
        },
      });
      expect(result.success).toBe(false);
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
          auth: "mock_auth_secret",
          p256dh: "mock_p256dh_key",
        },
      });
      expect(result.success).toBe(true);
    });

    it("should reject missing endpoint", () => {
      const result = pushSubscriptionRequestSchema.safeParse({
        endpoint: "",
        keys: {
          auth: "mock_secret",
          p256dh: "mock_key",
        },
      });
      expect(result.success).toBe(false);
    });
  });
});

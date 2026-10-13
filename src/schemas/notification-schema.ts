import { z } from "@/schemas/zod";

// ── Notification Settings ────────────────────────────────────────────────────

const CLOCK_TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

/** "HH:MM" 24-hour wall-clock time. */
export const clockTimeSchema = z
  .string()
  .regex(CLOCK_TIME_PATTERN, "Use HH:MM")
  .openapi({ example: "22:00" });

export const quietHoursSchema = z
  .object({
    enabled: z.boolean().openapi({ example: false }),
    start: clockTimeSchema,
    end: clockTimeSchema.openapi({ example: "08:00" }),
    timeZone: z.string().min(1).max(64).openapi({
      description: "IANA time zone the window is in",
      example: "Europe/London",
    }),
  })
  .openapi("QuietHours");

export const notificationSettingsSchema = z
  .object({
    emailAlerts: z
      .enum(["instant", "daily", "off"])
      .default("instant")
      .openapi({
        description: "Email alert frequency preference",
        example: "instant",
      }),
    webPushEnabled: z.boolean().default(false).openapi({
      description:
        "Whether browser push notifications are enabled on this device",
      example: false,
    }),
    hideMessageText: z.boolean().default(true).openapi({
      description: "Alerts say 'New Anonymous Message' without the text",
      example: true,
    }),
    quietHours: quietHoursSchema.optional(),
  })
  .openapi("NotificationSettings");

export const getNotificationsResponseSchema = z
  .object({
    success: z.boolean().openapi({ example: true }),
    notificationSettings: notificationSettingsSchema,
    isAcceptingMessage: z.boolean().optional(),
  })
  .openapi("GetNotificationsResponse");

export const updateNotificationsRequestSchema = z
  .object({
    emailAlerts: z
      .enum(["instant", "daily", "off"])
      .optional()
      .openapi({ description: "Email alert frequency preference" }),
    webPushEnabled: z
      .boolean()
      .optional()
      .openapi({ description: "Enable/disable browser push notifications" }),
    hideMessageText: z
      .boolean()
      .optional()
      .openapi({ description: "Hide message text in notifications" }),
    quietHours: quietHoursSchema.optional(),
  })
  .openapi("UpdateNotificationsRequest");

export const updateNotificationsResponseSchema = z
  .object({
    success: z.boolean().openapi({ example: true }),
    message: z
      .string()
      .openapi({ example: "Notification settings updated successfully!" }),
    notificationSettings: notificationSettingsSchema.optional(),
  })
  .openapi("UpdateNotificationsResponse");

// ── Push Subscription ────────────────────────────────────────────────────────

/**
 * W3C PushSubscription JSON representation passed from the browser
 * pushManager.subscribe() call.
 */
export const pushSubscriptionRequestSchema = z
  .object({
    endpoint: z.string().url().openapi({
      description: "Push service endpoint URL provided by the browser",
      example: "https://fcm.googleapis.com/fcm/send/...",
    }),
    keys: z.object({
      p256dh: z.string().min(1).openapi({ description: "ECDH public key" }),
      auth: z.string().min(1).openapi({ description: "Authentication secret" }),
    }),
  })
  .openapi("PushSubscriptionRequest");

/** Removes one device's subscription (identified by its endpoint). */
export const pushUnsubscribeRequestSchema = z
  .object({
    endpoint: z.string().url().openapi({
      description: "Endpoint of the subscription to remove",
      example: "https://fcm.googleapis.com/fcm/send/...",
    }),
  })
  .openapi("PushUnsubscribeRequest");

// ── Daily digest (scheduler only) ────────────────────────────────────────────

export const dailyDigestRunResponseSchema = z
  .object({
    success: z.boolean().openapi({ example: true }),
    considered: z.number().int().openapi({
      description: "Recipients with emailAlerts = daily",
      example: 12,
    }),
    sent: z.number().int().openapi({ example: 7 }),
    empty: z.number().int().openapi({
      description: "No new non-quarantined messages since the last digest",
      example: 4,
    }),
    skippedQuietHours: z.number().int().openapi({
      description:
        "Inside quiet hours now; their messages roll into the next run",
      example: 1,
    }),
    failed: z.number().int().openapi({ example: 0 }),
  })
  .openapi("DailyDigestRunResponse");

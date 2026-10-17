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
    end: clockTimeSchema.openapi({ example: "08:00" }),
    start: clockTimeSchema,
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
    hideMessageText: z.boolean().default(true).openapi({
      description: "Alerts say 'New Anonymous Message' without the text",
      example: true,
    }),
    quietHours: quietHoursSchema.optional(),
    webPushEnabled: z.boolean().default(false).openapi({
      description:
        "Whether browser push notifications are enabled on this device",
      example: false,
    }),
  })
  .openapi("NotificationSettings");

export const getNotificationsResponseSchema = z
  .object({
    isAcceptingMessage: z.boolean().optional(),
    notificationSettings: notificationSettingsSchema,
    success: z.boolean().openapi({ example: true }),
  })
  .openapi("GetNotificationsResponse");

export const updateNotificationsRequestSchema = z
  .object({
    emailAlerts: z
      .enum(["instant", "daily", "off"])
      .optional()
      .openapi({ description: "Email alert frequency preference" }),
    hideMessageText: z
      .boolean()
      .optional()
      .openapi({ description: "Hide message text in notifications" }),
    quietHours: quietHoursSchema.optional(),
    webPushEnabled: z
      .boolean()
      .optional()
      .openapi({ description: "Enable/disable browser push notifications" }),
  })
  .openapi("UpdateNotificationsRequest");

export const updateNotificationsResponseSchema = z
  .object({
    message: z
      .string()
      .openapi({ example: "Notification settings updated successfully!" }),
    notificationSettings: notificationSettingsSchema.optional(),
    success: z.boolean().openapi({ example: true }),
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
      auth: z.string().min(1).openapi({ description: "Authentication secret" }),
      p256dh: z.string().min(1).openapi({ description: "ECDH public key" }),
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
    considered: z.number().int().openapi({
      description: "Recipients with emailAlerts = daily",
      example: 12,
    }),
    empty: z.number().int().openapi({
      description: "No new non-quarantined messages since the last digest",
      example: 4,
    }),
    failed: z.number().int().openapi({ example: 0 }),
    sent: z.number().int().openapi({ example: 7 }),
    skippedQuietHours: z.number().int().openapi({
      description:
        "Inside quiet hours now; their messages roll into the next run",
      example: 1,
    }),
    success: z.boolean().openapi({ example: true }),
  })
  .openapi("DailyDigestRunResponse");

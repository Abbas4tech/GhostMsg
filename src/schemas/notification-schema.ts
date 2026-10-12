import { z } from "@/schemas/zod";

// ── Notification Settings ────────────────────────────────────────────────────

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

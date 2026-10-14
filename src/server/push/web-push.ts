import "server-only";
import webpush, { WebPushError } from "web-push";
import UserModel, {
  type PushSubscriptionRecord,
} from "@/server/models/user.model";

/** Push services answer 404/410 once a subscription is revoked or expired. */
const GONE_STATUS_CODES = new Set([404, 410]);
const PUSH_TTL_SECONDS = 60 * 60 * 24;

export interface PushPayload {
  body: string;
  title: string;
  url?: string;
}

export interface VapidConfig {
  privateKey: string;
  publicKey: string;
  subject: string;
}

/** The env vars Web Push reads (a subset of `process.env`). */
interface VapidEnv {
  NEXT_PUBLIC_VAPID_PUBLIC_KEY?: string;
  VAPID_PRIVATE_KEY?: string;
  VAPID_SUBJECT?: string;
  [key: string]: string | undefined;
}

/** VAPID keys from env, or `null` when Web Push isn't configured. */
export function getVapidConfig(
  env: VapidEnv = process.env
): VapidConfig | null {
  const publicKey = env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = env.VAPID_PRIVATE_KEY;
  if (!(publicKey && privateKey)) {
    return null;
  }
  return {
    publicKey,
    privateKey,
    subject: env.VAPID_SUBJECT || "mailto:support@ghostmsg.app",
  };
}

/** True when the push service reports the subscription no longer exists. */
export const isGoneError = (error: unknown): boolean =>
  error instanceof WebPushError && GONE_STATUS_CODES.has(error.statusCode);

/**
 * Sends a notification to every device a user subscribed and prunes the
 * subscriptions the push service reports as gone. Never throws: push is a
 * best-effort side channel next to SSE and email.
 */
export async function sendPushToUser(
  userId: string,
  subscriptions: PushSubscriptionRecord[],
  payload: PushPayload
): Promise<{ sent: number; removed: number }> {
  const vapid = getVapidConfig();
  if (!vapid || subscriptions.length === 0) {
    return { sent: 0, removed: 0 };
  }

  const body = JSON.stringify(payload);
  const results = await Promise.allSettled(
    subscriptions.map((subscription) =>
      webpush.sendNotification(
        { endpoint: subscription.endpoint, keys: subscription.keys },
        body,
        {
          TTL: PUSH_TTL_SECONDS,
          vapidDetails: {
            subject: vapid.subject,
            publicKey: vapid.publicKey,
            privateKey: vapid.privateKey,
          },
        }
      )
    )
  );

  const goneEndpoints: string[] = [];
  let sent = 0;
  for (const [index, result] of results.entries()) {
    if (result.status === "fulfilled") {
      sent += 1;
    } else if (isGoneError(result.reason)) {
      goneEndpoints.push(subscriptions[index].endpoint);
    } else {
      console.warn("Web push delivery failed:", result.reason);
    }
  }

  if (goneEndpoints.length > 0) {
    await UserModel.updateOne(
      { _id: userId },
      { $pull: { pushSubscriptions: { endpoint: { $in: goneEndpoints } } } }
    );
    await disablePushWhenNoDevices(userId);
  }

  return { sent, removed: goneEndpoints.length };
}

/**
 * `webPushEnabled` means "at least one device subscribed": switch it off only
 * once the last subscription is gone, never because one device opted out.
 */
export async function disablePushWhenNoDevices(userId: string): Promise<void> {
  await UserModel.updateOne(
    { _id: userId, pushSubscriptions: { $size: 0 } },
    { $set: { "notificationSettings.webPushEnabled": false } }
  );
}

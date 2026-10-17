import "server-only";
import type { NotificationSettings, User } from "@/server/models/user.model";

/**
 * Plain API shapes for the settings endpoints. Documents created before
 * these fields existed get the schema defaults here, so the client never
 * sees `undefined` sections.
 */

type UserFields = Pick<
  User,
  | "username"
  | "email"
  | "displayName"
  | "avatarUrl"
  | "amaPrompt"
  | "showAmaBanner"
  | "messagePreferences"
  | "safetySettings"
>;

export const DEFAULT_AMA_PROMPT = "Send me an anonymous message!";

export function toUserProfile(user: Partial<UserFields>) {
  return {
    amaPrompt: user.amaPrompt || DEFAULT_AMA_PROMPT,
    avatarUrl: user.avatarUrl ?? null,
    displayName: user.displayName ?? "",
    email: user.email ?? "",
    showAmaBanner: user.showAmaBanner ?? true,
    username: user.username ?? "",
  };
}

export function toUserPreferences(user: Partial<UserFields>) {
  return {
    messages: {
      offerSuggestions: user.messagePreferences?.offerSuggestions ?? true,
      publishByDefault: user.messagePreferences?.publishByDefault ?? false,
    },
    safety: {
      blurSpicy: user.safetySettings?.blurSpicy ?? false,
      quarantineEnabled: user.safetySettings?.quarantineEnabled ?? true,
      sensitivity: user.safetySettings?.sensitivity ?? "balanced",
    },
  };
}

/** Blocked senders with dates; legacy hashes without a record get none. */
export function toBlockedSenders(
  hashes: string[] = [],
  records: { blockedAt?: Date; hash: string }[] = []
): { blockedAt?: string; hash: string }[] {
  const dates = new Map(records.map((r) => [r.hash, r.blockedAt]));
  return hashes.map((hash) => {
    const blockedAt = dates.get(hash);
    return blockedAt
      ? { blockedAt: new Date(blockedAt).toISOString(), hash }
      : { hash };
  });
}

/** Notification settings with defaults (quiet hours default off, UTC). */
export function toNotificationSettings(
  settings: Partial<NotificationSettings> | undefined
) {
  return {
    emailAlerts: settings?.emailAlerts ?? "instant",
    hideMessageText: settings?.hideMessageText ?? true,
    quietHours: {
      enabled: settings?.quietHours?.enabled ?? false,
      end: settings?.quietHours?.end ?? "08:00",
      start: settings?.quietHours?.start ?? "22:00",
      timeZone: settings?.quietHours?.timeZone ?? "UTC",
    },
    webPushEnabled: settings?.webPushEnabled ?? false,
  };
}

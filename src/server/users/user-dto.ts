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
    username: user.username ?? "",
    email: user.email ?? "",
    displayName: user.displayName ?? "",
    avatarUrl: user.avatarUrl ?? null,
    amaPrompt: user.amaPrompt || DEFAULT_AMA_PROMPT,
    showAmaBanner: user.showAmaBanner ?? true,
  };
}

export function toUserPreferences(user: Partial<UserFields>) {
  return {
    messages: {
      offerSuggestions: user.messagePreferences?.offerSuggestions ?? true,
      publishByDefault: user.messagePreferences?.publishByDefault ?? false,
    },
    safety: {
      quarantineEnabled: user.safetySettings?.quarantineEnabled ?? true,
      sensitivity: user.safetySettings?.sensitivity ?? "balanced",
      blurSpicy: user.safetySettings?.blurSpicy ?? false,
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
      ? { hash, blockedAt: new Date(blockedAt).toISOString() }
      : { hash };
  });
}

/** Notification settings with defaults (quiet hours default off, UTC). */
export function toNotificationSettings(
  settings: Partial<NotificationSettings> | undefined
) {
  return {
    emailAlerts: settings?.emailAlerts ?? "instant",
    webPushEnabled: settings?.webPushEnabled ?? false,
    hideMessageText: settings?.hideMessageText ?? true,
    quietHours: {
      enabled: settings?.quietHours?.enabled ?? false,
      start: settings?.quietHours?.start ?? "22:00",
      end: settings?.quietHours?.end ?? "08:00",
      timeZone: settings?.quietHours?.timeZone ?? "UTC",
    },
  };
}

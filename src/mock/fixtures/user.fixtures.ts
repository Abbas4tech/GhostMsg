import type { components } from "@/generated/api-schema";

export type NotificationSettingsFixture =
  components["schemas"]["NotificationSettings"];

export function buildNotificationSettings(
  overrides: Partial<NotificationSettingsFixture> = {}
): NotificationSettingsFixture {
  return { emailAlerts: "instant", webPushEnabled: false, ...overrides };
}

/** Deterministic 32-char hex sender hashes. */
export function buildBlockedHashes(count: number): string[] {
  return Array.from({ length: count }, (_, i) =>
    `${(i + 1).toString(16).padStart(2, "0")}a8f5c3d29b7e41f0a8f5c3d29b7e4`.slice(
      0,
      32
    )
  );
}

export const userSettingsScenarios = {
  defaults: {
    isAcceptingMessage: true,
    notificationSettings: buildNotificationSettings(),
    blockedSenderHashes: [] as string[],
  },
  closedWithBlocks: {
    isAcceptingMessage: false,
    notificationSettings: buildNotificationSettings({
      emailAlerts: "daily",
      webPushEnabled: true,
    }),
    blockedSenderHashes: buildBlockedHashes(3),
  },
};

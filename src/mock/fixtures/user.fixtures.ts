import type {
  BlockedSenderDto,
  NotificationSettingsDto,
  UserPreferencesDto,
  UserProfileDto,
} from "@/types/api";
import { fixtureDate } from "./messages.fixtures";
import {
  FIXTURE_AMA_PROMPT,
  FIXTURE_USERNAME,
} from "./public-profile.fixtures";

export type NotificationSettingsFixture = NotificationSettingsDto;

export function buildNotificationSettings(
  overrides: Partial<NotificationSettingsFixture> = {}
): NotificationSettingsFixture {
  return {
    emailAlerts: "instant",
    hideMessageText: true,
    quietHours: {
      enabled: false,
      end: "08:00",
      start: "22:00",
      timeZone: "Europe/London",
    },
    webPushEnabled: false,
    ...overrides,
  };
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

/** Blocked senders with stable dates (one per 10 days back). */
export function buildBlockedSenders(hashes: string[]): BlockedSenderDto[] {
  return hashes.map((hash, i) => ({
    blockedAt: fixtureDate(24 * 10 * (i + 1)),
    hash,
  }));
}

export function buildUserProfile(
  overrides: Partial<UserProfileDto> = {}
): UserProfileDto {
  return {
    amaPrompt: FIXTURE_AMA_PROMPT,
    avatarUrl: null,
    displayName: "John",
    email: "johndoe@example.com",
    showAmaBanner: true,
    username: FIXTURE_USERNAME,
    ...overrides,
  };
}

export function buildUserPreferences(
  overrides: {
    messages?: Partial<UserPreferencesDto["messages"]>;
    safety?: Partial<UserPreferencesDto["safety"]>;
  } = {}
): UserPreferencesDto {
  return {
    messages: {
      offerSuggestions: true,
      publishByDefault: false,
      ...overrides.messages,
    },
    safety: {
      blurSpicy: false,
      quarantineEnabled: true,
      sensitivity: "balanced",
      ...overrides.safety,
    },
  };
}

const closedHashes = buildBlockedHashes(3);

export const userSettingsScenarios = {
  closedWithBlocks: {
    blockedSenderHashes: closedHashes,
    blockedSenders: buildBlockedSenders(closedHashes),
    isAcceptingMessage: false,
    notificationSettings: buildNotificationSettings({
      emailAlerts: "daily",
      quietHours: {
        enabled: true,
        end: "08:00",
        start: "22:00",
        timeZone: "Europe/London",
      },
      webPushEnabled: true,
    }),
    preferences: buildUserPreferences({
      messages: { publishByDefault: true },
      safety: { blurSpicy: true, sensitivity: "strict" },
    }),
    profile: buildUserProfile({ displayName: "", showAmaBanner: false }),
  },
  defaults: {
    blockedSenderHashes: [] as string[],
    blockedSenders: [] as BlockedSenderDto[],
    isAcceptingMessage: true,
    notificationSettings: buildNotificationSettings(),
    preferences: buildUserPreferences(),
    profile: buildUserProfile(),
  },
};

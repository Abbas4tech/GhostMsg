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
    webPushEnabled: false,
    hideMessageText: true,
    quietHours: {
      enabled: false,
      start: "22:00",
      end: "08:00",
      timeZone: "Europe/London",
    },
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
    hash,
    blockedAt: fixtureDate(24 * 10 * (i + 1)),
  }));
}

export function buildUserProfile(
  overrides: Partial<UserProfileDto> = {}
): UserProfileDto {
  return {
    username: FIXTURE_USERNAME,
    email: "johndoe@example.com",
    displayName: "John",
    avatarUrl: null,
    amaPrompt: FIXTURE_AMA_PROMPT,
    showAmaBanner: true,
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
      quarantineEnabled: true,
      sensitivity: "balanced",
      blurSpicy: false,
      ...overrides.safety,
    },
  };
}

const closedHashes = buildBlockedHashes(3);

export const userSettingsScenarios = {
  defaults: {
    isAcceptingMessage: true,
    notificationSettings: buildNotificationSettings(),
    blockedSenderHashes: [] as string[],
    blockedSenders: [] as BlockedSenderDto[],
    profile: buildUserProfile(),
    preferences: buildUserPreferences(),
  },
  closedWithBlocks: {
    isAcceptingMessage: false,
    notificationSettings: buildNotificationSettings({
      emailAlerts: "daily",
      webPushEnabled: true,
      quietHours: {
        enabled: true,
        start: "22:00",
        end: "08:00",
        timeZone: "Europe/London",
      },
    }),
    blockedSenderHashes: closedHashes,
    blockedSenders: buildBlockedSenders(closedHashes),
    profile: buildUserProfile({ displayName: "", showAmaBanner: false }),
    preferences: buildUserPreferences({
      messages: { publishByDefault: true },
      safety: { sensitivity: "strict", blurSpicy: true },
    }),
  },
};

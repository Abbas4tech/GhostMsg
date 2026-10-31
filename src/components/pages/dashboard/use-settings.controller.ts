"use client";

import { useQuery } from "@tanstack/react-query";
import { signOut } from "next-auth/react";
import { useCallback, useState } from "react";
import type {
  EmailAlertMode,
  QuietHoursValue,
  SettingsAccount,
} from "@/components/blocks/settings-panel";
import { notify } from "@/components/elements/sonner";
import { fetchAllMessages } from "@/data/messages/fetch-all-messages";
import { messagesQueries } from "@/data/messages/messages.queries";
import { useAcceptMessageMutation } from "@/data/user/use-accept-message-mutation";
import { useUnblockSenderMutation } from "@/data/user/use-block-sender-mutation";
import { useNotificationSettingsMutation } from "@/data/user/use-notification-settings-mutation";
import { usePushNotification } from "@/data/user/use-push-notification";
import { useUpdatePreferencesMutation } from "@/data/user/use-update-preferences-mutation";
import { userQueries } from "@/data/user/user.queries";
import { downloadTextFile } from "@/lib/browser/download";
import {
  buildMessagesExport,
  type MessageExportFormat,
} from "@/lib/messages/export";
import type { QuarantineSensitivity } from "@/types/api";

export interface UseSettingsControllerOptions {
  acceptMessages?: boolean;
  isSubmitting?: boolean;
  onToggle?: () => void;
}

const DEFAULT_QUIET_HOURS: QuietHoursValue = {
  enabled: false,
  end: "08:00",
  start: "22:00",
};

/** The browser's IANA zone, so quiet hours follow the recipient's clock. */
const currentTimeZone = (): string =>
  Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";

/**
 * Settings page: Message Acceptance, Messages + Safety preferences,
 * notifications (email, push, hidden text, quiet hours), the blocklist,
 * exporting every message and (phones) the account card + Sign out. Browser
 * push APIs stay behind the push adapter.
 */
export function useSettingsController({
  acceptMessages: controlledAcceptMessages,
  isSubmitting: controlledIsSubmitting,
  onToggle: controlledOnToggle,
}: UseSettingsControllerOptions = {}) {
  const { data: statusData } = useQuery(userQueries.acceptance());
  const { data: notifData } = useQuery(userQueries.notifications());
  const { data: blockedData } = useQuery(userQueries.blockedSenders());
  const { data: preferencesData } = useQuery(userQueries.preferences());
  const { data: profileData } = useQuery(userQueries.profile());
  const { data: countsData } = useQuery(messagesQueries.counts());

  const acceptMutation = useAcceptMessageMutation();
  const notifMutation = useNotificationSettingsMutation();
  const preferencesMutation = useUpdatePreferencesMutation();
  const unblockMutation = useUnblockSenderMutation();
  const pushAdapter = usePushNotification();

  const isAccepting =
    controlledAcceptMessages ?? Boolean(statusData?.isAcceptingMessage ?? true);

  const handleToggleAcceptance = useCallback(() => {
    if (controlledOnToggle) {
      controlledOnToggle();
      return;
    }
    acceptMutation.mutate(!isAccepting);
  }, [controlledOnToggle, acceptMutation, isAccepting]);

  const { mutate: updateNotifications } = notifMutation;
  const handleEmailAlertChange = useCallback(
    (mode: EmailAlertMode) => updateNotifications({ emailAlerts: mode }),
    [updateNotifications]
  );
  const handleHideMessageTextChange = useCallback(
    (hideMessageText: boolean) => updateNotifications({ hideMessageText }),
    [updateNotifications]
  );
  const handleQuietHoursChange = useCallback(
    (quietHours: QuietHoursValue) =>
      updateNotifications({
        quietHours: { ...quietHours, timeZone: currentTimeZone() },
      }),
    [updateNotifications]
  );

  const { subscribe, unsubscribe } = pushAdapter;
  const handleToggleWebPush = useCallback(
    async (enabled: boolean) => {
      await (enabled ? subscribe() : unsubscribe());
    },
    [subscribe, unsubscribe]
  );

  const { mutate: updatePreferences } = preferencesMutation;
  const preferences = preferencesData?.preferences;

  const { mutate: unblock } = unblockMutation;
  const handleUnblock = useCallback(
    (senderHash: string) => unblock(senderHash),
    [unblock]
  );
  const handleUnblockAll = useCallback(() => unblock("ALL"), [unblock]);

  // "Export all" pages through the server: every message, not just what's loaded.
  const [isExporting, setIsExporting] = useState(false);
  const handleExport = useCallback(async (format: MessageExportFormat) => {
    setIsExporting(true);
    try {
      const messages = await fetchAllMessages("any");
      downloadTextFile(buildMessagesExport(messages, format));
    } catch (error) {
      notify.error(
        error instanceof Error && error.message
          ? error.message
          : "Couldn't export your messages"
      );
    } finally {
      setIsExporting(false);
    }
  }, []);

  const handleSignOut = useCallback(() => {
    signOut({ callbackUrl: "/" });
  }, []);

  const profile = profileData?.profile;
  const account: SettingsAccount | undefined = profile
    ? {
        avatarUrl: profile.avatarUrl,
        displayName: profile.displayName,
        email: profile.email,
        username: profile.username,
      }
    : undefined;

  const notifications = notifData?.notificationSettings;
  const blockedHashes = blockedData?.blockedSenderHashes ?? [];

  return {
    account,
    blockedHashes,
    blockedSenders:
      blockedData?.blockedSenders ?? blockedHashes.map((hash) => ({ hash })),
    blurSpicy: preferences?.safety.blurSpicy ?? false,
    // Notifications
    email: profile?.email ?? "",
    emailAlerts: (notifications?.emailAlerts ?? "instant") as EmailAlertMode,
    handleBlurSpicyChange: (blurSpicy: boolean) =>
      updatePreferences({ safety: { blurSpicy } }),
    handleEmailAlertChange,
    handleExport,
    handleHideMessageTextChange,
    handleOfferSuggestionsChange: (offerSuggestions: boolean) =>
      updatePreferences({ messages: { offerSuggestions } }),
    handlePublishByDefaultChange: (publishByDefault: boolean) =>
      updatePreferences({ messages: { publishByDefault } }),
    handleQuarantineChange: (quarantineEnabled: boolean) =>
      updatePreferences({ safety: { quarantineEnabled } }),
    handleQuietHoursChange,
    handleSensitivityChange: (sensitivity: QuarantineSensitivity) =>
      updatePreferences({ safety: { sensitivity } }),
    handleSignOut,
    handleToggleAcceptance,
    handleToggleWebPush,
    handleUnblock,
    handleUnblockAll,
    hideMessageText: notifications?.hideMessageText ?? true,
    isAcceptancePending: controlledIsSubmitting ?? acceptMutation.isPending,
    // Messages
    isAccepting,
    isExporting,
    isNotificationPending: notifMutation.isPending,
    isUnblockPending: unblockMutation.isPending,
    isWebPushPending: pushAdapter.isPending || notifMutation.isPending,
    offerSuggestions: preferences?.messages.offerSuggestions ?? true,
    publishByDefault: preferences?.messages.publishByDefault ?? false,
    // Safety
    quarantineEnabled: preferences?.safety.quarantineEnabled ?? true,
    quietHours: {
      enabled:
        notifications?.quietHours?.enabled ?? DEFAULT_QUIET_HOURS.enabled,
      end: notifications?.quietHours?.end ?? DEFAULT_QUIET_HOURS.end,
      start: notifications?.quietHours?.start ?? DEFAULT_QUIET_HOURS.start,
    },
    sensitivity: (preferences?.safety.sensitivity ??
      "balanced") as QuarantineSensitivity,
    // Data
    totalMessages: countsData?.counts.total ?? 0,
    // This device's subscription, not the account flag (push is per device).
    webPushEnabled:
      Boolean(notifications?.webPushEnabled) &&
      pushAdapter.isSubscribedHere === true,
  };
}

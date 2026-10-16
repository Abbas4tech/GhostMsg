"use client";

import { useQuery } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import type {
  EmailAlertMode,
  QuietHoursValue,
} from "@/components/blocks/settings-panel";
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
  start: "22:00",
  end: "08:00",
};

/** The browser's IANA zone, so quiet hours follow the recipient's clock. */
const currentTimeZone = (): string =>
  Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";

/**
 * Settings page: Message Acceptance, Messages + Safety preferences,
 * notifications (email, push, hidden text, quiet hours), the blocklist and
 * exporting every message. Browser push APIs stay behind the push adapter.
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
      toast.error(
        error instanceof Error && error.message
          ? error.message
          : "Couldn't export your messages"
      );
    } finally {
      setIsExporting(false);
    }
  }, []);

  const notifications = notifData?.notificationSettings;
  const blockedHashes = blockedData?.blockedSenderHashes ?? [];

  return {
    // Messages
    isAccepting,
    isAcceptancePending: controlledIsSubmitting ?? acceptMutation.isPending,
    handleToggleAcceptance,
    offerSuggestions: preferences?.messages.offerSuggestions ?? true,
    handleOfferSuggestionsChange: (offerSuggestions: boolean) =>
      updatePreferences({ messages: { offerSuggestions } }),
    publishByDefault: preferences?.messages.publishByDefault ?? false,
    handlePublishByDefaultChange: (publishByDefault: boolean) =>
      updatePreferences({ messages: { publishByDefault } }),
    // Safety
    quarantineEnabled: preferences?.safety.quarantineEnabled ?? true,
    handleQuarantineChange: (quarantineEnabled: boolean) =>
      updatePreferences({ safety: { quarantineEnabled } }),
    sensitivity: (preferences?.safety.sensitivity ??
      "balanced") as QuarantineSensitivity,
    handleSensitivityChange: (sensitivity: QuarantineSensitivity) =>
      updatePreferences({ safety: { sensitivity } }),
    blurSpicy: preferences?.safety.blurSpicy ?? false,
    handleBlurSpicyChange: (blurSpicy: boolean) =>
      updatePreferences({ safety: { blurSpicy } }),
    blockedHashes,
    blockedSenders:
      blockedData?.blockedSenders ?? blockedHashes.map((hash) => ({ hash })),
    isUnblockPending: unblockMutation.isPending,
    handleUnblock,
    handleUnblockAll,
    // Notifications
    email: profileData?.profile.email ?? "",
    emailAlerts: (notifications?.emailAlerts ?? "instant") as EmailAlertMode,
    isNotificationPending: notifMutation.isPending,
    handleEmailAlertChange,
    // This device's subscription, not the account flag (push is per device).
    webPushEnabled:
      Boolean(notifications?.webPushEnabled) &&
      pushAdapter.isSubscribedHere === true,
    isWebPushPending: pushAdapter.isPending || notifMutation.isPending,
    handleToggleWebPush,
    hideMessageText: notifications?.hideMessageText ?? true,
    handleHideMessageTextChange,
    quietHours: {
      enabled:
        notifications?.quietHours?.enabled ?? DEFAULT_QUIET_HOURS.enabled,
      start: notifications?.quietHours?.start ?? DEFAULT_QUIET_HOURS.start,
      end: notifications?.quietHours?.end ?? DEFAULT_QUIET_HOURS.end,
    },
    handleQuietHoursChange,
    // Data
    totalMessages: countsData?.counts.total ?? 0,
    handleExport,
    isExporting,
  };
}

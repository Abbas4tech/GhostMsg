"use client";

import { useQuery } from "@tanstack/react-query";
import { useCallback } from "react";
import type { EmailAlertMode } from "@/components/blocks/settings-panel";
import { useAcceptMessageMutation } from "@/hooks/mutations/use-accept-message-mutation";
import { useUnblockSenderMutation } from "@/hooks/mutations/use-block-sender-mutation";
import { useNotificationSettingsMutation } from "@/hooks/mutations/use-notification-settings-mutation";
import { usePushNotification } from "@/lib/push-notification-adapter";
import { userQueries } from "@/queries/user.queries";

export interface UseSettingsControllerOptions {
  acceptMessages?: boolean;
  isSubmitting?: boolean;
  onToggle?: () => void;
}

/**
 * Headless state for the Settings tab: acceptance, email alerts, web push and
 * the sender blocklist. Browser push APIs stay behind the push adapter seam.
 */
export function useSettingsController({
  acceptMessages: controlledAcceptMessages,
  isSubmitting: controlledIsSubmitting,
  onToggle: controlledOnToggle,
}: UseSettingsControllerOptions = {}) {
  const { data: statusData } = useQuery(userQueries.acceptance());
  const { data: notifData } = useQuery(userQueries.notifications());
  const { data: blockedData } = useQuery(userQueries.blockedSenders());

  const acceptMutation = useAcceptMessageMutation();
  const notifMutation = useNotificationSettingsMutation();
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

  const handleEmailAlertChange = useCallback(
    (mode: EmailAlertMode) => {
      notifMutation.mutate({ emailAlerts: mode });
    },
    [notifMutation]
  );

  const { subscribe, unsubscribe } = pushAdapter;
  const handleToggleWebPush = useCallback(
    async (enabled: boolean) => {
      await (enabled ? subscribe() : unsubscribe());
    },
    [subscribe, unsubscribe]
  );

  const handleUnblock = useCallback(
    (senderHash: string) => {
      unblockMutation.mutate(senderHash);
    },
    [unblockMutation]
  );

  const handleUnblockAll = useCallback(() => {
    unblockMutation.mutate("ALL");
  }, [unblockMutation]);

  return {
    isAccepting,
    isAcceptancePending: controlledIsSubmitting ?? acceptMutation.isPending,
    handleToggleAcceptance,
    emailAlerts: (notifData?.notificationSettings?.emailAlerts ??
      "instant") as EmailAlertMode,
    isNotificationPending: notifMutation.isPending,
    handleEmailAlertChange,
    webPushEnabled: Boolean(notifData?.notificationSettings?.webPushEnabled),
    isWebPushPending: pushAdapter.isPending || notifMutation.isPending,
    handleToggleWebPush,
    blockedHashes: blockedData?.blockedSenderHashes ?? [],
    isUnblockPending: unblockMutation.isPending,
    handleUnblock,
    handleUnblockAll,
  };
}

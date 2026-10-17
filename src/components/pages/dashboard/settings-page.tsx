"use client";

import type React from "react";
import { SettingsPanel } from "@/components/blocks/settings-panel";
import {
  DeleteAccountModal,
  DeleteAllMessagesModal,
} from "@/components/patterns/modals";
import { useAppearanceController } from "./use-appearance.controller";
import { useDangerZoneController } from "./use-danger-zone.controller";
import { useProfileLinkController } from "./use-profile-link.controller";
import {
  type UseSettingsControllerOptions,
  useSettingsController,
} from "./use-settings.controller";

export type SettingsPageProps = UseSettingsControllerOptions;

/** /dashboard/settings: every section plus the two danger-zone dialogs. */
export function SettingsPage(props: SettingsPageProps = {}): React.JSX.Element {
  const settings = useSettingsController(props);
  const appearance = useAppearanceController();
  const { username } = useProfileLinkController();
  const danger = useDangerZoneController(username);

  return (
    <>
      <SettingsPanel
        appearance={{
          mode: appearance.mode,
          onModeChange: appearance.handleModeChange,
          onPaletteChange: appearance.handlePaletteChange,
          palette: appearance.palette,
          palettes: appearance.palettes,
        }}
        danger={{
          onDeleteAccount: danger.openDeleteAccount,
          onDeleteAll: danger.openDeleteAll,
        }}
        data={{
          isExporting: settings.isExporting,
          onExport: settings.handleExport,
        }}
        messages={{
          isAcceptancePending: settings.isAcceptancePending,
          isAccepting: settings.isAccepting,
          offerSuggestions: settings.offerSuggestions,
          onOfferSuggestionsChange: settings.handleOfferSuggestionsChange,
          onPublishByDefaultChange: settings.handlePublishByDefaultChange,
          onToggleAcceptance: settings.handleToggleAcceptance,
          publishByDefault: settings.publishByDefault,
        }}
        notifications={{
          email: settings.email,
          emailAlerts: settings.emailAlerts,
          hideMessageText: settings.hideMessageText,
          isNotificationPending: settings.isNotificationPending,
          isWebPushPending: settings.isWebPushPending,
          onEmailAlertChange: settings.handleEmailAlertChange,
          onHideMessageTextChange: settings.handleHideMessageTextChange,
          onQuietHoursChange: settings.handleQuietHoursChange,
          onToggleWebPush: settings.handleToggleWebPush,
          quietHours: settings.quietHours,
          webPushEnabled: settings.webPushEnabled,
        }}
        safety={{
          blockedSenders: settings.blockedSenders,
          blurSpicy: settings.blurSpicy,
          isUnblockPending: settings.isUnblockPending,
          onBlurSpicyChange: settings.handleBlurSpicyChange,
          onQuarantineChange: settings.handleQuarantineChange,
          onSensitivityChange: settings.handleSensitivityChange,
          onUnblock: settings.handleUnblock,
          quarantineEnabled: settings.quarantineEnabled,
          sensitivity: settings.sensitivity,
        }}
      />
      <DeleteAllMessagesModal
        onConfirm={danger.handleConfirmDeleteAll}
        onOpenChange={danger.setIsDeleteAllOpen}
        open={danger.isDeleteAllOpen}
        total={settings.totalMessages}
      />
      <DeleteAccountModal
        confirmValue={danger.confirmValue}
        isPending={danger.isDeletingAccount}
        onConfirm={danger.handleConfirmDeleteAccount}
        onConfirmValueChange={danger.setConfirmValue}
        onOpenChange={danger.setIsDeleteAccountOpen}
        open={danger.isDeleteAccountOpen}
        username={danger.username}
      />
    </>
  );
}

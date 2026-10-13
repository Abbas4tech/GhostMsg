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
          palette: appearance.palette,
          palettes: appearance.palettes,
          onPaletteChange: appearance.handlePaletteChange,
        }}
        danger={{
          onDeleteAll: danger.openDeleteAll,
          onDeleteAccount: danger.openDeleteAccount,
        }}
        data={{ onExport: settings.handleExport }}
        messages={{
          isAccepting: settings.isAccepting,
          isAcceptancePending: settings.isAcceptancePending,
          onToggleAcceptance: settings.handleToggleAcceptance,
          offerSuggestions: settings.offerSuggestions,
          onOfferSuggestionsChange: settings.handleOfferSuggestionsChange,
          publishByDefault: settings.publishByDefault,
          onPublishByDefaultChange: settings.handlePublishByDefaultChange,
        }}
        notifications={{
          email: settings.email,
          emailAlerts: settings.emailAlerts,
          onEmailAlertChange: settings.handleEmailAlertChange,
          isNotificationPending: settings.isNotificationPending,
          webPushEnabled: settings.webPushEnabled,
          onToggleWebPush: settings.handleToggleWebPush,
          isWebPushPending: settings.isWebPushPending,
          hideMessageText: settings.hideMessageText,
          onHideMessageTextChange: settings.handleHideMessageTextChange,
          quietHours: settings.quietHours,
          onQuietHoursChange: settings.handleQuietHoursChange,
        }}
        safety={{
          quarantineEnabled: settings.quarantineEnabled,
          onQuarantineChange: settings.handleQuarantineChange,
          sensitivity: settings.sensitivity,
          onSensitivityChange: settings.handleSensitivityChange,
          blurSpicy: settings.blurSpicy,
          onBlurSpicyChange: settings.handleBlurSpicyChange,
          blockedSenders: settings.blockedSenders,
          isUnblockPending: settings.isUnblockPending,
          onUnblock: settings.handleUnblock,
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

export default SettingsPage;

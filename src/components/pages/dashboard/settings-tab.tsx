"use client";

import type React from "react";
import { SettingsPanel } from "@/components/blocks/settings-panel";
import {
  type UseSettingsControllerOptions,
  useSettingsController,
} from "./use-settings.controller";

export type SettingsTabProps = UseSettingsControllerOptions;

export function SettingsTab(props: SettingsTabProps = {}): React.JSX.Element {
  const settings = useSettingsController(props);

  return (
    <SettingsPanel
      blockedHashes={settings.blockedHashes}
      emailAlerts={settings.emailAlerts}
      isAcceptancePending={settings.isAcceptancePending}
      isAccepting={settings.isAccepting}
      isNotificationPending={settings.isNotificationPending}
      isUnblockPending={settings.isUnblockPending}
      isWebPushPending={settings.isWebPushPending}
      onEmailAlertChange={settings.handleEmailAlertChange}
      onToggleAcceptance={settings.handleToggleAcceptance}
      onToggleWebPush={settings.handleToggleWebPush}
      onUnblock={settings.handleUnblock}
      onUnblockAll={settings.handleUnblockAll}
      webPushEnabled={settings.webPushEnabled}
    />
  );
}

export default SettingsTab;

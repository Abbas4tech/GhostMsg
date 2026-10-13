import { userSettingsScenarios } from "@/mock/fixtures/user.fixtures";
import { noop } from "@/mock/noop";
import type { SettingsPanelProps } from "./settings-panel";

const { defaults, closedWithBlocks } = userSettingsScenarios;

export const defaultSettingsPanelArgs: SettingsPanelProps = {
  isAccepting: defaults.isAcceptingMessage,
  emailAlerts: defaults.notificationSettings.emailAlerts,
  webPushEnabled: defaults.notificationSettings.webPushEnabled,
  blockedHashes: defaults.blockedSenderHashes,
  isAcceptancePending: false,
  isNotificationPending: false,
  isWebPushPending: false,
  isUnblockPending: false,
  onToggleAcceptance: noop,
  onEmailAlertChange: noop,
  onToggleWebPush: noop,
  onUnblock: noop,
  onUnblockAll: noop,
};

export const closedWithBlocksSettingsPanelArgs = {
  isAccepting: closedWithBlocks.isAcceptingMessage,
  emailAlerts: closedWithBlocks.notificationSettings.emailAlerts,
  webPushEnabled: closedWithBlocks.notificationSettings.webPushEnabled,
  blockedHashes: closedWithBlocks.blockedSenderHashes,
} satisfies Partial<SettingsPanelProps>;

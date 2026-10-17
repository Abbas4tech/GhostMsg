import { PALETTE_OPTIONS } from "@/components/elements/palette-picker";
import { userSettingsScenarios } from "@/mock/fixtures/user.fixtures";
import { noop } from "@/mock/noop";
import type { SettingsPanelProps } from "./settings-panel";

const { defaults, closedWithBlocks } = userSettingsScenarios;

type Scenario = typeof defaults;

const toArgs = (scenario: Scenario): SettingsPanelProps => ({
  appearance: {
    mode: "system",
    onModeChange: noop,
    onPaletteChange: noop,
    palette: PALETTE_OPTIONS[0]?.value ?? "",
    palettes: PALETTE_OPTIONS,
  },
  danger: { onDeleteAccount: noop, onDeleteAll: noop },
  data: { onExport: noop },
  messages: {
    isAcceptancePending: false,
    isAccepting: scenario.isAcceptingMessage,
    offerSuggestions: scenario.preferences.messages.offerSuggestions,
    onOfferSuggestionsChange: noop,
    onPublishByDefaultChange: noop,
    onToggleAcceptance: noop,
    publishByDefault: scenario.preferences.messages.publishByDefault,
  },
  notifications: {
    email: scenario.profile.email,
    emailAlerts: scenario.notificationSettings.emailAlerts,
    hideMessageText: scenario.notificationSettings.hideMessageText,
    isNotificationPending: false,
    isWebPushPending: false,
    onEmailAlertChange: noop,
    onHideMessageTextChange: noop,
    onQuietHoursChange: noop,
    onToggleWebPush: noop,
    quietHours: scenario.notificationSettings.quietHours ?? {
      enabled: false,
      end: "08:00",
      start: "22:00",
    },
    webPushEnabled: scenario.notificationSettings.webPushEnabled,
  },
  safety: {
    blockedSenders: scenario.blockedSenders,
    blurSpicy: scenario.preferences.safety.blurSpicy,
    isUnblockPending: false,
    onBlurSpicyChange: noop,
    onQuarantineChange: noop,
    onSensitivityChange: noop,
    onUnblock: noop,
    quarantineEnabled: scenario.preferences.safety.quarantineEnabled,
    sensitivity: scenario.preferences.safety.sensitivity,
  },
});

export const defaultSettingsPanelArgs = toArgs(defaults);

export const closedWithBlocksSettingsPanelArgs = toArgs(closedWithBlocks);

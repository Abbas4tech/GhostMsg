import { PALETTE_OPTIONS } from "@/components/elements/palette-picker";
import { userSettingsScenarios } from "@/mock/fixtures/user.fixtures";
import { noop } from "@/mock/noop";
import type { SettingsPanelProps } from "./settings-panel";

const { defaults, closedWithBlocks } = userSettingsScenarios;

type Scenario = typeof defaults;

const toArgs = (scenario: Scenario): SettingsPanelProps => ({
  messages: {
    isAccepting: scenario.isAcceptingMessage,
    isAcceptancePending: false,
    offerSuggestions: scenario.preferences.messages.offerSuggestions,
    publishByDefault: scenario.preferences.messages.publishByDefault,
    onToggleAcceptance: noop,
    onOfferSuggestionsChange: noop,
    onPublishByDefaultChange: noop,
  },
  safety: {
    quarantineEnabled: scenario.preferences.safety.quarantineEnabled,
    sensitivity: scenario.preferences.safety.sensitivity,
    blurSpicy: scenario.preferences.safety.blurSpicy,
    blockedSenders: scenario.blockedSenders,
    isUnblockPending: false,
    onQuarantineChange: noop,
    onSensitivityChange: noop,
    onBlurSpicyChange: noop,
    onUnblock: noop,
  },
  notifications: {
    email: scenario.profile.email,
    emailAlerts: scenario.notificationSettings.emailAlerts,
    webPushEnabled: scenario.notificationSettings.webPushEnabled,
    hideMessageText: scenario.notificationSettings.hideMessageText,
    quietHours: scenario.notificationSettings.quietHours ?? {
      enabled: false,
      start: "22:00",
      end: "08:00",
    },
    isNotificationPending: false,
    isWebPushPending: false,
    onEmailAlertChange: noop,
    onToggleWebPush: noop,
    onHideMessageTextChange: noop,
    onQuietHoursChange: noop,
  },
  appearance: {
    mode: "system",
    palette: PALETTE_OPTIONS[0]?.value ?? "",
    palettes: PALETTE_OPTIONS,
    onModeChange: noop,
    onPaletteChange: noop,
  },
  data: { onExport: noop },
  danger: { onDeleteAll: noop, onDeleteAccount: noop },
});

export const defaultSettingsPanelArgs = toArgs(defaults);

export const closedWithBlocksSettingsPanelArgs = toArgs(closedWithBlocks);

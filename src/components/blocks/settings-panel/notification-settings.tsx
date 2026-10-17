"use client";

import type React from "react";
import { useCallback, useId } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/elements/select";
import { Switch } from "@/components/elements/switch";
import {
  SettingRow,
  SettingsDivider,
  SettingsSection,
  SwitchSetting,
} from "./settings-section";

export type EmailAlertMode = "instant" | "daily" | "off";

const EMAIL_OPTIONS: { label: string; value: EmailAlertMode }[] = [
  { label: "Instantly", value: "instant" },
  { label: "Daily digest", value: "daily" },
  { label: "Never", value: "off" },
];

const isEmailAlertMode = (value: string): value is EmailAlertMode =>
  EMAIL_OPTIONS.some((option) => option.value === value);

const HALF_HOURS = 48;
/** "00:00" … "23:30" in 30-minute steps. */
export const QUIET_HOUR_OPTIONS = Array.from({ length: HALF_HOURS }, (_, i) => {
  const hours = String(Math.floor(i / 2)).padStart(2, "0");
  return `${hours}:${i % 2 === 0 ? "00" : "30"}`;
});

export interface QuietHoursValue {
  enabled: boolean;
  end: string;
  start: string;
}

export interface NotificationSettingsProps {
  email: string;
  emailAlerts: EmailAlertMode;
  hideMessageText: boolean;
  isNotificationPending?: boolean;
  isWebPushPending?: boolean;
  onEmailAlertChange: (mode: EmailAlertMode) => void;
  onHideMessageTextChange: (value: boolean) => void;
  onQuietHoursChange: (value: QuietHoursValue) => void;
  onToggleWebPush: (enabled: boolean) => void;
  quietHours: QuietHoursValue;
  webPushEnabled: boolean;
}

function TimeSelect({
  label,
  value,
  disabled,
  onChange,
}: {
  disabled: boolean;
  label: string;
  onChange: (value: string) => void;
  value: string;
}): React.JSX.Element {
  return (
    <Select disabled={disabled} onValueChange={onChange} value={value}>
      <SelectTrigger aria-label={label} className="min-w-[110px]" size="lg">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {QUIET_HOUR_OPTIONS.map((time) => (
            <SelectItem key={time} value={time}>
              {time}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

/** Email frequency, push, hidden text and quiet hours. */
export function NotificationSettings({
  email,
  emailAlerts,
  onEmailAlertChange,
  isNotificationPending = false,
  webPushEnabled,
  onToggleWebPush,
  isWebPushPending = false,
  hideMessageText,
  onHideMessageTextChange,
  quietHours,
  onQuietHoursChange,
}: NotificationSettingsProps): React.JSX.Element {
  const quietId = useId();
  const handleEmailAlertChange = useCallback(
    (value: string) => {
      if (isEmailAlertMode(value)) {
        onEmailAlertChange(value);
      }
    },
    [onEmailAlertChange]
  );
  const handleQuietHoursEnabledChange = useCallback(
    (enabled: boolean) => {
      onQuietHoursChange({ ...quietHours, enabled });
    },
    [onQuietHoursChange, quietHours]
  );
  const handleQuietHoursStartChange = useCallback(
    (start: string) => {
      onQuietHoursChange({ ...quietHours, start });
    },
    [onQuietHoursChange, quietHours]
  );
  const handleQuietHoursEndChange = useCallback(
    (end: string) => {
      onQuietHoursChange({ ...quietHours, end });
    },
    [onQuietHoursChange, quietHours]
  );

  return (
    <SettingsSection id="notifications" title="Notifications">
      <SettingRow
        control={
          <Select
            disabled={isNotificationPending}
            onValueChange={handleEmailAlertChange}
            value={emailAlerts}
          >
            <SelectTrigger
              aria-label="Email frequency"
              className="min-w-[170px]"
              size="lg"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {EMAIL_OPTIONS.map(({ value, label }) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        }
        description={`To ${email}`}
        title="Email me about new Anonymous Messages"
      />
      <SettingsDivider />
      <SwitchSetting
        checked={webPushEnabled}
        description="On this device only."
        disabled={isWebPushPending}
        onCheckedChange={onToggleWebPush}
        title="Push notifications"
      />
      <SettingsDivider />
      <SwitchSetting
        checked={hideMessageText}
        description={
          'Alerts say "New Anonymous Message" and nothing more. Quarantined ones never notify.'
        }
        onCheckedChange={onHideMessageTextChange}
        title="Hide message text in notifications"
      />
      <SettingsDivider />
      <SettingRow
        className="flex-wrap"
        control={
          <div className="flex items-center gap-2">
            <Switch
              checked={quietHours.enabled}
              id={quietId}
              onCheckedChange={handleQuietHoursEnabledChange}
              size="xl"
            />
            <TimeSelect
              disabled={!quietHours.enabled}
              label="Quiet hours from"
              onChange={handleQuietHoursStartChange}
              value={quietHours.start}
            />
            <span className="text-muted-foreground">to</span>
            <TimeSelect
              disabled={!quietHours.enabled}
              label="Quiet hours to"
              onChange={handleQuietHoursEndChange}
              value={quietHours.end}
            />
          </div>
        }
        description="No push or email in this window."
        htmlFor={quietId}
        title="Quiet hours"
      />
    </SettingsSection>
  );
}

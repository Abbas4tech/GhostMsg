"use client";

import { Bell, Mail, ShieldAlert, ShieldCheck } from "lucide-react";
import type React from "react";
import { SettingsSection } from "@/components/blocks/settings-section";
import { Button } from "@/components/elements/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/elements/card";
import { Switch } from "@/components/elements/switch";

export type EmailAlertMode = "instant" | "daily" | "off";

const EMAIL_ALERT_OPTIONS: { label: string; mode: EmailAlertMode }[] = [
  { mode: "instant", label: "⚡ Instant Alerts" },
  { mode: "daily", label: "📅 Daily Digest" },
  { mode: "off", label: "🔕 Off" },
];

const EMAIL_ALERT_HINTS: Record<EmailAlertMode, string> = {
  instant:
    "You will receive an email notification as soon as a non-toxic message is submitted.",
  daily:
    "You will receive a daily summary of all messages received in the last 24 hours.",
  off: "Email notifications are disabled.",
};

export interface SettingsPanelProps {
  blockedHashes: string[];
  emailAlerts: EmailAlertMode;
  isAcceptancePending?: boolean;
  isAccepting: boolean;
  isNotificationPending?: boolean;
  isUnblockPending?: boolean;
  isWebPushPending?: boolean;
  onEmailAlertChange: (mode: EmailAlertMode) => void;
  onToggleAcceptance: () => void;
  onToggleWebPush: (enabled: boolean) => void;
  onUnblock: (senderHash: string) => void;
  onUnblockAll: () => void;
  webPushEnabled: boolean;
}

interface SettingsCardProps {
  children: React.ReactNode;
  className?: string;
  description: React.ReactNode;
  icon: React.ReactNode;
  title: React.ReactNode;
}

function SettingsCard({
  icon,
  title,
  description,
  className,
  children,
}: SettingsCardProps): React.JSX.Element {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className={className}>{children}</CardContent>
    </Card>
  );
}

interface BlockedSendersListProps {
  hashes: string[];
  isPending: boolean;
  onUnblock: (hash: string) => void;
  onUnblockAll: () => void;
}

function BlockedSendersList({
  hashes,
  isPending,
  onUnblock,
  onUnblockAll,
}: BlockedSendersListProps): React.JSX.Element {
  if (hashes.length === 0) {
    return (
      <p className="text-muted-foreground text-xs">
        No senders are currently blocked.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between pb-1">
        <span className="font-medium text-muted-foreground text-xs">
          {hashes.length} blocked {hashes.length === 1 ? "sender" : "senders"}
        </span>
        <Button
          className="h-7 text-red-700 text-xs hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
          disabled={isPending}
          onClick={onUnblockAll}
          size="sm"
          variant="outline"
        >
          Unblock All Senders
        </Button>
      </div>

      <div className="max-h-48 space-y-1.5 overflow-y-auto rounded-lg border p-2">
        {hashes.map((hash) => (
          <div
            className="flex items-center justify-between rounded bg-muted/40 px-3 py-1.5 text-xs"
            key={hash}
          >
            <span className="font-mono text-muted-foreground">
              {hash.slice(0, 8)}...{hash.slice(-8)}
            </span>
            <Button
              className="h-6 text-[11px]"
              disabled={isPending}
              onClick={() => onUnblock(hash)}
              size="sm"
              variant="ghost"
            >
              Unblock
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Dashboard Settings tab: acceptance, email alerts, web push and blocklist. */
export function SettingsPanel({
  isAccepting,
  isAcceptancePending = false,
  onToggleAcceptance,
  emailAlerts,
  isNotificationPending = false,
  onEmailAlertChange,
  webPushEnabled,
  isWebPushPending = false,
  onToggleWebPush,
  blockedHashes,
  isUnblockPending = false,
  onUnblock,
  onUnblockAll,
}: SettingsPanelProps): React.JSX.Element {
  return (
    <div className="space-y-6" data-slot="settings-panel">
      <SettingsCard
        description="Control whether visitors can submit new anonymous messages to your profile."
        icon={<ShieldCheck className="h-5 w-5 text-purple-500" />}
        title="Message Acceptance"
      >
        <SettingsSection
          controlId="accept-messages"
          controlSlot={
            <Switch
              checked={isAccepting}
              disabled={isAcceptancePending}
              id="accept-messages"
              onCheckedChange={onToggleAcceptance}
            />
          }
          description={
            isAccepting
              ? "Your public profile is active and accepting messages"
              : "Your public profile is closed and not accepting messages"
          }
          title="Accept Messages"
          variant="row"
        />
      </SettingsCard>

      <SettingsCard
        className="space-y-3"
        description="Choose how frequently you receive email updates when new messages arrive."
        icon={<Mail className="h-5 w-5 text-blue-500" />}
        title="Email Alert Notifications"
      >
        <div className="flex flex-wrap gap-2">
          {EMAIL_ALERT_OPTIONS.map(({ mode, label }) => (
            <Button
              className="text-xs"
              disabled={isNotificationPending}
              key={mode}
              onClick={() => onEmailAlertChange(mode)}
              size="sm"
              variant={emailAlerts === mode ? "default" : "outline"}
            >
              {label}
            </Button>
          ))}
        </div>
        <p className="text-muted-foreground text-xs">
          {EMAIL_ALERT_HINTS[emailAlerts]}
        </p>
      </SettingsCard>

      <SettingsCard
        description="Receive instant device notifications when visitors send messages, even if your tab is closed."
        icon={<Bell className="h-5 w-5 text-amber-500" />}
        title="Browser Push Notifications (PWA)"
      >
        <SettingsSection
          controlId="web-push"
          controlSlot={
            <Switch
              checked={webPushEnabled}
              disabled={isWebPushPending}
              id="web-push"
              onCheckedChange={onToggleWebPush}
            />
          }
          description={
            webPushEnabled
              ? "Push notifications are active on this device"
              : "Push notifications are disabled on this device"
          }
          title="Web Push Notifications"
          variant="row"
        />
      </SettingsCard>

      <SettingsCard
        className="space-y-3"
        description="Manage anonymous sender fingerprints blocked from delivering messages to your profile."
        icon={<ShieldAlert className="h-5 w-5 text-red-500" />}
        title={`Blocked Senders (${blockedHashes.length})`}
      >
        <BlockedSendersList
          hashes={blockedHashes}
          isPending={isUnblockPending}
          onUnblock={onUnblock}
          onUnblockAll={onUnblockAll}
        />
      </SettingsCard>
    </div>
  );
}

export default SettingsPanel;

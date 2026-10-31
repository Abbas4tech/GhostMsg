"use client";

import type React from "react";
import { useId } from "react";
import { Accordion } from "@/components/elements/accordion";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/elements/avatar";
import { Switch } from "@/components/elements/switch";
import { PageHeading } from "@/components/patterns/page-heading";
import { SectionNav } from "@/components/patterns/section-nav";
import { useActiveSection } from "@/hooks/use-active-section";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import {
  DangerZone,
  type DangerZoneProps,
  DataSettings,
  type DataSettingsProps,
} from "./account-settings";
import {
  AppearanceSettings,
  type AppearanceSettingsProps,
} from "./appearance-settings";
import {
  MessagesSettings,
  type MessagesSettingsProps,
} from "./messages-settings";
import {
  NotificationSettings,
  type NotificationSettingsProps,
} from "./notification-settings";
import { SafetySettings, type SafetySettingsProps } from "./safety-settings";
import {
  SettingsLayoutProvider,
  SettingsListGroup,
  SettingsListRow,
} from "./settings-section";

const SECTIONS = [
  { id: "messages", label: "Messages" },
  { id: "safety", label: "Safety & blocking" },
  { id: "notifications", label: "Notifications" },
  { id: "appearance", label: "Appearance" },
  { id: "data", label: "Data & account" },
];

const SECTION_IDS = SECTIONS.map((section) => section.id);

/** Who's signed in, for the phone layout's account card. */
export interface SettingsAccount {
  avatarUrl?: string | null;
  displayName: string;
  email: string;
  username: string;
}

export interface SettingsPanelProps {
  /** Phones: shown in the account card at the top. */
  account?: SettingsAccount;
  appearance: AppearanceSettingsProps;
  danger: DangerZoneProps;
  data: DataSettingsProps;
  messages: MessagesSettingsProps;
  notifications: NotificationSettingsProps;
  safety: SafetySettingsProps;
}

/** Phones: avatar, name and email, then the Message Acceptance switch. */
function AccountCard({
  account,
  messages,
}: {
  account?: SettingsAccount;
  messages: MessagesSettingsProps;
}): React.JSX.Element {
  const acceptanceId = useId();
  const {
    isAccepting,
    isAcceptancePending = false,
    onToggleAcceptance,
  } = messages;
  const name = account ? account.displayName || account.username : "";

  return (
    <SettingsListGroup>
      {account ? (
        <SettingsListRow className="min-h-18">
          <Avatar className="data-[size=lg]:size-11" size="lg">
            {account.avatarUrl ? (
              <AvatarImage alt="" src={account.avatarUrl} />
            ) : null}
            <AvatarFallback variant="brand">{name.charAt(0)}</AvatarFallback>
          </Avatar>
          <span className="flex min-w-0 flex-1 flex-col gap-px">
            <span className="truncate text-title">{name}</span>
            <span className="truncate text-muted-foreground text-sm">
              {account.email}
            </span>
          </span>
        </SettingsListRow>
      ) : null}
      <SettingsListRow className="min-h-16">
        <span className="flex min-w-0 flex-1 flex-col gap-px">
          <label className="text-title" htmlFor={acceptanceId}>
            Message Acceptance
          </label>
          <span className="flex items-center gap-1.5 text-muted-foreground text-sm">
            <span
              aria-hidden="true"
              className={cn(
                "size-2 shrink-0 rounded-full",
                isAccepting ? "bg-success" : "bg-muted-foreground"
              )}
            />
            {isAccepting ? "Accepting new messages" : "Paused for now"}
          </span>
        </span>
        <Switch
          checked={isAccepting}
          disabled={isAcceptancePending}
          id={acceptanceId}
          onCheckedChange={onToggleAcceptance}
          size="xl"
        />
      </SettingsListRow>
    </SettingsListGroup>
  );
}

/**
 * /dashboard/settings. Desktop: "On this page" navigation beside the
 * Messages, Safety, Notifications, Appearance, Data and Danger zone cards.
 * Phones (<768px): the design's grouped list (account card, Preferences
 * accordion, Data & account, Danger zone), one branch mounted at a time so
 * form-control ids never repeat.
 */
export function SettingsPanel({
  account,
  messages,
  safety,
  notifications,
  appearance,
  data,
  danger,
}: SettingsPanelProps): React.JSX.Element {
  const activeId = useActiveSection(SECTION_IDS);
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <SettingsLayoutProvider layout="list">
        <div className="flex flex-col gap-5" data-slot="settings-panel">
          <h1 className="text-h1">Settings</h1>
          <AccountCard account={account} messages={messages} />
          <SettingsListGroup label="Preferences">
            <Accordion type="multiple">
              <MessagesSettings {...messages} />
              <SafetySettings {...safety} />
              <NotificationSettings {...notifications} />
              <AppearanceSettings {...appearance} />
            </Accordion>
          </SettingsListGroup>
          <DataSettings {...data} />
          <DangerZone {...danger} />
        </div>
      </SettingsLayoutProvider>
    );
  }

  return (
    <div className="flex flex-col gap-5" data-slot="settings-panel">
      <PageHeading
        breadcrumb={[
          { href: "/dashboard", label: "Dashboard" },
          { label: "Settings" },
        ]}
        title="Settings"
      />
      <div className="flex flex-wrap items-start gap-7">
        <SectionNav
          activeId={activeId}
          className="sticky top-6 hidden w-45 shrink-0 lg:flex"
          items={SECTIONS}
        />
        <div className="flex min-w-0 flex-[1_1_520px] flex-col gap-5">
          <MessagesSettings {...messages} />
          <SafetySettings {...safety} />
          <NotificationSettings {...notifications} />
          <AppearanceSettings {...appearance} />
          <DataSettings {...data} />
          <DangerZone {...danger} />
        </div>
      </div>
    </div>
  );
}

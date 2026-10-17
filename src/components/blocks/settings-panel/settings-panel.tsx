"use client";

import type React from "react";
import { PageHeading } from "@/components/patterns/page-heading";
import { SectionNav } from "@/components/patterns/section-nav";
import { useActiveSection } from "@/hooks/use-active-section";
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

const SECTIONS = [
  { id: "messages", label: "Messages" },
  { id: "safety", label: "Safety & blocking" },
  { id: "notifications", label: "Notifications" },
  { id: "appearance", label: "Appearance" },
  { id: "data", label: "Data & account" },
];

const SECTION_IDS = SECTIONS.map((section) => section.id);

export interface SettingsPanelProps {
  appearance: AppearanceSettingsProps;
  danger: DangerZoneProps;
  data: DataSettingsProps;
  messages: MessagesSettingsProps;
  notifications: NotificationSettingsProps;
  safety: SafetySettingsProps;
}

/**
 * /dashboard/settings: "On this page" navigation beside the Messages,
 * Safety, Notifications, Appearance, Data and Danger zone sections.
 */
export function SettingsPanel({
  messages,
  safety,
  notifications,
  appearance,
  data,
  danger,
}: SettingsPanelProps): React.JSX.Element {
  const activeId = useActiveSection(SECTION_IDS);

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
          className="sticky top-6 hidden w-[180px] shrink-0 lg:flex"
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

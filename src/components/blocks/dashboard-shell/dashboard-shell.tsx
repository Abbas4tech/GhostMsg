"use client";

import { MessageSquare, Settings, User } from "lucide-react";
import type React from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/elements/tabs";
import { Text } from "@/components/elements/text";

export type DashboardTab = "messages" | "profile" | "settings";

export interface DashboardShellProps {
  defaultTab?: DashboardTab;
  /** Content for the Messages tab. */
  messages: React.ReactNode;
  /** Content for the Profile tab. */
  profile: React.ReactNode;
  /** Content for the Settings tab. */
  settings: React.ReactNode;
  username: string;
}

/** Dashboard frame: welcome heading and the Messages / Profile / Settings tabs. */
export function DashboardShell({
  username,
  messages,
  profile,
  settings,
  defaultTab = "messages",
}: DashboardShellProps): React.JSX.Element {
  return (
    <div
      className="container mx-auto max-w-6xl px-4 py-8"
      data-slot="dashboard-shell"
    >
      <div className="mb-8 flex flex-col gap-2">
        <Text as="h2" variant="h2">
          Dashboard
        </Text>
        <Text variant="muted">
          Welcome back, {username}! Manage your messages and profile settings.
        </Text>
      </div>

      <Tabs defaultValue={defaultTab}>
        <TabsList className="grid grid-cols-3">
          <TabsTrigger className="flex items-center gap-2" value="messages">
            <MessageSquare size={16} />
            Messages
          </TabsTrigger>
          <TabsTrigger className="flex items-center gap-2" value="profile">
            <User size={16} />
            Profile
          </TabsTrigger>
          <TabsTrigger className="flex items-center gap-2" value="settings">
            <Settings size={16} />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="messages">{messages}</TabsContent>
        <TabsContent value="profile">{profile}</TabsContent>
        <TabsContent value="settings">{settings}</TabsContent>
      </Tabs>
    </div>
  );
}

export default DashboardShell;

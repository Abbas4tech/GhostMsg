"use client";
import { Button } from "@react-email/components";
import { MessageSquare, Settings, User } from "lucide-react";
import type React from "react";
import { useEffect } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/animate-ui/components/radix/tabs";
import {
  DashboardSkeleton,
  MessageTab,
  ProfileTab,
  SettingsTab,
} from "@/components/dashboard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { useAcceptMessage } from "@/hooks/use-accept-message";
import { useDashboard } from "@/hooks/use-dashboard";

const Dashboard = (): React.JSX.Element => {
  const {
    session,
    status,
    messages,
    isLoading,
    isRefreshing,
    fetchMessages,
    deleteMessage,
  } = useDashboard();

  const { acceptMessages, isSubmitting, toggleAcceptMessage } =
    useAcceptMessage();

  useEffect(() => {
    if (status === "authenticated") {
      fetchMessages();
    }
  }, [status, fetchMessages]);

  if (status === "loading" || isLoading) {
    return <DashboardSkeleton />;
  }

  if (status === "unauthenticated" || !session?.user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="mx-4 w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Access Denied</CardTitle>
            <CardDescription className="text-center">
              Please log in to access your dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button onClick={() => (window.location.href = "/login")}>
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8 flex flex-col gap-2">
        <Text as={"h2"} variant={"h2"}>
          Dashboard
        </Text>
        <Text variant={"muted"}>
          Welcome back, {session.user.username}! Manage your messages and
          profile settings.
        </Text>
      </div>

      <Tabs defaultValue="messages">
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

        <TabsContent value="messages">
          <MessageTab
            isRefreshing={isRefreshing}
            messages={messages}
            onDelete={deleteMessage}
            onRefresh={() => fetchMessages(true)}
          />
        </TabsContent>

        <TabsContent value="profile">
          <ProfileTab />
        </TabsContent>

        <TabsContent value="settings">
          <SettingsTab
            acceptMessages={acceptMessages}
            isSubmitting={isSubmitting}
            onToggle={toggleAcceptMessage}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;

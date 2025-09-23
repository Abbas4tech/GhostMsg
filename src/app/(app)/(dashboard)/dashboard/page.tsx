"use client";
import React, { useEffect } from "react";
import { MessageSquare, User, Settings } from "lucide-react";
import { Button } from "@react-email/components";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDashboard } from "@/hooks/useDashboard";
import { useAcceptMessage } from "@/hooks/useAcceptMessage";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DashboardSkeleton,
  MessageTab,
  ProfileTab,
  SettingsTab,
} from "@/components/dashboard";

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
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md mx-4">
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
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex flex-col gap-2 mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {session.user.username}! Manage your messages and
          profile settings.
        </p>
      </div>

      <Tabs defaultValue="messages">
        <TabsList className="grid grid-cols-3">
          <TabsTrigger value="messages" className="flex items-center gap-2">
            <MessageSquare size={16} />
            Messages
          </TabsTrigger>
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User size={16} />
            Profile
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings size={16} />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="messages">
          <MessageTab
            onDelete={deleteMessage}
            messages={messages}
            isRefreshing={isRefreshing}
            onRefresh={() => fetchMessages(true)}
          />
        </TabsContent>

        <TabsContent value="profile">
          <ProfileTab />
        </TabsContent>

        <TabsContent value="settings">
          <SettingsTab
            acceptMessages={acceptMessages}
            onToggle={toggleAcceptMessage}
            isSubmitting={isSubmitting}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;

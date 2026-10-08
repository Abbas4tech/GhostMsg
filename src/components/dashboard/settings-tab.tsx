"use client";

import { useQuery } from "@tanstack/react-query";
import { Bell, Mail, ShieldAlert, ShieldCheck } from "lucide-react";
import type React from "react";
import { useCallback } from "react";
import { toast } from "sonner";
import { Button } from "@/components/animate-ui/components/buttons/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Text } from "@/components/ui/text";
import { useAcceptMessageMutation } from "@/hooks/mutations/use-accept-message-mutation";
import { useUnblockSenderMutation } from "@/hooks/mutations/use-block-sender-mutation";
import { useNotificationSettingsMutation } from "@/hooks/mutations/use-notification-settings-mutation";
import { usePushSubscriptionMutation } from "@/hooks/mutations/use-push-subscription-mutation";
import { userQueries } from "@/queries/user.queries";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

async function subscribeToPush(
  pushMutation: ReturnType<typeof usePushSubscriptionMutation>,
  notifMutation: ReturnType<typeof useNotificationSettingsMutation>
) {
  if (
    !(
      "Notification" in window &&
      "serviceWorker" in navigator &&
      "PushManager" in window
    )
  ) {
    toast.error("Web push notifications are not supported in this browser");
    return;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      toast.error("Notification permission was denied by your browser");
      return;
    }

    const registration = await navigator.serviceWorker.register("/sw.js");
    await navigator.serviceWorker.ready;

    const vapidPublicKey =
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ||
      "BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U";

    let subscription = await registration.pushManager.getSubscription();
    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          vapidPublicKey
        ) as BufferSource,
      });
    }

    await pushMutation.mutateAsync(subscription);
    notifMutation.mutate({ webPushEnabled: true });
  } catch (err: unknown) {
    console.error("Web Push Error:", err);
    const msg =
      err instanceof Error
        ? err.message
        : "Failed to enable push notifications";
    toast.error(msg);
  }
}

async function unsubscribeFromPush(
  notifMutation: ReturnType<typeof useNotificationSettingsMutation>
) {
  try {
    if ("serviceWorker" in navigator) {
      const registration =
        await navigator.serviceWorker.getRegistration("/sw.js");
      const subscription = await registration?.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
      }
    }
  } catch (err) {
    console.error("Error unsubscribing push:", err);
  }
  notifMutation.mutate({ webPushEnabled: false });
}

interface SettingsTabProps {
  acceptMessages?: boolean;
  isSubmitting?: boolean;
  onToggle?: () => void;
}

export const SettingsTab = ({
  acceptMessages: controlledAcceptMessages,
  isSubmitting: controlledIsSubmitting,
  onToggle: controlledOnToggle,
}: SettingsTabProps = {}): React.JSX.Element => {
  const { data: statusData } = useQuery(userQueries.acceptance());
  const { data: notifData } = useQuery(userQueries.notifications());
  const { data: blockedData } = useQuery(userQueries.blockedSenders());

  const acceptMutation = useAcceptMessageMutation();
  const notifMutation = useNotificationSettingsMutation();
  const pushMutation = usePushSubscriptionMutation();
  const unblockMutation = useUnblockSenderMutation();

  const blockedHashes = blockedData?.blockedSenderHashes || [];

  const handleUnblock = (senderHash: string) => {
    unblockMutation.mutate(senderHash);
  };

  const handleUnblockAll = () => {
    unblockMutation.mutate("ALL");
  };

  const emailAlerts = notifData?.notificationSettings?.emailAlerts ?? "instant";
  const webPushEnabled = Boolean(
    notifData?.notificationSettings?.webPushEnabled
  );

  const isAccepting =
    controlledAcceptMessages ?? Boolean(statusData?.isAcceptingMessage ?? true);

  const isSubmitting = controlledIsSubmitting ?? acceptMutation.isPending;

  const handleToggleAcceptance = useCallback(() => {
    if (controlledOnToggle) {
      controlledOnToggle();
      return;
    }
    acceptMutation.mutate(!isAccepting);
  }, [controlledOnToggle, acceptMutation, isAccepting]);

  const handleEmailAlertChange = (mode: "instant" | "daily" | "off") => {
    notifMutation.mutate({ emailAlerts: mode });
  };

  const handleToggleWebPush = (enabled: boolean) => {
    if (enabled) {
      subscribeToPush(pushMutation, notifMutation);
    } else {
      unsubscribeFromPush(notifMutation);
    }
  };

  return (
    <div className="space-y-6">
      {/* Message Acceptance Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-purple-500" />
            Message Acceptance
          </CardTitle>
          <CardDescription>
            Control whether visitors can submit new anonymous messages to your
            profile.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <label
                className="cursor-pointer font-medium text-base"
                htmlFor="accept-messages"
              >
                Accept Messages
              </label>
              <Text variant={"muted"}>
                {isAccepting
                  ? "Your public profile is active and accepting messages"
                  : "Your public profile is closed and not accepting messages"}
              </Text>
            </div>
            <Switch
              checked={isAccepting}
              disabled={isSubmitting}
              id="accept-messages"
              onCheckedChange={handleToggleAcceptance}
            />
          </div>
        </CardContent>
      </Card>

      {/* Email Notifications Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-blue-500" />
            Email Alert Notifications
          </CardTitle>
          <CardDescription>
            Choose how frequently you receive email updates when new messages
            arrive.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Button
              className="text-xs"
              disabled={notifMutation.isPending}
              onClick={() => handleEmailAlertChange("instant")}
              size="sm"
              variant={emailAlerts === "instant" ? "default" : "outline"}
            >
              ⚡ Instant Alerts
            </Button>
            <Button
              className="text-xs"
              disabled={notifMutation.isPending}
              onClick={() => handleEmailAlertChange("daily")}
              size="sm"
              variant={emailAlerts === "daily" ? "default" : "outline"}
            >
              📅 Daily Digest
            </Button>
            <Button
              className="text-xs"
              disabled={notifMutation.isPending}
              onClick={() => handleEmailAlertChange("off")}
              size="sm"
              variant={emailAlerts === "off" ? "default" : "outline"}
            >
              🔕 Off
            </Button>
          </div>
          <p className="text-muted-foreground text-xs">
            {emailAlerts === "instant" &&
              "You will receive an email notification as soon as a non-toxic message is submitted."}
            {emailAlerts === "daily" &&
              "You will receive a daily summary of all messages received in the last 24 hours."}
            {emailAlerts === "off" && "Email notifications are disabled."}
          </p>
        </CardContent>
      </Card>

      {/* Web Push Notifications Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-amber-500" />
            Browser Push Notifications (PWA)
          </CardTitle>
          <CardDescription>
            Receive instant device notifications when visitors send messages,
            even if your tab is closed.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <label
                className="cursor-pointer font-medium text-base"
                htmlFor="web-push"
              >
                Web Push Notifications
              </label>
              <Text variant={"muted"}>
                {webPushEnabled
                  ? "Push notifications are active on this device"
                  : "Push notifications are disabled on this device"}
              </Text>
            </div>
            <Switch
              checked={webPushEnabled}
              disabled={pushMutation.isPending || notifMutation.isPending}
              id="web-push"
              onCheckedChange={handleToggleWebPush}
            />
          </div>
        </CardContent>
      </Card>

      {/* Blocked Senders Management Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-red-500" />
            Blocked Senders ({blockedHashes.length})
          </CardTitle>
          <CardDescription>
            Manage anonymous sender fingerprints blocked from delivering
            messages to your profile.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {blockedHashes.length === 0 ? (
            <p className="text-muted-foreground text-xs">
              No senders are currently blocked.
            </p>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between pb-1">
                <span className="font-medium text-muted-foreground text-xs">
                  {blockedHashes.length} blocked{" "}
                  {blockedHashes.length === 1 ? "sender" : "senders"}
                </span>
                <Button
                  className="h-7 text-red-500 text-xs hover:text-red-600"
                  disabled={unblockMutation.isPending}
                  onClick={handleUnblockAll}
                  size="sm"
                  variant="outline"
                >
                  Unblock All Senders
                </Button>
              </div>

              <div className="max-h-48 space-y-1.5 overflow-y-auto rounded-lg border p-2">
                {blockedHashes.map((hash) => (
                  <div
                    className="flex items-center justify-between rounded bg-muted/40 px-3 py-1.5 text-xs"
                    key={hash}
                  >
                    <span className="font-mono text-muted-foreground">
                      {hash.slice(0, 8)}...{hash.slice(-8)}
                    </span>
                    <Button
                      className="h-6 text-[11px]"
                      disabled={unblockMutation.isPending}
                      onClick={() => handleUnblock(hash)}
                      size="sm"
                      variant="ghost"
                    >
                      Unblock
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

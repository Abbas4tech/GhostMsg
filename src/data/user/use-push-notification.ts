"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { useNotificationSettingsMutation } from "@/data/user/use-notification-settings-mutation";
import { usePushSubscriptionMutation } from "@/data/user/use-push-subscription-mutation";
import { urlBase64ToUint8Array } from "./use-push-notification.utils";

export interface PushNotificationState {
  isPending: boolean;
  isSupported: boolean;
  permission: NotificationPermission | "unsupported";
  subscribe: () => Promise<boolean>;
  unsubscribe: () => Promise<boolean>;
}

export function usePushNotification(): PushNotificationState {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<
    NotificationPermission | "unsupported"
  >("unsupported");
  const [isPending, setIsPending] = useState(false);

  const pushMutation = usePushSubscriptionMutation();
  const notifMutation = useNotificationSettingsMutation();

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "Notification" in window &&
      "serviceWorker" in navigator &&
      "PushManager" in window
    ) {
      setIsSupported(true);
      setPermission(Notification.permission);
    } else {
      setIsSupported(false);
      setPermission("unsupported");
    }
  }, []);

  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      toast.error("Web push notifications are not supported in this browser");
      return false;
    }

    setIsPending(true);
    try {
      const perm = await Notification.requestPermission();
      setPermission(perm);

      if (perm !== "granted") {
        toast.error("Notification permission was denied by your browser");
        return false;
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
      await notifMutation.mutateAsync({ webPushEnabled: true });
      return true;
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Failed to enable push notifications";
      toast.error(msg);
      return false;
    } finally {
      setIsPending(false);
    }
  }, [isSupported, pushMutation, notifMutation]);

  const unsubscribe = useCallback(async (): Promise<boolean> => {
    setIsPending(true);
    try {
      if ("serviceWorker" in navigator) {
        const registration =
          await navigator.serviceWorker.getRegistration("/sw.js");
        const subscription = await registration?.pushManager.getSubscription();
        if (subscription) {
          await subscription.unsubscribe();
        }
      }
      await notifMutation.mutateAsync({ webPushEnabled: false });
      return true;
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Failed to disable push notifications";
      toast.error(msg);
      return false;
    } finally {
      setIsPending(false);
    }
  }, [notifMutation]);

  return {
    isSupported,
    permission,
    isPending,
    subscribe,
    unsubscribe,
  };
}

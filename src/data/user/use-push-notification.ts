"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { ApiError } from "@/data/api-client";
import { queryKeys } from "@/data/query-keys";
import { useNotificationSettingsMutation } from "@/data/user/use-notification-settings-mutation";
import { usePushSubscriptionMutation } from "@/data/user/use-push-subscription-mutation";
import { useRemovePushSubscriptionMutation } from "@/data/user/use-remove-push-subscription-mutation";
import {
  describePushError,
  isSameApplicationServerKey,
  PUSH_NOT_CONFIGURED_MESSAGE,
  urlBase64ToUint8Array,
} from "./use-push-notification.utils";

const SERVICE_WORKER_URL = "/sw.js";

export interface PushNotificationState {
  isConfigured: boolean;
  isPending: boolean;
  isSupported: boolean;
  permission: NotificationPermission | "unsupported";
  subscribe: () => Promise<boolean>;
  unsubscribe: () => Promise<boolean>;
}

const isPushSupported = (): boolean =>
  typeof window !== "undefined" &&
  "Notification" in window &&
  "serviceWorker" in navigator &&
  "PushManager" in window;

/**
 * Returns this browser's subscription for `applicationServerKey`, replacing
 * one created with a different key (which would make `subscribe` throw).
 */
async function getOrCreateSubscription(
  registration: ServiceWorkerRegistration,
  applicationServerKey: Uint8Array
): Promise<PushSubscription> {
  const existing = await registration.pushManager.getSubscription();
  if (
    existing &&
    isSameApplicationServerKey(
      existing.options.applicationServerKey,
      applicationServerKey
    )
  ) {
    return existing;
  }
  await existing?.unsubscribe();
  return registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: applicationServerKey as BufferSource,
  });
}

export function usePushNotification(): PushNotificationState {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<
    NotificationPermission | "unsupported"
  >("unsupported");
  const [isPending, setIsPending] = useState(false);

  const queryClient = useQueryClient();
  const pushMutation = usePushSubscriptionMutation();
  const removeMutation = useRemovePushSubscriptionMutation();
  const notifMutation = useNotificationSettingsMutation();

  const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";
  const isConfigured = vapidPublicKey.length > 0;

  useEffect(() => {
    const supported = isPushSupported();
    setIsSupported(supported);
    setPermission(supported ? Notification.permission : "unsupported");
  }, []);

  const { mutateAsync: registerAsync } = pushMutation;
  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      toast.error("Web push notifications are not supported in this browser");
      return false;
    }
    if (!isConfigured) {
      toast.error(PUSH_NOT_CONFIGURED_MESSAGE);
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

      await navigator.serviceWorker.register(SERVICE_WORKER_URL);
      const registration = await navigator.serviceWorker.ready;
      const subscription = await getOrCreateSubscription(
        registration,
        urlBase64ToUint8Array(vapidPublicKey)
      );

      // The server stores the device and sets webPushEnabled; refresh the toggle.
      await registerAsync(subscription);
      await queryClient.invalidateQueries({
        queryKey: queryKeys.user.notifications(),
      });
      return true;
    } catch (err: unknown) {
      // API failures are already toasted by the mutation.
      if (!(err instanceof ApiError)) {
        console.error("Enabling web push failed:", err);
        toast.error(describePushError(err));
      }
      return false;
    } finally {
      setIsPending(false);
    }
  }, [isSupported, isConfigured, vapidPublicKey, registerAsync, queryClient]);

  const { mutateAsync: removeAsync } = removeMutation;
  const { mutateAsync: updateSettingsAsync } = notifMutation;
  const unsubscribe = useCallback(async (): Promise<boolean> => {
    setIsPending(true);
    try {
      if ("serviceWorker" in navigator) {
        const registration =
          await navigator.serviceWorker.getRegistration(SERVICE_WORKER_URL);
        const subscription = await registration?.pushManager.getSubscription();
        if (subscription) {
          // Best effort: dead endpoints are also pruned on the next send.
          await removeAsync(subscription.endpoint).catch(() => undefined);
          await subscription.unsubscribe();
        }
      }
      await updateSettingsAsync({ webPushEnabled: false });
      return true;
    } catch (err: unknown) {
      if (!(err instanceof ApiError)) {
        toast.error(
          err instanceof Error
            ? err.message
            : "Failed to disable push notifications"
        );
      }
      return false;
    } finally {
      setIsPending(false);
    }
  }, [removeAsync, updateSettingsAsync]);

  return {
    isConfigured,
    isSupported,
    permission,
    isPending,
    subscribe,
    unsubscribe,
  };
}

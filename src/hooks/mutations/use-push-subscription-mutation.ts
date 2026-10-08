"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, clientFetch } from "@/lib/api-client";

/**
 * Registers a Web Push subscription with the server via the typed OpenAPI SDK.
 * The caller is responsible for obtaining the PushSubscription object
 * (requesting permission, registering the SW, calling pushManager.subscribe).
 *
 * The PushSubscription is serialised to JSON (endpoint + keys) which maps
 * directly to the PushSubscriptionRequest schema.
 */
export const usePushSubscriptionMutation = () => {
  return useMutation({
    mutationFn: (subscription: PushSubscription) => {
      const json = subscription.toJSON();
      return clientFetch(
        api.POST("/api/user/push-subscription", {
          body: {
            endpoint: json.endpoint ?? "",
            keys: json.keys as { p256dh: string; auth: string } | undefined,
          },
        })
      );
    },
    onSuccess: () => {
      toast.success("Web push notifications enabled! 🔔");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to register web push subscription");
    },
  });
};

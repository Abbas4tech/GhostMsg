"use client";

import { useMutation } from "@tanstack/react-query";
import { api, clientFetch } from "@/data/api-client";

/** Forgets this device's PushSubscription on the server (no toast: the caller reports). */
export const useRemovePushSubscriptionMutation = () =>
  useMutation({
    mutationFn: (endpoint: string) =>
      clientFetch(
        api.DELETE("/api/user/push-subscription", {
          body: { endpoint },
        })
      ),
  });

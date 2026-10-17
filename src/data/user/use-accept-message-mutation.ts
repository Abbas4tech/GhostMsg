import { api, clientFetch } from "@/data/api-client";
import { useOptimisticResourceMutation } from "@/data/optimistic-resource-mutation";
import { queryKeys } from "@/data/query-keys";
import type { components } from "@/generated/api-schema";

type AcceptanceResponse = components["schemas"]["AcceptMessageGetResponse"];

/**
 * Message Acceptance (sidebar, Settings, ⌘K). Optimistic and silent: the
 * switch and its "Accepting / Paused" label are the confirmation.
 */
export function useAcceptMessageMutation() {
  return useOptimisticResourceMutation<AcceptanceResponse, boolean, unknown>({
    errorMessage: "Failed to update acceptance status",
    merge: (data, acceptMessages) => ({
      ...data,
      isAcceptingMessage: acceptMessages,
    }),
    mutationFn: (acceptMessages) =>
      clientFetch(
        api.POST("/api/accept-message", { body: { acceptMessages } })
      ),
    queryKey: queryKeys.user.acceptance(),
    scopeId: "user-acceptance",
  });
}

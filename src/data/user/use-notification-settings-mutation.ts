import { api, clientFetch } from "@/data/api-client";
import { useOptimisticResourceMutation } from "@/data/optimistic-resource-mutation";
import { queryKeys } from "@/data/query-keys";
import type { components } from "@/generated/api-schema";

type NotificationSettingsPayload =
  components["schemas"]["UpdateNotificationsRequest"];
type NotificationsResponse = components["schemas"]["GetNotificationsResponse"];

/** Email frequency, push, hidden text and quiet hours. Optimistic, silent. */
export const useNotificationSettingsMutation = () =>
  useOptimisticResourceMutation<
    NotificationsResponse,
    NotificationSettingsPayload,
    unknown
  >({
    errorMessage: "Failed to update notifications",
    merge: (data, payload) => ({
      ...data,
      notificationSettings: { ...data.notificationSettings, ...payload },
    }),
    mutationFn: (body) =>
      clientFetch(api.PATCH("/api/user/notifications", { body })),
    queryKey: queryKeys.user.notifications(),
    scopeId: "user-notifications",
  });

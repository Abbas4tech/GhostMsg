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
    queryKey: queryKeys.user.notifications(),
    scopeId: "user-notifications",
    mutationFn: (body) =>
      clientFetch(api.PATCH("/api/user/notifications", { body })),
    merge: (data, payload) => ({
      ...data,
      notificationSettings: { ...data.notificationSettings, ...payload },
    }),
    errorMessage: "Failed to update notifications",
  });

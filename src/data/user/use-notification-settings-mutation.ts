import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, clientFetch } from "@/data/api-client";
import { queryKeys } from "@/data/query-keys";
import type { components } from "@/generated/api-schema";

type NotificationSettingsPayload =
  components["schemas"]["UpdateNotificationsRequest"];
type NotificationsResponse = components["schemas"]["GetNotificationsResponse"];

/** Email frequency, push, hidden text and quiet hours. Optimistic. */
export const useNotificationSettingsMutation = () => {
  const queryClient = useQueryClient();
  const key = queryKeys.user.notifications();

  return useMutation({
    mutationFn: (payload: NotificationSettingsPayload) =>
      clientFetch(
        api.PATCH("/api/user/notifications", {
          body: payload,
        })
      ),
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<NotificationsResponse>(key);
      if (previous) {
        queryClient.setQueryData<NotificationsResponse>(key, {
          ...previous,
          notificationSettings: {
            ...previous.notificationSettings,
            ...payload,
          },
        });
      }
      return { previous };
    },
    onSuccess: (data) => {
      toast.success(
        data.message || "Notification preferences saved successfully!"
      );
    },
    onError: (err: Error, _payload, context) => {
      if (context?.previous) {
        queryClient.setQueryData(key, context.previous);
      }
      toast.error(err.message || "Failed to update notifications");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: key });
    },
  });
};

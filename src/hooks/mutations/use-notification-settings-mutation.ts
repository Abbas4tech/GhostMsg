import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, clientFetch } from "@/lib/api-client";
import { queryKeys } from "@/queries/query-keys";

interface NotificationSettingsPayload {
  emailAlerts?: "instant" | "daily" | "off";
  webPushEnabled?: boolean;
}

export const useNotificationSettingsMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: NotificationSettingsPayload) =>
      clientFetch(
        api.PATCH("/api/user/notifications", {
          body: payload,
        })
      ),
    onSuccess: (data) => {
      toast.success(
        data.message || "Notification preferences saved successfully!"
      );
      queryClient.invalidateQueries({
        queryKey: queryKeys.user.notifications(),
      });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to update notifications");
    },
  });
};

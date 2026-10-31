import { useMutation, useQueryClient } from "@tanstack/react-query";
import { notify } from "@/components/elements/sonner";
import { api, clientFetch } from "@/data/api-client";
import { queryKeys } from "@/data/query-keys";

export const useBlockSenderMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (senderHash: string) =>
      clientFetch(
        api.POST("/api/block-sender", {
          body: { senderHash },
        })
      ),
    onError: (err: Error) => {
      notify.error(err.message || "Failed to block sender");
    },
    onSuccess: () => {
      notify.success(
        "Sender blocked. You will no longer receive their messages."
      );
      queryClient.invalidateQueries({ queryKey: queryKeys.messages.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.user.blockedSenders(),
      });
    },
  });
};

export const useUnblockSenderMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (senderHash: string) =>
      clientFetch(
        api.DELETE("/api/block-sender", {
          body: { senderHash },
        })
      ),
    onError: (err: Error) => {
      notify.error(err.message || "Failed to unblock sender");
    },
    onSuccess: (data) => {
      notify.success(data.message || "Sender unblocked successfully.");
      queryClient.invalidateQueries({ queryKey: queryKeys.messages.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.user.blockedSenders(),
      });
    },
  });
};

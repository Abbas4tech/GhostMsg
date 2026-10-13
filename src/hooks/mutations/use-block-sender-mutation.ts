import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, clientFetch } from "@/lib/api-client";
import { queryKeys } from "@/queries/query-keys";

export const useBlockSenderMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (senderHash: string) =>
      clientFetch(
        api.POST("/api/block-sender", {
          body: { senderHash },
        })
      ),
    onSuccess: () => {
      toast.success(
        "Sender blocked. You will no longer receive their messages."
      );
      queryClient.invalidateQueries({ queryKey: queryKeys.messages.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.user.blockedSenders(),
      });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to block sender");
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
    onSuccess: (data) => {
      toast.success(data.message || "Sender unblocked successfully.");
      queryClient.invalidateQueries({ queryKey: queryKeys.messages.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.user.blockedSenders(),
      });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to unblock sender");
    },
  });
};

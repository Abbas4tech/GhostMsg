import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, clientFetch } from "@/lib/api-client";
import { queryKeys } from "@/queries/query-keys";

interface MessagesData {
  messages: Array<{ _id: string; content: string; createdAt: string }>;
  success: boolean;
}

export interface UseDeleteMessageMutationOptions {
  suppressToast?: boolean;
}

export function useDeleteMessageMutation(
  options?: UseDeleteMessageMutationOptions
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (messageId: string) =>
      clientFetch(
        api.DELETE("/api/delete-message/{messageId}", {
          params: { path: { messageId } },
        })
      ),

    onMutate: async (messageId: string) => {
      // 1. Cancel outgoing fetches for messages
      await queryClient.cancelQueries({ queryKey: queryKeys.messages.list() });

      // 2. Snapshot previous cache
      const previousData = queryClient.getQueryData<MessagesData>(
        queryKeys.messages.list()
      );

      // 3. Optimistically remove message from cache
      if (previousData?.messages) {
        queryClient.setQueryData<MessagesData>(queryKeys.messages.list(), {
          ...previousData,
          messages: previousData.messages.filter(
            (msg) => String(msg._id) !== messageId
          ),
        });
      }

      return { previousData };
    },

    onError: (error, _messageId, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(
          queryKeys.messages.list(),
          context.previousData
        );
      }
      if (!options?.suppressToast) {
        toast.error(error.message || "Failed to delete message");
      }
    },

    onSuccess: (data) => {
      if (!options?.suppressToast) {
        toast.success(data.message || "Message deleted successfully!");
      }
    },

    onSettled: () => {
      // Re-synchronize with server
      queryClient.invalidateQueries({ queryKey: queryKeys.messages.list() });
    },
  });
}

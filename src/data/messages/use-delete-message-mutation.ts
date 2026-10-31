import { useMutation, useQueryClient } from "@tanstack/react-query";
import { notify } from "@/components/elements/sonner";
import { api, clientFetch } from "@/data/api-client";
import {
  invalidateCachedMessages,
  restoreCachedMessages,
  updateCachedMessages,
} from "./messages-cache";

export interface UseDeleteMessageMutationOptions {
  suppressToast?: boolean;
}

/**
 * Optimistic delete: the message leaves every cached inbox list immediately,
 * and comes back (with an error toast) if the server rejects the delete.
 */
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

    onError: (error, _messageId, context) => {
      restoreCachedMessages(queryClient, context?.snapshot);
      if (!options?.suppressToast) {
        notify.error(error.message || "Failed to delete message");
      }
    },

    onMutate: async (messageId: string) => {
      const snapshot = await updateCachedMessages(queryClient, (messages) =>
        messages.filter((msg) => String(msg._id) !== messageId)
      );
      return { snapshot };
    },

    onSettled: () => {
      invalidateCachedMessages(queryClient);
    },

    onSuccess: (data) => {
      if (!options?.suppressToast) {
        notify.success(data.message || "Message deleted successfully!");
      }
    },
  });
}

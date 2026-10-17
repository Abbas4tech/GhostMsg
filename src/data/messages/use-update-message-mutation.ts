import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, clientFetch } from "@/data/api-client";
import {
  invalidateCachedMessages,
  patchCachedMessage,
  restoreCachedMessages,
} from "./messages-cache";

export interface UpdateMessageParams {
  isPinned?: boolean;
  isRead?: boolean;
  messageId: string;
}

/**
 * Star / read toggles. Optimistic: every cached list changes at once and
 * rolls back with an error toast if the server rejects it (ADR 0021).
 * Silent on success; counts and lists re-sync when it settles.
 */
export const useUpdateMessageMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ messageId, isPinned, isRead }: UpdateMessageParams) =>
      clientFetch(
        api.PATCH("/api/messages/{messageId}", {
          body: { isPinned, isRead },
          params: { path: { messageId } },
        })
      ),
    onError: (error, _variables, context) => {
      restoreCachedMessages(queryClient, context?.snapshot);
      toast.error(error.message || "Failed to update message");
    },
    onMutate: async ({ messageId, isPinned, isRead }: UpdateMessageParams) => {
      const snapshot = await patchCachedMessage(queryClient, messageId, {
        ...(isPinned === undefined ? {} : { isPinned }),
        ...(isRead === undefined ? {} : { isRead }),
      });
      return { snapshot };
    },
    onSettled: () => {
      invalidateCachedMessages(queryClient);
    },
  });
};

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, clientFetch } from "@/data/api-client";
import { queryKeys } from "@/data/query-keys";
import {
  invalidateCachedMessages,
  patchCachedMessage,
  restoreCachedMessages,
} from "./messages-cache";

export interface ReplyMessageParams {
  isPublished?: boolean;
  messageId: string;
  text: string;
}

/**
 * Saves (and optionally publishes) an answer. Optimistic: the card shows the
 * answer immediately and reverts with an error toast if saving fails.
 * Answering also marks the message read.
 */
export const useReplyMessageMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ messageId, text, isPublished }: ReplyMessageParams) =>
      clientFetch(
        api.POST("/api/messages/{messageId}/reply", {
          body: { isPublished: Boolean(isPublished), text },
          params: { path: { messageId } },
        })
      ),
    onError: (error, _variables, context) => {
      restoreCachedMessages(queryClient, context?.snapshot);
      toast.error(error.message || "Failed to save reply");
    },
    onMutate: async ({ messageId, text, isPublished }) => {
      const snapshot = await patchCachedMessage(queryClient, messageId, {
        isRead: true,
        reply: {
          isPublished: Boolean(isPublished),
          text,
          ...(isPublished ? { publishedAt: new Date().toISOString() } : {}),
        },
      });
      return { snapshot };
    },
    onSettled: () => {
      invalidateCachedMessages(queryClient);
      // A published answer changes the recipient's public page.
      queryClient.invalidateQueries({ queryKey: queryKeys.public.all });
    },
    onSuccess: () => {
      toast.success("Reply saved successfully!");
    },
  });
};

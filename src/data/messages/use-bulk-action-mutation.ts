import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, clientFetch } from "@/data/api-client";
import type { MessageDto } from "@/types/api";
import {
  invalidateCachedMessages,
  restoreCachedMessages,
  updateCachedMessages,
} from "./messages-cache";

interface BulkActionParams {
  action: "delete" | "read" | "star";
  ids: string[];
}

/** Mirrors the server's bulk semantics (`/api/messages/bulk`) on the cache. */
function applyBulkAction(
  messages: MessageDto[],
  { action, ids }: BulkActionParams
): MessageDto[] {
  const selected = new Set(ids);
  const isSelected = (message: MessageDto) => selected.has(String(message._id));

  if (action === "delete") {
    return messages.filter((message) => !isSelected(message));
  }
  const patch = action === "read" ? { isRead: true } : { isPinned: true };
  return messages.map((message) =>
    isSelected(message) ? { ...message, ...patch } : message
  );
}

/** Optimistic bulk delete / read / star with rollback on failure. */
export const useBulkActionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ action, ids }: BulkActionParams) =>
      clientFetch(
        api.POST("/api/messages/bulk", {
          body: { action, ids },
        })
      ),
    onMutate: async (variables: BulkActionParams) => {
      const snapshot = await updateCachedMessages(queryClient, (messages) =>
        applyBulkAction(messages, variables)
      );
      return { snapshot };
    },
    onSuccess: (_, variables) => {
      toast.success(
        `Bulk ${variables.action} applied to ${variables.ids.length} message(s)`
      );
    },
    onError: (err: Error, _variables, context) => {
      restoreCachedMessages(queryClient, context?.snapshot);
      toast.error(err.message || "Failed to perform bulk action");
    },
    onSettled: () => {
      invalidateCachedMessages(queryClient);
    },
  });
};

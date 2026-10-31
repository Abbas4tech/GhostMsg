import { useMutation, useQueryClient } from "@tanstack/react-query";
import { notify } from "@/components/elements/sonner";
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

/** One line, verb first (design toast rules). */
const BULK_DONE: Record<BulkActionParams["action"], (count: number) => string> =
  {
    delete: (count) =>
      count === 1 ? "Deleted 1 message" : `Deleted ${count} messages`,
    read: (count) =>
      count === 1 ? "Marked 1 message read" : `Marked ${count} messages read`,
    star: (count) =>
      count === 1 ? "Starred 1 message" : `Starred ${count} messages`,
  };

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
    onError: (err: Error, _variables, context) => {
      restoreCachedMessages(queryClient, context?.snapshot);
      notify.error(err.message || "Failed to perform bulk action");
    },
    onMutate: async (variables: BulkActionParams) => {
      const snapshot = await updateCachedMessages(queryClient, (messages) =>
        applyBulkAction(messages, variables)
      );
      return { snapshot };
    },
    onSettled: () => {
      invalidateCachedMessages(queryClient);
    },
    onSuccess: (_, variables) => {
      notify.success(BULK_DONE[variables.action](variables.ids.length));
    },
  });
};

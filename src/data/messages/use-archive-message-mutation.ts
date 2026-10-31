import { useMutation, useQueryClient } from "@tanstack/react-query";
import { notify } from "@/components/elements/sonner";
import { api, clientFetch } from "@/data/api-client";
import {
  invalidateCachedMessages,
  restoreCachedMessages,
  updateCachedMessages,
} from "./messages-cache";

export interface ArchiveMessageParams {
  /** true = archive, false = move back to the inbox. */
  isArchived: boolean;
  messageId: string;
}

/**
 * Archive / unarchive. Optimistic: the message leaves the list it's in at
 * once (archiving hides it from every view but Archived; unarchiving takes it
 * out of Archived) and comes back with an error toast if the server refuses.
 * A plain confirmation toast, no Undo (only Delete all has one).
 */
export function useArchiveMessageMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ messageId, isArchived }: ArchiveMessageParams) =>
      clientFetch(
        api.PATCH("/api/messages/{messageId}", {
          body: { isArchived },
          params: { path: { messageId } },
        })
      ),
    onError: (error, _variables, context) => {
      restoreCachedMessages(queryClient, context?.snapshot);
      notify.error(error.message || "Couldn't update that message");
    },
    onMutate: async ({ messageId }: ArchiveMessageParams) => {
      const snapshot = await updateCachedMessages(queryClient, (messages) =>
        messages.filter((message) => String(message._id) !== messageId)
      );
      return { snapshot };
    },
    onSettled: () => {
      invalidateCachedMessages(queryClient);
    },
    onSuccess: (_data, { isArchived }) => {
      notify.success(isArchived ? "Message archived" : "Moved back to Inbox");
    },
  });
}

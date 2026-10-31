import { useMutation, useQueryClient } from "@tanstack/react-query";
import { notify } from "@/components/elements/sonner";
import { api, clientFetch } from "@/data/api-client";
import { queryKeys } from "@/data/query-keys";

/** Danger zone: delete every message. Invalidates inbox and public Q&A. */
export function useDeleteAllMessagesMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => clientFetch(api.DELETE("/api/messages")),
    onError: (error: Error) => {
      notify.error(error.message || "Couldn't delete your messages");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.messages.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.public.all });
    },
    onSuccess: (data) => {
      notify.success(
        data.deletedCount === 1
          ? "Deleted 1 message"
          : `Deleted ${data.deletedCount} messages`
      );
    },
  });
}

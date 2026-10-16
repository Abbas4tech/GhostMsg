import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, clientFetch } from "@/data/api-client";
import { queryKeys } from "@/data/query-keys";

/** Danger zone: delete every message. Invalidates inbox and public Q&A. */
export function useDeleteAllMessagesMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => clientFetch(api.DELETE("/api/messages")),
    onError: (error: Error) => {
      toast.error(error.message || "Couldn't delete your messages");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.messages.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.public.all });
    },
    onSuccess: (data) => {
      toast.success(
        data.deletedCount === 1
          ? "Deleted 1 message"
          : `Deleted ${data.deletedCount} messages`
      );
    },
  });
}

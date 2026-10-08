import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, clientFetch } from "@/lib/api-client";
import { queryKeys } from "@/queries/query-keys";

interface UpdateMessageParams {
  isPinned?: boolean;
  isRead?: boolean;
  messageId: string;
}

export const useUpdateMessageMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ messageId, isPinned, isRead }: UpdateMessageParams) =>
      clientFetch(
        api.PATCH("/api/messages/{messageId}", {
          params: { path: { messageId } },
          body: { isPinned, isRead },
        })
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.messages.all });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to update message");
    },
  });
};

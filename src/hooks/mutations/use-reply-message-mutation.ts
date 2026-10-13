import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, clientFetch } from "@/lib/api-client";
import { queryKeys } from "@/queries/query-keys";

interface ReplyMessageParams {
  isPublished?: boolean;
  messageId: string;
  text: string;
}

export const useReplyMessageMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ messageId, text, isPublished }: ReplyMessageParams) =>
      clientFetch(
        api.POST("/api/messages/{messageId}/reply", {
          params: { path: { messageId } },
          body: { text, isPublished: Boolean(isPublished) },
        })
      ),
    onSuccess: () => {
      toast.success("Reply saved successfully!");
      queryClient.invalidateQueries({ queryKey: queryKeys.messages.all });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to save reply");
    },
  });
};

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, clientFetch } from "@/lib/api-client";
import { queryKeys } from "@/queries/query-keys";

interface BulkActionParams {
  action: "delete" | "read" | "star";
  ids: string[];
}

export const useBulkActionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ action, ids }: BulkActionParams) =>
      clientFetch(
        api.POST("/api/messages/bulk", {
          body: { action, ids },
        })
      ),
    onSuccess: (_, variables) => {
      toast.success(
        `Bulk ${variables.action} applied to ${variables.ids.length} message(s)`
      );
      queryClient.invalidateQueries({ queryKey: queryKeys.messages.all });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to perform bulk action");
    },
  });
};

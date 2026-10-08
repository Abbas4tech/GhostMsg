import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, clientFetch } from "@/lib/api-client";
import { queryKeys } from "@/queries/query-keys";

export const useAmaPromptMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (amaPrompt: string) =>
      clientFetch(
        api.PATCH("/api/user/ama-prompt", {
          body: { amaPrompt },
        })
      ),
    onSuccess: () => {
      toast.success("Profile AMA prompt updated successfully!");
      queryClient.invalidateQueries({ queryKey: queryKeys.user.all });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to update AMA prompt");
    },
  });
};

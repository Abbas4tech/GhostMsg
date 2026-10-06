import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, clientFetch } from "@/lib/api-client";
import { queryKeys } from "@/queries/query-keys";

interface AcceptanceData {
  isAcceptingMessage: boolean;
  message: string;
  success: boolean;
}

export interface UseAcceptMessageMutationOptions {
  suppressToast?: boolean;
}

export function useAcceptMessageMutation(
  options?: UseAcceptMessageMutationOptions
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (acceptMessages: boolean) =>
      clientFetch(
        api.POST("/api/accept-message", {
          body: { acceptMessages },
        })
      ),

    onMutate: async (newStatus: boolean) => {
      // 1. Cancel ongoing queries
      await queryClient.cancelQueries({
        queryKey: queryKeys.user.acceptance(),
      });

      // 2. Snapshot current state
      const previousState = queryClient.getQueryData<AcceptanceData>(
        queryKeys.user.acceptance()
      );

      // 3. Optimistically set new status in cache
      queryClient.setQueryData<AcceptanceData>(
        queryKeys.user.acceptance(),
        (old) => ({
          isAcceptingMessage: newStatus,
          message: old?.message ?? "",
          success: true,
        })
      );

      return { previousState };
    },

    onError: (error, _newStatus, context) => {
      // Rollback to previous state
      if (context?.previousState) {
        queryClient.setQueryData(
          queryKeys.user.acceptance(),
          context.previousState
        );
      }
      if (!options?.suppressToast) {
        toast.error(error.message || "Failed to update acceptance status");
      }
    },

    onSuccess: (data) => {
      if (!options?.suppressToast) {
        toast.success(
          data.message || "Message acceptance status updated successfully!"
        );
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.acceptance() });
    },
  });
}

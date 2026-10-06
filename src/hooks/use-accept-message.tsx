"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useOptimistic, useTransition } from "react";
import { toast } from "sonner";

import { api } from "@/lib/api-client";

interface useAcceptMessageReturn {
  acceptMessages: boolean;
  isSubmitting: boolean;
  toggleAcceptMessage: () => void;
}

export const useAcceptMessage = (): useAcceptMessageReturn => {
  const queryClient = useQueryClient();
  const [isPending, startTransition] = useTransition();

  const { data: statusData } = useQuery({
    queryKey: ["accept-message"],
    queryFn: async ({ signal }) => {
      const { data, error } = await api.GET("/api/accept-message", { signal });
      if (error || !data) {
        throw new Error(error?.message || "Failed to fetch acceptance status");
      }
      return data;
    },
  });

  const serverState = Boolean(statusData?.isAcceptingMessage ?? true);

  const [optimisticState, setOptimisticState] = useOptimistic(
    serverState,
    (_, newValue: boolean) => newValue
  );

  const mutation = useMutation({
    mutationFn: async (newValue: boolean) => {
      const { data, error } = await api.POST("/api/accept-message", {
        body: { acceptMessages: newValue },
      });
      if (error || !data) {
        throw new Error(error?.message || "Failed to update status");
      }
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["accept-message"] });
      toast.success(
        data.message || "Message acceptance status updated successfully!"
      );
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update status");
    },
  });

  const toggleAcceptMessage = useCallback(() => {
    const newValue = !optimisticState;

    startTransition(async () => {
      setOptimisticState(newValue);
      try {
        await mutation.mutateAsync(newValue);
      } catch {
        setOptimisticState(serverState);
      }
    });
  }, [optimisticState, serverState, setOptimisticState, mutation]);

  return {
    acceptMessages: optimisticState,
    toggleAcceptMessage,
    isSubmitting: isPending || mutation.isPending,
  };
};

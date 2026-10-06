"use client";

import { useQuery } from "@tanstack/react-query";
import { useCallback } from "react";
import { useAcceptMessageMutation } from "@/hooks/mutations/use-accept-message-mutation";
import { userQueries } from "@/queries/user.queries";

interface UseAcceptMessageReturn {
  acceptMessages: boolean;
  isSubmitting: boolean;
  toggleAcceptMessage: () => void;
}

export const useAcceptMessage = (): UseAcceptMessageReturn => {
  const { data: statusData } = useQuery(userQueries.acceptance());
  const acceptMutation = useAcceptMessageMutation();

  const isAccepting = Boolean(statusData?.isAcceptingMessage ?? true);

  const toggleAcceptMessage = useCallback(() => {
    acceptMutation.mutate(!isAccepting);
  }, [acceptMutation, isAccepting]);

  return {
    acceptMessages: isAccepting,
    toggleAcceptMessage,
    isSubmitting: acceptMutation.isPending,
  };
};

export default useAcceptMessage;

import axios, { type AxiosError } from "axios";
import {
  useCallback,
  useEffect,
  useOptimistic,
  useState,
  useTransition,
} from "react";
import { toast } from "sonner";

interface useAcceptMessageReturn {
  acceptMessages: boolean;
  isSubmitting: boolean;
  toggleAcceptMessage: () => void;
}

import type { ApiResponse } from "@/types/api-response";

export const useAcceptMessage = (): useAcceptMessageReturn => {
  const [serverState, setServerState] = useState<boolean>(true);
  const [isPending, startTransition] = useTransition();
  const [optimisticState, setOptimisticState] = useOptimistic(
    serverState,
    (_, newValue: boolean) => newValue
  );

  useEffect(() => {
    const fetchStatus = async (): Promise<void> => {
      try {
        const res = await axios.get<ApiResponse>("/api/accept-message");
        setServerState(Boolean(res.data.isAcceptingMessage));
      } catch (error) {
        const e = error as AxiosError<ApiResponse>;
        toast.error(e.response?.data.message || "Failed to fetch status");
      }
    };
    fetchStatus();
  }, []);

  const toggleAcceptMessage = useCallback(() => {
    const newValue = !optimisticState;

    startTransition(async () => {
      setOptimisticState(newValue);

      try {
        const res = await axios.post<ApiResponse>("/api/accept-message", {
          acceptMessages: newValue,
        });
        setServerState(newValue);
        toast.success(res.data.message);
      } catch (error) {
        setOptimisticState(serverState);
        const e = error as AxiosError<ApiResponse>;
        toast.error(e.response?.data.message || "Failed to update status");
      }
    });
  }, [optimisticState, serverState, setOptimisticState]);

  return {
    acceptMessages: optimisticState,
    toggleAcceptMessage,
    isSubmitting: isPending,
  };
};

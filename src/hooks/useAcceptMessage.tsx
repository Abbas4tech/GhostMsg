import {
  useState,
  useTransition,
  useOptimistic,
  useCallback,
  useEffect,
} from "react";
import axios, { AxiosError } from "axios";
import { toast } from "sonner";

interface useAcceptMessageReturn {
  acceptMessages: boolean;
  toggleAcceptMessage: () => Promise<void>;
  isSubmitting: boolean;
}
import { ApiResponse } from "@/types/ApiResponse";

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

  const toggleAcceptMessage = useCallback(async () => {
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
  }, [optimisticState, serverState, startTransition, setOptimisticState]);

  return {
    acceptMessages: optimisticState,
    toggleAcceptMessage,
    isSubmitting: isPending,
  };
};

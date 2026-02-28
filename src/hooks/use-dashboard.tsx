"use client";
import axios, {
  type AxiosError,
  type CancelToken,
  type CancelTokenSource,
} from "axios";
import type { Session } from "next-auth";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useRef, useState } from "react";

import { toast } from "sonner";

import type { Message } from "@/model/user.model";
import type { ApiResponse } from "@/types/api-response";

interface DashboardReturns {
  deleteMessage: (_message: Message) => Promise<void>;
  fetchMessages: (_isRefresh?: boolean) => Promise<void>;
  isLoading: boolean;
  isRefreshing: boolean;
  messages: Message[];
  session: Session | null;
  status: "authenticated" | "loading" | "unauthenticated";
}

export const useDashboard = (): DashboardReturns => {
  const { data: session, status } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const cancelTokenRefs = useRef<Record<string, CancelTokenSource>>({});

  const createCancelToken = (key: string): CancelToken => {
    if (cancelTokenRefs.current[key]) {
      cancelTokenRefs.current[key].cancel("Request canceled");
    }
    cancelTokenRefs.current[key] = axios.CancelToken.source();
    return cancelTokenRefs.current[key].token;
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: false
  const fetchMessages = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      const response = await axios.get<ApiResponse>("/api/get-messages", {
        cancelToken: createCancelToken("getMessages"),
      });

      setMessages(response.data.messages || []);
      if (isRefresh) {
        toast.success("Messages refreshed successfully");
      }
    } catch (error) {
      if (!axios.isCancel(error)) {
        const e = error as AxiosError<ApiResponse>;
        toast.error(e.response?.data.message || "Failed to fetch messages");
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  const deleteMessage = async (message: Message): Promise<void> => {
    try {
      const response = await axios.delete<ApiResponse>(
        `/api/delete-message/${message._id}`,
        {
          cancelToken: createCancelToken("deleteMessages"),
        }
      );
      setMessages((prev) => prev.filter((m) => m._id !== message._id));
      toast.success(response.data.message);
    } catch (error) {
      if (!axios.isCancel(error)) {
        const e = error as AxiosError<ApiResponse>;
        toast.error(e.response?.data.message || "Failed to delete message");
      }
    }
  };

  useEffect(
    () => (): void => {
      for (const source of Object.values(cancelTokenRefs.current)) {
        source.cancel("Component unmounted");
      }
    },
    []
  );

  return {
    session,
    status,
    messages,
    isLoading,
    isRefreshing,
    fetchMessages,
    deleteMessage,
  };
};

"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import axios, { AxiosError, CancelToken, CancelTokenSource } from "axios";
import { toast } from "sonner";
import { Session } from "next-auth";

import { Message } from "@/model/User";
import { ApiResponse } from "@/types/ApiResponse";

interface DashboardReturns {
  session: Session | null;
  status: "authenticated" | "loading" | "unauthenticated";
  messages: Message[];
  isLoading: boolean;
  isRefreshing: boolean;
  fetchMessages: (_isRefresh?: boolean) => Promise<void>;
  handleDeleteMessage: (_messageId: string) => void;
}

export const useDashboard = (): DashboardReturns => {
  const { data: session, status } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const cancelTokenRefs = useRef<Record<string, CancelTokenSource>>({});

  const createCancelToken = (key: string): CancelToken => {
    if (cancelTokenRefs.current[key]) {
      cancelTokenRefs.current[key].cancel("Request canceled");
    }
    cancelTokenRefs.current[key] = axios.CancelToken.source();
    return cancelTokenRefs.current[key].token;
  };

  const fetchMessages = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      const response = await axios.get<ApiResponse>("/api/get-messages", {
        cancelToken: createCancelToken("messages"),
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

  const handleDeleteMessage = useCallback((messageId: string) => {
    setMessages((prev) => prev.filter((m) => m._id !== messageId));
    toast.success("Message deleted successfully");
  }, []);

  useEffect(
    () => (): void => {
      Object.values(cancelTokenRefs.current).forEach((source) => {
        source.cancel("Component unmounted");
      });
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
    handleDeleteMessage,
  };
};

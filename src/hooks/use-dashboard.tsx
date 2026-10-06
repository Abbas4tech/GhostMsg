"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Session } from "next-auth";
import { useSession } from "next-auth/react";
import { useCallback } from "react";
import { toast } from "sonner";

import { api } from "@/lib/api-client";
import type { Message } from "@/model/user.model";

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
  const queryClient = useQueryClient();

  const {
    data: messagesResponse,
    isLoading,
    isRefetching,
    refetch,
  } = useQuery({
    queryKey: ["messages"],
    queryFn: async ({ signal }) => {
      const { data, error } = await api.GET("/api/get-messages", { signal });
      if (error || !data) {
        throw new Error(error?.message || "Failed to fetch messages");
      }
      return data;
    },
    enabled: status === "authenticated",
  });

  const deleteMutation = useMutation({
    mutationFn: async (messageId: string) => {
      const { data, error } = await api.DELETE(
        "/api/delete-message/{messageId}",
        {
          params: { path: { messageId } },
        }
      );
      if (error || !data) {
        throw new Error(error?.message || "Failed to delete message");
      }
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["messages"] });
      toast.success(data.message || "Message deleted successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete message");
    },
  });

  const fetchMessages = useCallback(
    async (isRefresh = false) => {
      try {
        await refetch();
        if (isRefresh) {
          toast.success("Messages refreshed successfully");
        }
      } catch (error) {
        const err = error as Error;
        toast.error(err.message || "Failed to fetch messages");
      }
    },
    [refetch]
  );

  const deleteMessage = async (message: Message): Promise<void> => {
    await deleteMutation.mutateAsync(String(message._id));
  };

  const messages = (messagesResponse?.messages || []) as unknown as Message[];

  return {
    session,
    status,
    messages,
    isLoading,
    isRefreshing: isRefetching,
    fetchMessages,
    deleteMessage,
  };
};

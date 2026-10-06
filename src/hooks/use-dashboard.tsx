"use client";

import { useQuery } from "@tanstack/react-query";
import type { Session } from "next-auth";
import { useSession } from "next-auth/react";
import { useCallback, useMemo } from "react";
import { toast } from "sonner";
import { useDeleteMessageMutation } from "@/hooks/mutations/use-delete-message-mutation";
import type { Message } from "@/model/user.model";
import { messagesQueries } from "@/queries/messages.queries";

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
  const deleteMutation = useDeleteMessageMutation();

  const {
    data: messagesResponse,
    isLoading,
    isRefetching,
    refetch,
  } = useQuery({
    ...messagesQueries.list(),
    enabled: status === "authenticated",
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

  const { mutateAsync: deleteMessageAsync } = deleteMutation;

  const deleteMessage = useCallback(
    async (message: Message): Promise<void> => {
      await deleteMessageAsync(String(message._id));
    },
    [deleteMessageAsync]
  );

  const messages = useMemo(
    () => (messagesResponse?.messages || []) as unknown as Message[],
    [messagesResponse?.messages]
  );

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

export default useDashboard;

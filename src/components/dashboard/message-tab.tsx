"use client";

import { useQuery } from "@tanstack/react-query";
import { MessageSquare, RefreshCw } from "lucide-react";
import type React from "react";
import { useCallback, useMemo } from "react";
import { toast } from "sonner";
import { LiquidButton } from "@/components/animate-ui/components/buttons/liquid";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Message } from "@/model/user.model";
import { messagesQueries } from "@/queries/messages.queries";
import MessageCard from "./message-card";

interface MessageTabProps {
  isRefreshing?: boolean;
  messages?: Message[];
  onDelete?: (_message: Message) => Promise<void>;
  onRefresh?: () => void;
}

export const MessageTab = ({
  messages: initialMessages,
  isRefreshing: initialIsRefreshing,
  onRefresh: customOnRefresh,
  onDelete,
}: MessageTabProps = {}): React.JSX.Element => {
  const {
    data: messagesResponse,
    isRefetching,
    refetch,
  } = useQuery(messagesQueries.list());

  const messages = useMemo(
    () =>
      initialMessages ??
      ((messagesResponse?.messages || []) as unknown as Message[]),
    [initialMessages, messagesResponse?.messages]
  );

  const isRefreshing = initialIsRefreshing ?? isRefetching;

  const handleRefresh = useCallback(async () => {
    if (customOnRefresh) {
      customOnRefresh();
      return;
    }
    try {
      await refetch();
      toast.success("Messages refreshed successfully");
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || "Failed to fetch messages");
    }
  }, [customOnRefresh, refetch]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Your Messages</CardTitle>
          <CardDescription className="mt-1">
            {messages.length > 0
              ? `You have ${messages.length} message${messages.length === 1 ? "" : "s"}`
              : "You haven't received any messages yet"}
          </CardDescription>
        </div>
        <LiquidButton
          className="gap-0"
          disabled={isRefreshing}
          onClick={handleRefresh}
        >
          <RefreshCw
            className={cn("h-4 w-4", isRefreshing ? "animate-spin" : "")}
          />
          <span className="ml-2">Refresh</span>
        </LiquidButton>
      </CardHeader>
      <CardContent>
        {messages.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-2">
            {messages.map((message) => (
              <MessageCard
                key={message._id as string}
                message={message}
                onDelete={onDelete}
              />
            ))}
          </div>
        ) : (
          <div className="py-12 text-center">
            <MessageSquare className="mx-auto mb-4 h-12 w-12 text-gray-300" />
            <h3 className="mb-2 font-medium text-lg">No messages yet</h3>
            <p className="mb-4 text-gray-500">
              Share your profile link to start receiving messages
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

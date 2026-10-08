"use client";

import { useQuery } from "@tanstack/react-query";
import { LayoutGrid, LayoutList, MessageSquare, RefreshCw } from "lucide-react";
import { useSession } from "next-auth/react";
import type React from "react";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { LiquidButton } from "@/components/animate-ui/components/buttons/liquid";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useLiveMessages } from "@/hooks/use-live-messages";
import { cn } from "@/lib/utils";
import type { Message } from "@/model/user.model";
import { messagesQueries } from "@/queries/messages.queries";
import { BulkActionToolbar } from "./bulk-action-toolbar";
import MessageCard from "./message-card";
import {
  MessageFilterBar,
  type MessageFilterStatus,
} from "./message-filter-bar";
import { SmartReplyModal } from "./smart-reply-modal";
import { StoryCardModal } from "./story-card-modal";

interface MessageTabProps {
  isRefreshing?: boolean;
  messages?: Message[];
  onDelete?: (_message: Message) => Promise<void>;
  onRefresh?: () => void;
}

function matchesStatus(message: Message, status: MessageFilterStatus): boolean {
  switch (status) {
    case "unread":
      return !(message.isQuarantined || message.isRead);
    case "starred":
      return Boolean(message.isPinned);
    case "quarantined":
      return Boolean(message.isQuarantined);
    case "answered":
      return Boolean(
        message.reply?.text && message.reply.text.trim().length > 0
      );
    default:
      return !message.isQuarantined;
  }
}

function matchesSearch(message: Message, query: string): boolean {
  if (!query.trim()) {
    return true;
  }
  const q = query.toLowerCase();
  const contentMatch = message.content.toLowerCase().includes(q);
  const replyMatch = Boolean(message.reply?.text?.toLowerCase().includes(q));
  return contentMatch || replyMatch;
}

export const MessageTab = ({
  messages: initialMessages,
  isRefreshing: initialIsRefreshing,
  onRefresh: customOnRefresh,
  onDelete,
}: MessageTabProps = {}): React.JSX.Element => {
  const { data: session } = useSession();
  const username = session?.user?.username || "user";

  // Activate live real-time Server-Sent Events listener
  useLiveMessages();

  // Local interactive state
  const [activeStatus, setActiveStatus] = useState<MessageFilterStatus>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [replyingMessage, setReplyingMessage] = useState<Message | null>(null);
  const [storyCardMessage, setStoryCardMessage] = useState<Message | null>(
    null
  );
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const {
    data: messagesResponse,
    isRefetching,
    refetch,
  } = useQuery(messagesQueries.list());

  const allRawMessages = useMemo(
    () =>
      initialMessages ??
      ((messagesResponse?.messages || []) as unknown as Message[]),
    [initialMessages, messagesResponse?.messages]
  );

  // Filter calculations
  const counts = useMemo(() => {
    const unread = allRawMessages.filter(
      (m) => !(m.isQuarantined || m.isRead)
    ).length;
    const starred = allRawMessages.filter((m) => m.isPinned).length;
    const quarantined = allRawMessages.filter((m) => m.isQuarantined).length;
    const answered = allRawMessages.filter(
      (m) => m.reply?.text && m.reply.text.trim().length > 0
    ).length;
    const all = allRawMessages.filter((m) => !m.isQuarantined).length;

    return { all, unread, starred, quarantined, answered };
  }, [allRawMessages]);

  const filteredMessages = useMemo(() => {
    return allRawMessages.filter(
      (m) => matchesStatus(m, activeStatus) && matchesSearch(m, searchQuery)
    );
  }, [allRawMessages, activeStatus, searchQuery]);

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

  const handleToggleSelect = (messageId: string) => {
    setSelectedIds((prev) =>
      prev.includes(messageId)
        ? prev.filter((id) => id !== messageId)
        : [...prev, messageId]
    );
  };

  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle>Your Messages</CardTitle>
          <CardDescription className="mt-1">
            {allRawMessages.length > 0
              ? `You have ${allRawMessages.length} total message${
                  allRawMessages.length === 1 ? "" : "s"
                }`
              : "You haven't received any messages yet"}
          </CardDescription>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Grid / List view toggle */}
          <div className="flex items-center rounded-md border p-0.5">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className={cn(
                    "rounded p-1.5 transition-colors",
                    viewMode === "grid"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  onClick={() => setViewMode("grid")}
                  type="button"
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent>Grid view</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className={cn(
                    "rounded p-1.5 transition-colors",
                    viewMode === "list"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  onClick={() => setViewMode("list")}
                  type="button"
                >
                  <LayoutList className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent>List view</TooltipContent>
            </Tooltip>
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
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Search & Sub-Filter Bar */}
        {allRawMessages.length > 0 && (
          <MessageFilterBar
            activeStatus={activeStatus}
            counts={counts}
            onSearchChange={setSearchQuery}
            onStatusChange={setActiveStatus}
            searchQuery={searchQuery}
          />
        )}

        {/* Message Grid / List */}
        {filteredMessages.length > 0 ? (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 gap-4 md:grid-cols-2"
                : "flex flex-col gap-3"
            }
          >
            {filteredMessages.map((message) => (
              <MessageCard
                isSelected={selectedIds.includes(String(message._id))}
                key={String(message._id)}
                message={message}
                onDelete={onDelete}
                onOpenReply={(msg) => setReplyingMessage(msg)}
                onOpenStoryCard={(msg) => setStoryCardMessage(msg)}
                onToggleSelect={handleToggleSelect}
              />
            ))}
          </div>
        ) : (
          <div className="py-12 text-center">
            <MessageSquare className="mx-auto mb-4 h-12 w-12 text-muted-foreground/40" />
            <h3 className="mb-2 font-medium text-lg">
              {allRawMessages.length === 0
                ? "No messages yet"
                : "No matching messages found"}
            </h3>
            <p className="mb-4 text-muted-foreground text-sm">
              {allRawMessages.length === 0
                ? "Share your profile link to start receiving anonymous messages"
                : "Try adjusting your search query or active filter chips"}
            </p>
          </div>
        )}
      </CardContent>

      {/* Floating Bulk Action Toolbar */}
      <BulkActionToolbar
        allMessages={allRawMessages}
        onClearSelection={() => setSelectedIds([])}
        selectedIds={selectedIds}
      />

      {/* Reply Modal */}
      <SmartReplyModal
        isOpen={Boolean(replyingMessage)}
        message={replyingMessage}
        onClose={() => setReplyingMessage(null)}
      />

      {/* Story Card Modal */}
      <StoryCardModal
        isOpen={Boolean(storyCardMessage)}
        message={storyCardMessage}
        onClose={() => setStoryCardMessage(null)}
        username={username}
      />
    </Card>
  );
};

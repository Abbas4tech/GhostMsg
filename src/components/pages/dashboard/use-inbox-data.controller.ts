"use client";

import {
  keepPreviousData,
  useInfiniteQuery,
  useQuery,
} from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import { toast } from "sonner";
import type { MessageFilterStatus } from "@/components/patterns/filter-bar";
import { messagesQueries } from "@/data/messages/messages.queries";
import { useLiveMessages } from "@/data/messages/use-live-messages";
import { userQueries } from "@/data/user/user.queries";
import { EMPTY_INBOX_COUNTS } from "@/lib/messages/inbox-filter";
import type { MessageDto } from "@/types/api";

/** Poll this often while the live stream is down (e.g. serverless instances). */
export const INBOX_POLL_MS = 30 * 1000;

const NO_MESSAGES: MessageDto[] = [];

export interface UseInboxDataControllerOptions {
  /** Trimmed, debounced search. */
  q: string;
  status: MessageFilterStatus;
}

/**
 * Inbox server state: one page-able list per filter + search, the counts,
 * the live stream (which also inserts new messages into the cache), and a
 * polling fallback whenever the stream is not connected.
 */
export function useInboxDataController({
  status,
  q,
}: UseInboxDataControllerOptions) {
  const { data: notificationsData } = useQuery(userQueries.notifications());
  const { isConnected } = useLiveMessages({
    hideMessageText:
      notificationsData?.notificationSettings.hideMessageText ?? true,
  });
  const refetchInterval = isConnected ? false : INBOX_POLL_MS;

  const inboxQuery = useInfiniteQuery({
    ...messagesQueries.inbox({ q, status }),
    // Keep the current list on screen while another filter loads.
    placeholderData: keepPreviousData,
    refetchInterval,
  });
  const countsQuery = useQuery({
    ...messagesQueries.counts(),
    refetchInterval,
  });

  const messages = useMemo(
    () =>
      inboxQuery.data?.pages.flatMap((page) => page.messages) ?? NO_MESSAGES,
    [inboxQuery.data]
  );
  const loadedIds = useMemo(
    () => new Set(messages.map((message) => String(message._id))),
    [messages]
  );
  const counts = countsQuery.data?.counts ?? EMPTY_INBOX_COUNTS;

  const { refetch: refetchInbox, fetchNextPage } = inboxQuery;
  const { refetch: refetchCounts } = countsQuery;
  const handleRefresh = useCallback(async () => {
    const [result] = await Promise.all([refetchInbox(), refetchCounts()]);
    if (result.isError) {
      toast.error(result.error?.message || "Failed to fetch messages");
      return;
    }
    toast.success("Messages refreshed successfully");
  }, [refetchInbox, refetchCounts]);
  const handleLoadMore = useCallback(() => {
    fetchNextPage();
  }, [fetchNextPage]);

  return {
    counts,
    handleRefresh,
    isLiveConnected: isConnected,
    isLoading: inboxQuery.isLoading,
    isRefreshing:
      (inboxQuery.isRefetching && !inboxQuery.isFetchingNextPage) ||
      inboxQuery.isPlaceholderData,
    loadedIds,
    messages,
    pagination: {
      hasMore: Boolean(inboxQuery.hasNextPage),
      isLoadingMore: inboxQuery.isFetchingNextPage,
      onLoadMore: handleLoadMore,
    },
    /** Every message the recipient has (drives the first-run empty state). */
    totalMessages: Math.max(counts.total, messages.length),
  };
}

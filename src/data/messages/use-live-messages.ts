"use client";

import {
  type InfiniteData,
  type QueryKey,
  useQueryClient,
} from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { notify } from "@/components/elements/sonner";
import { queryKeys } from "@/data/query-keys";
import type { MessagesPageDto } from "@/types/api";
import {
  addToInboxCounts,
  buildLiveMessageToast,
  type InboxListFilters,
  insertLiveMessage,
  type LiveMessageEvent,
  toLiveMessageDto,
} from "./use-live-messages.utils";

export interface UseLiveMessagesOptions {
  /** Recipient's "Hide message text in notifications" (default on). */
  hideMessageText?: boolean;
}

const RECONNECT_MS = 5000;
/** Batch the reconciling refetch after a burst of live messages. */
const REFETCH_DELAY_MS = 1500;

const LIST_KEY = [...queryKeys.messages.all, "list"];

interface CountsData {
  counts: Parameters<typeof addToInboxCounts>[0];
}

/**
 * Listens to `/api/messages/stream` (SSE). A new message is inserted into the
 * matching cached inbox lists and counts at once, then one debounced refetch
 * reconciles (Sender Hash, reply). The toast shows only what the recipient's
 * settings allow. Returns whether the stream is connected, so callers can
 * poll while it is down.
 */
export const useLiveMessages = ({
  hideMessageText = true,
}: UseLiveMessagesOptions = {}) => {
  const { data: session, status } = useSession();
  const queryClient = useQueryClient();
  const [isConnected, setIsConnected] = useState(false);
  // Read inside the listener so a settings change doesn't reconnect the stream.
  const hideTextRef = useRef(hideMessageText);
  useEffect(() => {
    hideTextRef.current = hideMessageText;
  }, [hideMessageText]);

  useEffect(() => {
    if (status !== "authenticated" || !session?.user) {
      return;
    }

    let eventSource: EventSource | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let refetchTimer: ReturnType<typeof setTimeout> | null = null;

    const scheduleRefetch = () => {
      if (refetchTimer) {
        clearTimeout(refetchTimer);
      }
      refetchTimer = setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: queryKeys.messages.all });
      }, REFETCH_DELAY_MS);
    };

    const handleNewMessage = (event: MessageEvent<string>) => {
      try {
        const payload = JSON.parse(event.data) as LiveMessageEvent;
        const notice = buildLiveMessageToast(payload, hideTextRef.current);
        if (notice) {
          notify.info(notice.title, { description: notice.description });
        }
        const message = toLiveMessageDto(payload);
        if (message) {
          for (const [key] of queryClient.getQueriesData({
            queryKey: LIST_KEY,
          })) {
            const filters = ((key as QueryKey)[2] ?? {}) as InboxListFilters;
            queryClient.setQueryData<InfiniteData<MessagesPageDto>>(
              key,
              (data) => insertLiveMessage(data, filters, message)
            );
          }
          queryClient.setQueryData<CountsData>(
            queryKeys.messages.counts(),
            (data) =>
              data
                ? { ...data, counts: addToInboxCounts(data.counts, message) }
                : data
          );
        }
        scheduleRefetch();
      } catch (error) {
        console.error(error);
      }
    };

    const connect = () => {
      eventSource = new EventSource("/api/messages/stream");
      eventSource.onopen = () => setIsConnected(true);
      eventSource.addEventListener("new_message", handleNewMessage);
      eventSource.onerror = () => {
        setIsConnected(false);
        eventSource?.close();
        reconnectTimer = setTimeout(connect, RECONNECT_MS);
      };
    };

    connect();

    return () => {
      setIsConnected(false);
      for (const timer of [reconnectTimer, refetchTimer]) {
        if (timer) {
          clearTimeout(timer);
        }
      }
      eventSource?.close();
    };
  }, [session?.user, status, queryClient]);

  return { isConnected };
};

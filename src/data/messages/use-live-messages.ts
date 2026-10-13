"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { queryKeys } from "@/data/query-keys";
import { buildLiveMessageToast } from "./use-live-messages.utils";

export interface UseLiveMessagesOptions {
  /** Recipient's "Hide message text in notifications" (default on). */
  hideMessageText?: boolean;
}

/**
 * Listens to `/api/messages/stream` (SSE): refreshes the inbox on every new
 * message and toasts only what the recipient's settings allow (never the
 * text of a quarantined message).
 */
export const useLiveMessages = ({
  hideMessageText = true,
}: UseLiveMessagesOptions = {}) => {
  const { data: session, status } = useSession();
  const queryClient = useQueryClient();
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
    let reconnectTimer: NodeJS.Timeout | null = null;

    const connect = () => {
      eventSource = new EventSource("/api/messages/stream");

      eventSource.addEventListener("new_message", (event) => {
        try {
          const notice = buildLiveMessageToast(
            JSON.parse(event.data),
            hideTextRef.current
          );
          if (notice) {
            toast.info(notice.title, { description: notice.description });
          }

          // Invalidate message list to refresh inbox
          queryClient.invalidateQueries({ queryKey: queryKeys.messages.all });
        } catch (e) {
          console.error(e);
        }
      });

      eventSource.onerror = () => {
        eventSource?.close();
        // Auto-reconnect in 5 seconds
        reconnectTimer = setTimeout(connect, 5000);
      };
    };

    connect();

    return () => {
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
      }
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [session?.user, status, queryClient]);
};

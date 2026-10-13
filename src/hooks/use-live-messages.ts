"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { toast } from "sonner";
import { queryKeys } from "@/queries/query-keys";

export const useLiveMessages = () => {
  const { data: session, status } = useSession();
  const queryClient = useQueryClient();

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
          const data = JSON.parse(event.data);
          toast.info("New anonymous message received! 👻", {
            description:
              data.content?.length > 40
                ? `${data.content.slice(0, 40)}...`
                : data.content,
          });

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

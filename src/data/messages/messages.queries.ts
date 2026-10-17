import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query";
import { api, clientFetch } from "@/data/api-client";
import { queryKeys } from "@/data/query-keys";
import type { InboxQueryStatus } from "@/lib/messages/inbox-filter";
import type { MessagesPageDto } from "@/types/api";

/** Messages per inbox page (the server caps it at 100). */
export const INBOX_PAGE_SIZE = 30;

export interface InboxQueryFilters {
  /** Trimmed search text; empty = no search. */
  q: string;
  status: InboxQueryStatus;
}

export const messagesQueries = {
  all: () => queryOptions({ queryKey: queryKeys.messages.all }),
  /** Count per filter + total: badges, unread count, "Delete all N". */
  counts: () =>
    queryOptions({
      queryFn: ({ signal }) =>
        clientFetch(api.GET("/api/messages/counts", { signal })),
      queryKey: queryKeys.messages.counts(),
      refetchOnWindowFocus: true,
      staleTime: 10 * 1000,
    }),
  /**
   * The inbox for one filter + search, filtered and paged on the server
   * (newest first). Pages are joined with `data.pages.flatMap(p => p.messages)`.
   */
  inbox: ({ status, q }: InboxQueryFilters) =>
    infiniteQueryOptions({
      getNextPageParam: (lastPage: MessagesPageDto) =>
        lastPage.nextCursor ?? undefined,
      initialPageParam: undefined as string | undefined,
      queryFn: ({ pageParam, signal }) =>
        clientFetch(
          api.GET("/api/get-messages", {
            params: {
              query: {
                cursor: pageParam,
                limit: String(INBOX_PAGE_SIZE),
                q: q || undefined,
                status,
              },
            },
            signal,
          })
        ),
      queryKey: queryKeys.messages.list({ q, status }),
      // The inbox changes while the tab is hidden; re-sync when it returns.
      refetchOnWindowFocus: true,
      staleTime: 10 * 1000,
    }),
  publicAnswers: (username: string) =>
    queryOptions({
      enabled: Boolean(username),
      queryFn: ({ signal }) =>
        clientFetch(
          api.GET("/api/public/{username}/answers", {
            params: {
              path: { username },
            },
            signal,
          })
        ),
      queryKey: queryKeys.public.answers(username),
      staleTime: 60 * 1000,
    }),
};

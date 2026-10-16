import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query";
import { api, clientFetch } from "@/data/api-client";
import { queryKeys } from "@/data/query-keys";
import type { InboxQueryStatus } from "@/lib/messages/inbox-filter";

/** Messages per inbox page (the server caps it at 100). */
export const INBOX_PAGE_SIZE = 30;

export interface InboxQueryFilters {
  /** Trimmed search text; empty = no search. */
  q: string;
  status: InboxQueryStatus;
}

export const messagesQueries = {
  all: () => queryOptions({ queryKey: queryKeys.messages.all }),
  /**
   * The inbox for one filter + search, filtered and paged on the server
   * (newest first). Pages are joined with `data.pages.flatMap(p => p.messages)`.
   */
  inbox: ({ status, q }: InboxQueryFilters) =>
    infiniteQueryOptions({
      queryKey: queryKeys.messages.list({ status, q }),
      queryFn: ({ pageParam, signal }) =>
        clientFetch(
          api.GET("/api/get-messages", {
            params: {
              query: {
                status,
                q: q || undefined,
                limit: String(INBOX_PAGE_SIZE),
                cursor: pageParam,
              },
            },
            signal,
          })
        ),
      initialPageParam: undefined as string | undefined,
      getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
      staleTime: 10 * 1000,
      // The inbox changes while the tab is hidden; re-sync when it returns.
      refetchOnWindowFocus: true,
    }),
  /** Count per filter + total: badges, unread count, "Delete all N". */
  counts: () =>
    queryOptions({
      queryKey: queryKeys.messages.counts(),
      queryFn: ({ signal }) =>
        clientFetch(api.GET("/api/messages/counts", { signal })),
      staleTime: 10 * 1000,
      refetchOnWindowFocus: true,
    }),
  publicAnswers: (username: string) =>
    queryOptions({
      queryKey: queryKeys.public.answers(username),
      queryFn: ({ signal }) =>
        clientFetch(
          api.GET("/api/public/{username}/answers", {
            params: {
              path: { username },
            },
            signal,
          })
        ),
      staleTime: 60 * 1000,
      enabled: Boolean(username),
    }),
};

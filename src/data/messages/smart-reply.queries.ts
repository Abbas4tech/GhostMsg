import { queryOptions } from "@tanstack/react-query";
import { api, clientFetch } from "@/data/api-client";
import { queryKeys } from "@/data/query-keys";

/** Drafts are generated once per message and kept while the tab lives. */
const DRAFTS_GC_TIME_MS = 30 * 60 * 1000;

export const smartReplyQueries = {
  /**
   * Three Smart Reply drafts (thoughtful, witty, wholesome) from one AI call.
   * Never refetched on focus or retried: each call costs an AI request, and
   * reopening the same message reuses the drafts.
   */
  drafts: (messageId: string, content: string) =>
    queryOptions({
      enabled: Boolean(messageId && content),
      gcTime: DRAFTS_GC_TIME_MS,
      queryFn: ({ signal }) =>
        clientFetch(
          api.POST("/api/ai/smart-reply", { body: { content }, signal })
        ),
      queryKey: queryKeys.smartReplies.drafts(messageId),
      refetchOnWindowFocus: false,
      retry: false,
      select: (data) => data.drafts,
      staleTime: Number.POSITIVE_INFINITY,
    }),
};

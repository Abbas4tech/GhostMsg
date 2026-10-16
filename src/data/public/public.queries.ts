import { queryOptions } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, clientFetch } from "@/data/api-client";
import { queryKeys } from "@/data/query-keys";

const SUGGESTIONS_STALE_MS = 5 * 60 * 1000;

export const publicQueries = {
  /**
   * AI Suggested Messages for visitors (a GET, so a cached query: "New ideas"
   * is `refetch`). Non-critical: no retries, and a failure is toasted once.
   */
  suggestions: () =>
    queryOptions({
      queryFn: async ({ signal }) => {
        try {
          return await clientFetch(
            api.GET("/api/suggest-messages", { signal })
          );
        } catch (error) {
          if (!signal.aborted) {
            toast.error(
              error instanceof Error && error.message
                ? error.message
                : "Failed to suggest messages"
            );
          }
          throw error;
        }
      },
      queryKey: queryKeys.public.suggestions(),
      refetchOnWindowFocus: false,
      retry: false,
      staleTime: SUGGESTIONS_STALE_MS,
    }),
};

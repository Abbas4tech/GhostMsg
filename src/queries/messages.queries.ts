import { queryOptions } from "@tanstack/react-query";
import { api, clientFetch } from "@/lib/api-client";
import { queryKeys } from "./query-keys";

export const messagesQueries = {
  all: () => queryOptions({ queryKey: queryKeys.messages.all }),
  list: (params?: {
    status?: "all" | "unread" | "starred" | "quarantined" | "answered";
    q?: string;
    limit?: string;
    cursor?: string;
  }) =>
    queryOptions({
      queryKey: queryKeys.messages.list(params),
      queryFn: ({ signal }) =>
        clientFetch(
          api.GET("/api/get-messages", {
            params: {
              query: params,
            },
            signal,
          })
        ),
      staleTime: 10 * 1000,
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

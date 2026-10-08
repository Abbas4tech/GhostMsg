import { queryOptions } from "@tanstack/react-query";
import { api, clientFetch } from "@/lib/api-client";
import { queryKeys } from "./query-keys";

export const messagesQueries = {
  all: () => queryOptions({ queryKey: queryKeys.messages.all }),
  list: () =>
    queryOptions({
      queryKey: queryKeys.messages.list(),
      queryFn: ({ signal }) =>
        clientFetch(api.GET("/api/get-messages", { signal })),
      staleTime: 30 * 1000,
    }),
};

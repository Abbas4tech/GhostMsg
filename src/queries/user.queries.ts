import { queryOptions } from "@tanstack/react-query";
import { api, clientFetch } from "@/lib/api-client";
import { queryKeys } from "./query-keys";

export const userQueries = {
  all: () => queryOptions({ queryKey: queryKeys.user.all }),
  acceptance: () =>
    queryOptions({
      queryKey: queryKeys.user.acceptance(),
      queryFn: ({ signal }) =>
        clientFetch(api.GET("/api/accept-message", { signal })),
      staleTime: 60 * 1000,
    }),
};

import { queryOptions } from "@tanstack/react-query";
import { api, clientFetch } from "@/data/api-client";
import { queryKeys } from "@/data/query-keys";

export const authQueries = {
  all: () => queryOptions({ queryKey: queryKeys.auth.all }),
  checkUsername: (username: string) =>
    queryOptions({
      enabled: Boolean(username && username.trim().length >= 2),
      gcTime: 5 * 60 * 1000,
      queryFn: ({ signal }) =>
        clientFetch(
          api.GET("/api/check-username-unique", {
            params: { query: { username } },
            signal,
          })
        ),
      queryKey: queryKeys.auth.checkUsername(username),
      staleTime: 60 * 1000,
    }),
};

import { queryOptions } from "@tanstack/react-query";
import { api, clientFetch } from "@/lib/api-client";
import { queryKeys } from "./query-keys";

export const authQueries = {
  all: () => queryOptions({ queryKey: queryKeys.auth.all }),
  checkUsername: (username: string) =>
    queryOptions({
      queryKey: queryKeys.auth.checkUsername(username),
      queryFn: ({ signal }) =>
        clientFetch(
          api.GET("/api/check-username-unique", {
            params: { query: { username } },
            signal,
          })
        ),
      enabled: Boolean(username && username.trim().length >= 2),
      staleTime: 60 * 1000,
      gcTime: 5 * 60 * 1000,
    }),
};

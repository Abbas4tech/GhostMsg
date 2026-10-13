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
  notifications: () =>
    queryOptions({
      queryKey: queryKeys.user.notifications(),
      queryFn: ({ signal }) =>
        clientFetch(api.GET("/api/user/notifications", { signal })),
      staleTime: 60 * 1000,
    }),
  blockedSenders: () =>
    queryOptions({
      queryKey: queryKeys.user.blockedSenders(),
      queryFn: ({ signal }) =>
        clientFetch(api.GET("/api/block-sender", { signal })),
      staleTime: 60 * 1000,
    }),
};

import { queryOptions } from "@tanstack/react-query";
import { api, clientFetch } from "@/data/api-client";
import { queryKeys } from "@/data/query-keys";

export const userQueries = {
  acceptance: () =>
    queryOptions({
      queryFn: ({ signal }) =>
        clientFetch(api.GET("/api/accept-message", { signal })),
      queryKey: queryKeys.user.acceptance(),
      staleTime: 60 * 1000,
    }),
  all: () => queryOptions({ queryKey: queryKeys.user.all }),
  blockedSenders: () =>
    queryOptions({
      queryFn: ({ signal }) =>
        clientFetch(api.GET("/api/block-sender", { signal })),
      queryKey: queryKeys.user.blockedSenders(),
      staleTime: 60 * 1000,
    }),
  notifications: () =>
    queryOptions({
      queryFn: ({ signal }) =>
        clientFetch(api.GET("/api/user/notifications", { signal })),
      queryKey: queryKeys.user.notifications(),
      staleTime: 60 * 1000,
    }),
  preferences: () =>
    queryOptions({
      queryFn: ({ signal }) =>
        clientFetch(api.GET("/api/user/preferences", { signal })),
      queryKey: queryKeys.user.preferences(),
      staleTime: 60 * 1000,
    }),
  profile: () =>
    queryOptions({
      queryFn: ({ signal }) =>
        clientFetch(api.GET("/api/user/profile", { signal })),
      queryKey: queryKeys.user.profile(),
      staleTime: 60 * 1000,
    }),
};

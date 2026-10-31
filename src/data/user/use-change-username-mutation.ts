import { useMutation, useQueryClient } from "@tanstack/react-query";
import { notify } from "@/components/elements/sonner";
import { api, clientFetch } from "@/data/api-client";
import { queryKeys } from "@/data/query-keys";

/**
 * Changes the username (and the Public Profile Link). The controller
 * refreshes the NextAuth session with the returned username.
 */
export function useChangeUsernameMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (username: string) =>
      clientFetch(api.PATCH("/api/user/username", { body: { username } })),
    onError: (error: Error) => {
      notify.error(error.message || "Couldn't change your username");
    },
    onSuccess: (data) => {
      notify.success(`Your link is now /u/${data.username}`);
      queryClient.invalidateQueries({ queryKey: queryKeys.user.profile() });
      queryClient.invalidateQueries({ queryKey: queryKeys.public.all });
    },
  });
}

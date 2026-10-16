import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
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
    onSuccess: (data) => {
      toast.success(`Your link is now /u/${data.username}`);
      queryClient.invalidateQueries({ queryKey: queryKeys.user.profile() });
      queryClient.invalidateQueries({ queryKey: queryKeys.public.all });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Couldn't change your username");
    },
  });
}

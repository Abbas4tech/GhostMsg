import { useMutation } from "@tanstack/react-query";
import { notify } from "@/components/elements/sonner";
import { api, clientFetch } from "@/data/api-client";

/** Deletes the account; the controller signs out on success. */
export function useDeleteAccountMutation() {
  return useMutation({
    mutationFn: (confirmUsername: string) =>
      clientFetch(api.DELETE("/api/user", { body: { confirmUsername } })),
    onError: (error: Error) => {
      notify.error(error.message || "Couldn't delete your account");
    },
    onSuccess(data) {
      notify.success(data.message);
    },
    onSuccess(data) {
      toast.success(data.message);
    },
  });
}

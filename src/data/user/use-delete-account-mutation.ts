import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, clientFetch } from "@/data/api-client";

/** Deletes the account; the controller signs out on success. */
export function useDeleteAccountMutation() {
  return useMutation({
    mutationFn: (confirmUsername: string) =>
      clientFetch(api.DELETE("/api/user", { body: { confirmUsername } })),
    onError: (error: Error) => {
      toast.error(error.message || "Couldn't delete your account");
    },
  });
}

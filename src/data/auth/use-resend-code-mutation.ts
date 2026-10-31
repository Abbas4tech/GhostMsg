import { useMutation } from "@tanstack/react-query";
import { api, clientFetch } from "@/data/api-client";

export interface ResendCodePayload {
  username: string;
}

/** Emails a new Verification Code (429 with `retryAfterSeconds` while cooling down). */
export function useResendCodeMutation() {
  return useMutation({
    mutationFn: (payload: ResendCodePayload) =>
      clientFetch(
        api.POST("/api/verify-code/resend", {
          body: payload,
        })
      ),
  });
}

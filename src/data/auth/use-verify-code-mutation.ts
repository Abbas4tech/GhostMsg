import { useMutation } from "@tanstack/react-query";
import { api, clientFetch } from "@/data/api-client";

export interface VerifyCodePayload {
  code: string;
  username: string;
}

export function useVerifyCodeMutation() {
  return useMutation({
    mutationFn: (payload: VerifyCodePayload) =>
      clientFetch(
        api.POST("/api/verify-code", {
          body: payload,
        })
      ),
  });
}

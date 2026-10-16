import { useMutation } from "@tanstack/react-query";
import { api, clientFetch } from "@/data/api-client";

export interface SignUpPayload {
  email: string;
  password: string;
  username: string;
}

export function useSignUpMutation() {
  return useMutation({
    mutationFn: (payload: SignUpPayload) =>
      clientFetch(
        api.POST("/api/sign-up", {
          body: payload,
        })
      ),
  });
}

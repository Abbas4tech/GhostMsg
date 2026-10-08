import { useMutation } from "@tanstack/react-query";
import { api, clientFetch } from "@/lib/api-client";

export interface SendMessagePayload {
  content: string;
  username: string;
}

export function useSendMessageMutation() {
  return useMutation({
    mutationFn: (payload: SendMessagePayload) =>
      clientFetch(
        api.POST("/api/send-message", {
          body: payload,
        })
      ),
  });
}

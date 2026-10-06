import { useMutation } from "@tanstack/react-query";
import { api, clientFetch } from "@/lib/api-client";

export function useSuggestMessagesMutation() {
  return useMutation({
    mutationFn: () => clientFetch(api.GET("/api/suggest-messages")),
  });
}

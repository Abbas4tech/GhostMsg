import { useMutation } from "@tanstack/react-query";
import { api, clientFetch } from "@/data/api-client";

export function useSuggestMessagesMutation() {
  return useMutation({
    mutationFn: () => clientFetch(api.GET("/api/suggest-messages")),
  });
}

import { useMutation } from "@tanstack/react-query";
import { notify } from "@/components/elements/sonner";
import { api, clientFetch } from "@/data/api-client";

/** "Suggest with AI" for the AMA Prompt (riffs on the current prompt). */
export function useAmaSuggestionsMutation() {
  return useMutation({
    mutationFn: (currentPrompt?: string) =>
      clientFetch(
        api.POST("/api/ai/ama-suggestions", {
          body: currentPrompt ? { currentPrompt } : {},
        })
      ),
    onError: (error: Error) => {
      notify.error(error.message || "Couldn't get ideas right now");
    },
  });
}

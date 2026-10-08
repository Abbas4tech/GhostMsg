import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, clientFetch } from "@/lib/api-client";

interface SmartReplyParams {
  content: string;
  tone: "witty" | "wholesome" | "thoughtful";
}

export const useSmartReplyMutation = () => {
  return useMutation({
    mutationFn: ({ content, tone }: SmartReplyParams) =>
      clientFetch(
        api.POST("/api/ai/smart-reply", {
          body: { content, tone },
        })
      ),
    onError: (err: Error) => {
      toast.error(err.message || "Failed to generate smart reply");
    },
  });
};

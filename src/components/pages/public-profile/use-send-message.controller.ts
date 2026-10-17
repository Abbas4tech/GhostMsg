"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { SendMessageValues } from "@/components/patterns/send-message-form";
import { publicQueries } from "@/data/public/public.queries";
import { useSendMessageMutation } from "@/data/public/use-send-message-mutation";
import { messageSchema } from "@/schemas/message-schema";
import { parseSuggestions } from "./send-message.utils";

const NO_SUGGESTIONS: string[] = [];

export interface UseSendMessageControllerOptions {
  /** Load AI suggestions (once, then cached; default: true). */
  autoFetchSuggestions?: boolean;
  username: string;
}

/**
 * Unified public-profile interaction controller (ADR 0014 §3): owns the
 * message form, submission and AI suggestions. Picking a suggestion writes
 * straight into form state — no string prop-drilling through the page.
 */
export function useSendMessageController({
  username,
  autoFetchSuggestions = true,
}: UseSendMessageControllerOptions) {
  const form = useForm<SendMessageValues>({
    defaultValues: { content: "" },
    mode: "onChange",
    resolver: zodResolver(messageSchema),
  });

  const { mutateAsync: sendAsync, isPending: isSubmitting } =
    useSendMessageMutation();
  // Suggested Messages are a cached query: loaded once when allowed,
  // "New ideas" refetches. Failures are toasted by the query.
  const suggestionsQuery = useQuery({
    ...publicQueries.suggestions(),
    enabled: autoFetchSuggestions,
  });
  const suggestionsText = suggestionsQuery.data?.success
    ? suggestionsQuery.data.messages
    : "";
  const suggestions = useMemo(
    () =>
      suggestionsText ? parseSuggestions(suggestionsText) : NO_SUGGESTIONS,
    [suggestionsText]
  );
  const { refetch: refetchSuggestions } = suggestionsQuery;
  const fetchSuggestions = useCallback(async () => {
    await refetchSuggestions();
  }, [refetchSuggestions]);
  // After a successful send the form gives way to a reassurance card.
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = useCallback(
    async ({ content }: SendMessageValues) => {
      try {
        const response = await sendAsync({ content, username });
        if (response?.success) {
          toast.success(response.message);
          form.reset({ content: "" });
          setIsSent(true);
        }
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to send message";
        toast.error(message || "Failed to send message");
      }
    },
    [form, sendAsync, username]
  );

  const selectSuggestion = useCallback(
    (suggestion: string) => {
      form.setValue("content", suggestion, { shouldValidate: true });
    },
    [form]
  );

  const handleSendAnother = useCallback(() => {
    setIsSent(false);
  }, []);

  return {
    fetchSuggestions,
    form,
    handleSendAnother,
    handleSubmit,
    isFetchingSuggestions: suggestionsQuery.isFetching,
    isSent,
    isSubmitting,
    selectSuggestion,
    suggestions,
  };
}

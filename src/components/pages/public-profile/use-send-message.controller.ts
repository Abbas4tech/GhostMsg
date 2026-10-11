"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { SendMessageValues } from "@/components/patterns/send-message-form";
import { useSendMessageMutation } from "@/hooks/mutations/use-send-message-mutation";
import { useSuggestMessagesMutation } from "@/hooks/mutations/use-suggest-messages-mutation";
import { messageSchema } from "@/schemas/message-schema";

const SUGGESTION_SEPARATOR = "||";

export interface UseSendMessageControllerOptions {
  /** Fetch AI suggestions once on mount (default: true). */
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
    resolver: zodResolver(messageSchema),
    defaultValues: { content: "" },
    mode: "onChange",
  });

  const sendMutation = useSendMessageMutation();
  const suggestMutation = useSuggestMessagesMutation();
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const hasAutoFetchedRef = useRef(false);

  const handleSubmit = useCallback(
    async ({ content }: SendMessageValues) => {
      try {
        const response = await sendMutation.mutateAsync({ username, content });
        if (response?.success) {
          toast.success(response.message);
          form.reset({ content: "" });
        }
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to send message";
        toast.error(message || "Failed to send message");
      }
    },
    [form, sendMutation, username]
  );

  const { mutateAsync: suggestAsync } = suggestMutation;
  const fetchSuggestions = useCallback(async () => {
    try {
      const response = await suggestAsync();
      if (response?.success) {
        setSuggestions(
          (response.messages || "")
            .split(SUGGESTION_SEPARATOR)
            .map((m) => m.trim())
            .filter(Boolean)
        );
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to suggest messages";
      toast.error(message || "Failed to suggest messages");
    }
  }, [suggestAsync]);

  useEffect(() => {
    if (autoFetchSuggestions && !hasAutoFetchedRef.current) {
      hasAutoFetchedRef.current = true;
      fetchSuggestions();
    }
  }, [autoFetchSuggestions, fetchSuggestions]);

  const selectSuggestion = useCallback(
    (suggestion: string) => {
      form.setValue("content", suggestion, { shouldValidate: true });
    },
    [form]
  );

  return {
    form,
    handleSubmit,
    isSubmitting: sendMutation.isPending,
    suggestions,
    fetchSuggestions,
    isFetchingSuggestions: suggestMutation.isPending,
    selectSuggestion,
  };
}

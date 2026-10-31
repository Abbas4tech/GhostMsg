"use client";

import { useQuery } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { smartReplyQueries } from "@/data/messages/smart-reply.queries";
import { useReplyMessageMutation } from "@/data/messages/use-reply-message-mutation";
import type { MessageDto } from "@/types/api";

export interface UseSmartReplyControllerOptions {
  isOpen: boolean;
  message: MessageDto | null;
  onSaved: () => void;
  /** Settings → "Publish answers to my Public Q&A by default". */
  publishByDefault?: boolean;
}

/**
 * Headless state + mutations for the hoisted SmartReplyModal. Keeps the modal
 * pattern pure while the Inbox block owns the side effects. The three Smart
 * Reply drafts load when the modal opens (one AI call per message).
 */
export function useSmartReplyController({
  isOpen,
  message,
  onSaved,
  publishByDefault = true,
}: UseSmartReplyControllerOptions) {
  const [replyText, setReplyText] = useState("");
  const [isPublished, setIsPublished] = useState(publishByDefault);

  const replyMutation = useReplyMessageMutation();
  const messageId = message ? String(message._id) : "";
  const draftsQuery = useQuery({
    ...smartReplyQueries.drafts(messageId, message?.content ?? ""),
    enabled: isOpen && Boolean(message),
  });

  // Seed the draft once per opening (adjusting state during render, no
  // effect): later refetches of the same message or a late preference never
  // overwrite what the recipient is typing.
  const openFor = isOpen && message ? messageId : null;
  const [seededFor, setSeededFor] = useState<string | null>(null);
  if (openFor !== seededFor) {
    setSeededFor(openFor);
    if (openFor && message) {
      setReplyText(message.reply?.text || "");
      setIsPublished(Boolean(message.reply?.isPublished ?? publishByDefault));
    }
  }

  /** A Smart Reply idea replaces the draft (the recipient can edit it after). */
  const handlePickDraft = useCallback((text: string) => {
    setReplyText(text);
  }, []);

  const { refetch } = draftsQuery;
  const handleRetryDrafts = useCallback(() => {
    refetch();
  }, [refetch]);

  const { mutateAsync: saveReplyAsync } = replyMutation;
  /** Resolves true once the answer is saved (false when skipped or failed). */
  const handleSave = useCallback(async (): Promise<boolean> => {
    if (!(message && replyText.trim())) {
      return false;
    }
    try {
      await saveReplyAsync({
        isPublished,
        messageId,
        text: replyText.trim(),
      });
      onSaved();
      return true;
    } catch {
      // Handled by mutation toast
      return false;
    }
  }, [message, messageId, replyText, isPublished, saveReplyAsync, onSaved]);

  return {
    drafts: draftsQuery.data ?? [],
    handlePickDraft,
    handleRetryDrafts,
    handleSave,
    hasDraftsError: draftsQuery.isError,
    isGenerating: draftsQuery.isFetching,
    isPublished,
    isSaving: replyMutation.isPending,
    replyText,
    setIsPublished,
    setReplyText,
  };
}

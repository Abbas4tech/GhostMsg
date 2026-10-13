"use client";

import { useCallback, useEffect, useState } from "react";
import type { SmartReplyTone } from "@/components/patterns/modals";
import { useReplyMessageMutation } from "@/data/messages/use-reply-message-mutation";
import { useSmartReplyMutation } from "@/data/messages/use-smart-reply-mutation";
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
 * pattern pure while the Inbox block owns the side effects.
 */
export function useSmartReplyController({
  isOpen,
  message,
  onSaved,
  publishByDefault = true,
}: UseSmartReplyControllerOptions) {
  const [replyText, setReplyText] = useState("");
  const [isPublished, setIsPublished] = useState(true);

  const replyMutation = useReplyMessageMutation();
  const smartReplyMutation = useSmartReplyMutation();

  // Re-seed the draft every time the modal opens for a message.
  useEffect(() => {
    if (isOpen && message) {
      setReplyText(message.reply?.text || "");
      setIsPublished(Boolean(message.reply?.isPublished ?? publishByDefault));
    }
  }, [isOpen, message, publishByDefault]);

  const handleGenerate = useCallback(
    async (tone: SmartReplyTone) => {
      if (!message) {
        return;
      }
      try {
        const res = await smartReplyMutation.mutateAsync({
          content: message.content,
          tone,
        });
        if (res?.reply) {
          setReplyText(res.reply);
        }
      } catch {
        // Handled by mutation toast
      }
    },
    [message, smartReplyMutation]
  );

  /** Resolves true once the answer is saved (false when skipped or failed). */
  const handleSave = useCallback(async (): Promise<boolean> => {
    if (!(message && replyText.trim())) {
      return false;
    }
    try {
      await replyMutation.mutateAsync({
        messageId: String(message._id),
        text: replyText.trim(),
        isPublished,
      });
      onSaved();
      return true;
    } catch {
      // Handled by mutation toast
      return false;
    }
  }, [message, replyText, isPublished, replyMutation, onSaved]);

  return {
    replyText,
    setReplyText,
    isPublished,
    setIsPublished,
    handleGenerate,
    handleSave,
    isGenerating: smartReplyMutation.isPending,
    isSaving: replyMutation.isPending,
  };
}

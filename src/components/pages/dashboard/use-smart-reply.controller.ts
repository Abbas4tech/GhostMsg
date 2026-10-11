"use client";

import { useCallback, useEffect, useState } from "react";
import type { SmartReplyTone } from "@/components/patterns/modals";
import { useReplyMessageMutation } from "@/hooks/mutations/use-reply-message-mutation";
import { useSmartReplyMutation } from "@/hooks/mutations/use-smart-reply-mutation";
import type { Message } from "@/model/user.model";

export interface UseSmartReplyControllerOptions {
  isOpen: boolean;
  message: Message | null;
  onSaved: () => void;
}

/**
 * Headless state + mutations for the hoisted SmartReplyModal. Keeps the modal
 * pattern pure while the Inbox block owns the side effects.
 */
export function useSmartReplyController({
  isOpen,
  message,
  onSaved,
}: UseSmartReplyControllerOptions) {
  const [replyText, setReplyText] = useState("");
  const [isPublished, setIsPublished] = useState(true);

  const replyMutation = useReplyMessageMutation();
  const smartReplyMutation = useSmartReplyMutation();

  // Re-seed the draft every time the modal opens for a message.
  useEffect(() => {
    if (isOpen && message) {
      setReplyText(message.reply?.text || "");
      setIsPublished(Boolean(message.reply?.isPublished ?? true));
    }
  }, [isOpen, message]);

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

  const handleSave = useCallback(async () => {
    if (!(message && replyText.trim())) {
      return;
    }
    try {
      await replyMutation.mutateAsync({
        messageId: String(message._id),
        text: replyText.trim(),
        isPublished,
      });
      onSaved();
    } catch {
      // Handled by mutation toast
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

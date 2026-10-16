"use client";

import { useCallback, useState } from "react";
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
  const [isPublished, setIsPublished] = useState(publishByDefault);

  const replyMutation = useReplyMessageMutation();
  const smartReplyMutation = useSmartReplyMutation();

  // Seed the draft once per opening (adjusting state during render, no
  // effect): later refetches of the same message or a late preference never
  // overwrite what the recipient is typing.
  const openFor = isOpen && message ? String(message._id) : null;
  const [seededFor, setSeededFor] = useState<string | null>(null);
  if (openFor !== seededFor) {
    setSeededFor(openFor);
    if (openFor && message) {
      setReplyText(message.reply?.text || "");
      setIsPublished(Boolean(message.reply?.isPublished ?? publishByDefault));
    }
  }

  const { mutateAsync: generateAsync } = smartReplyMutation;
  const { mutateAsync: saveReplyAsync } = replyMutation;
  const handleGenerate = useCallback(
    async (tone: SmartReplyTone) => {
      if (!message) {
        return;
      }
      try {
        const res = await generateAsync({
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
    [message, generateAsync]
  );

  /** Resolves true once the answer is saved (false when skipped or failed). */
  const handleSave = useCallback(async (): Promise<boolean> => {
    if (!(message && replyText.trim())) {
      return false;
    }
    try {
      await saveReplyAsync({
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
  }, [message, replyText, isPublished, saveReplyAsync, onSaved]);

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

"use client";

import { Loader2, Share2, Sparkles } from "lucide-react";
import type React from "react";
import { useCallback, useId } from "react";
import { Button } from "@/components/elements/button";
import { Switch } from "@/components/elements/switch";
import { Textarea } from "@/components/elements/textarea";
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from "@/components/patterns/responsive-dialog";
import { SentimentBadge } from "@/components/patterns/sentiment-badge";
import type { MessageDto } from "@/types/api";

export type SmartReplyTone = "witty" | "wholesome" | "thoughtful";

export const REPLY_MAX_LENGTH = 1000;

export interface SmartReplyModalProps {
  isGenerating?: boolean;
  isOpen: boolean;
  isPublished: boolean;
  isSaving?: boolean;
  message: MessageDto | null;
  onClose: () => void;
  onGenerate: (tone: SmartReplyTone) => void;
  onPublishedChange: (isPublished: boolean) => void;
  onReplyTextChange: (text: string) => void;
  onSave: () => void;
  /** "Answer + Story Card": save, then open the Story Card export. */
  onSaveAndShare?: () => void;
  replyText: string;
}

const TONE_IDEAS: { hint: string; label: string; tone: SmartReplyTone }[] = [
  { hint: "Playful, a little cheeky", label: "🔥 Witty", tone: "witty" },
  { hint: "Warm and kind", label: "💖 Wholesome", tone: "wholesome" },
  { hint: "Honest and considered", label: "🤔 Thoughtful", tone: "thoughtful" },
];

function ToneIdeaButton({
  tone,
  label,
  hint,
  isGenerating,
  onGenerate,
}: {
  hint: string;
  isGenerating: boolean;
  label: string;
  onGenerate: (tone: SmartReplyTone) => void;
  tone: SmartReplyTone;
}): React.JSX.Element {
  const handleClick = useCallback(() => {
    onGenerate(tone);
  }, [onGenerate, tone]);

  return (
    <button
      className="flex min-h-11 items-center justify-between gap-2 rounded-2xl border border-input border-dashed bg-card px-3.5 py-2 text-left font-medium text-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-2 focus-visible:outline-ring disabled:opacity-50"
      disabled={isGenerating}
      onClick={handleClick}
      type="button"
    >
      <span>{label}</span>
      <span className="text-muted-foreground text-xs">{hint}</span>
    </button>
  );
}

/** Answer an Anonymous Message: draft, AI Smart Reply ideas, Public Q&A switch. */
export const SmartReplyModal = ({
  isOpen,
  message,
  replyText,
  isPublished,
  isGenerating = false,
  isSaving = false,
  onClose,
  onGenerate,
  onReplyTextChange,
  onPublishedChange,
  onSave,
  onSaveAndShare,
}: SmartReplyModalProps): React.JSX.Element | null => {
  const answerId = useId();
  const publishId = useId();
  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        onClose();
      }
    },
    [onClose]
  );
  const handleReplyTextChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      onReplyTextChange(event.target.value);
    },
    [onReplyTextChange]
  );

  if (!message) {
    return null;
  }

  const canSave = Boolean(replyText.trim()) && !isSaving;

  return (
    <ResponsiveDialog onOpenChange={handleOpenChange} open={isOpen}>
      <ResponsiveDialogContent className="max-h-[92vh] gap-4 overflow-y-auto shadow-lift">
        <ResponsiveDialogHeader className="text-left">
          <ResponsiveDialogTitle>Answer this message</ResponsiveDialogTitle>
          <ResponsiveDialogDescription className="sr-only">
            Write an answer, optionally publish it as a Public Q&amp;A.
          </ResponsiveDialogDescription>
        </ResponsiveDialogHeader>

        <div className="flex flex-col gap-2 rounded-xl border bg-muted p-4">
          <SentimentBadge
            className="self-start"
            sentiment={message.sentimentTag}
            size="md"
          />
          <p className="text-pretty font-message text-body">
            {message.content}
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-semibold text-sm" htmlFor={answerId}>
            Your answer
          </label>
          <Textarea
            className="min-h-28 resize-none rounded-md text-body"
            id={answerId}
            maxLength={REPLY_MAX_LENGTH}
            onChange={handleReplyTextChange}
            placeholder="Write your answer…"
            value={replyText}
          />
          <span className="self-end text-muted-foreground text-sm tabular-nums">
            {replyText.length} / {REPLY_MAX_LENGTH}
          </span>
        </div>

        <div className="flex flex-col gap-2">
          <span className="flex items-center gap-1.5 font-semibold text-sm">
            <Sparkles aria-hidden="true" className="size-4 text-primary" />
            Smart Reply ideas
            {isGenerating ? (
              <span className="ml-auto flex items-center gap-1 font-normal text-muted-foreground text-sm">
                <Loader2 aria-hidden="true" className="size-3.5 animate-spin" />
                Thinking…
              </span>
            ) : null}
          </span>
          {TONE_IDEAS.map(({ tone, label, hint }) => (
            <ToneIdeaButton
              hint={hint}
              isGenerating={isGenerating}
              key={tone}
              label={label}
              onGenerate={onGenerate}
              tone={tone}
            />
          ))}
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-col">
            <label className="cursor-pointer text-title" htmlFor={publishId}>
              Show in my Public Q&amp;A
            </label>
            <p
              className="text-muted-foreground text-sm"
              id={`${publishId}-hint`}
            >
              Off = private reply only
            </p>
          </div>
          <Switch
            aria-describedby={`${publishId}-hint`}
            checked={isPublished}
            id={publishId}
            onCheckedChange={onPublishedChange}
            size="xl"
          />
        </div>

        <ResponsiveDialogFooter className="flex-wrap gap-2 sm:gap-2">
          <Button
            className="rounded-full"
            disabled={!canSave}
            onClick={onSave}
            variant="outline"
          >
            {isSaving ? (
              <Loader2 aria-hidden="true" className="animate-spin" />
            ) : null}
            {isSaving ? "Saving..." : "Save answer"}
          </Button>
          {onSaveAndShare ? (
            <Button
              className="rounded-full"
              disabled={!canSave}
              onClick={onSaveAndShare}
              variant="brand"
            >
              <Share2 aria-hidden="true" />
              Answer + Story Card
            </Button>
          ) : null}
        </ResponsiveDialogFooter>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
};

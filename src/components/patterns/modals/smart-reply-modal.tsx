"use client";

import { Loader2, Share, Sparkles, X } from "lucide-react";
import type React from "react";
import { useCallback, useId } from "react";
import { Button } from "@/components/elements/button";
import { Skeleton } from "@/components/elements/skeleton";
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
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import type { MessageDto, SmartReplyDraftDto } from "@/types/api";

export const REPLY_MAX_LENGTH = 1000;

/** Design: "loading shows 3 Skeleton rows" (one per tone). */
const DRAFT_SKELETON_KEYS = ["thoughtful", "witty", "wholesome"] as const;

export interface SmartReplyModalProps {
  /** Three Smart Reply drafts, one per tone (loaded when the modal opens). */
  drafts: SmartReplyDraftDto[];
  /** The drafts couldn't load: shows "Try again". */
  hasDraftsError?: boolean;
  isGenerating?: boolean;
  isOpen: boolean;
  isPublished: boolean;
  isSaving?: boolean;
  message: MessageDto | null;
  onClose: () => void;
  /** A Smart Reply idea was picked: it replaces the draft. */
  onPickDraft: (text: string) => void;
  onPublishedChange: (isPublished: boolean) => void;
  onReplyTextChange: (text: string) => void;
  /** Reload the drafts after an error. */
  onRetryDrafts?: () => void;
  onSave: () => void;
  /** "Answer + Story Card": save, then open the Story Card export. */
  onSaveAndShare?: () => void;
  replyText: string;
}

function DraftIdeaButton({
  draft,
  isMobile,
  onPick,
}: {
  draft: SmartReplyDraftDto;
  isMobile: boolean;
  onPick: (text: string) => void;
}): React.JSX.Element {
  const handleClick = useCallback(() => {
    onPick(draft.text);
  }, [draft.text, onPick]);

  return (
    <button
      className={cn(
        "flex min-h-11 items-center rounded-2xl border border-input border-dashed bg-card px-4 py-2.5 text-left font-medium text-sm leading-snug transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-2 focus-visible:outline-ring",
        isMobile && "w-55 shrink-0 snap-start"
      )}
      onClick={handleClick}
      type="button"
    >
      {draft.text}
    </button>
  );
}

/** Desktop: stacked ideas. Phones: a sideways scroller (design MobDrawerReply). */
function SmartReplyIdeas({
  drafts,
  hasError,
  isGenerating,
  isMobile,
  onPick,
  onRetry,
}: {
  drafts: SmartReplyDraftDto[];
  hasError: boolean;
  isGenerating: boolean;
  isMobile: boolean;
  onPick: (text: string) => void;
  onRetry?: () => void;
}): React.JSX.Element {
  const labelId = useId();
  const listClass = isMobile
    ? "-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-2 overflow-x-auto px-4 [scrollbar-width:none]"
    : "flex flex-col gap-2";

  let body: React.ReactNode;
  if (isGenerating) {
    body = (
      <div aria-hidden="true" className={listClass}>
        {DRAFT_SKELETON_KEYS.map((key) => (
          <Skeleton
            className={cn("h-11 rounded-2xl", isMobile && "w-55 shrink-0")}
            key={key}
          />
        ))}
      </div>
    );
  } else if (hasError) {
    body = (
      <p className="flex items-center gap-1 text-muted-foreground text-sm">
        Couldn&apos;t load ideas.
        {onRetry ? (
          <Button
            className="h-auto p-0 font-semibold"
            onClick={onRetry}
            variant="link"
          >
            Try again
          </Button>
        ) : null}
      </p>
    );
  } else {
    body = (
      <div className={listClass}>
        {drafts.map((draft) => (
          <DraftIdeaButton
            draft={draft}
            isMobile={isMobile}
            key={draft.tone}
            onPick={onPick}
          />
        ))}
      </div>
    );
  }

  return (
    <section aria-labelledby={labelId} className="flex flex-col gap-2">
      <h3 className="flex items-center gap-1.5 font-bold text-sm" id={labelId}>
        <Sparkles aria-hidden="true" className="size-4 text-primary" />
        Smart Reply ideas
        {isGenerating ? (
          <span className="ml-auto flex items-center gap-1 font-normal text-muted-foreground text-sm">
            <Loader2 aria-hidden="true" className="size-3.5 animate-spin" />
            Thinking…
          </span>
        ) : null}
      </h3>
      {body}
    </section>
  );
}

/**
 * Answer an Anonymous Message: the draft, three Smart Reply ideas (one per
 * tone, loaded on open) and the Public Q&A switch. Phones: a "Reply" drawer
 * with Save and Story Card side by side (design MobDrawerReply).
 */
export const SmartReplyModal = ({
  isOpen,
  message,
  replyText,
  drafts,
  hasDraftsError = false,
  isPublished,
  isGenerating = false,
  isSaving = false,
  onClose,
  onPickDraft,
  onRetryDrafts,
  onReplyTextChange,
  onPublishedChange,
  onSave,
  onSaveAndShare,
}: SmartReplyModalProps): React.JSX.Element | null => {
  const isMobile = useIsMobile();
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
  let saveLabel = isMobile ? "Save" : "Save answer";
  if (isSaving) {
    saveLabel = "Saving...";
  }

  const header = (
    <ResponsiveDialogHeader className="text-left">
      <ResponsiveDialogTitle className={cn(isMobile && "text-h2")}>
        {isMobile ? "Reply" : "Answer this message"}
      </ResponsiveDialogTitle>
      <ResponsiveDialogDescription className="sr-only">
        Write an answer, optionally publish it as a Public Q&amp;A.
      </ResponsiveDialogDescription>
    </ResponsiveDialogHeader>
  );

  return (
    <ResponsiveDialog onOpenChange={handleOpenChange} open={isOpen}>
      <ResponsiveDialogContent className="max-h-[92vh] gap-4 overflow-y-auto shadow-lift">
        {isMobile ? (
          <div className="flex items-center justify-between gap-2">
            {header}
            <Button
              aria-label="Close"
              className="-mr-2 size-11 rounded-full"
              onClick={onClose}
              size="icon"
              variant="ghost"
            >
              <X aria-hidden="true" className="size-5" />
            </Button>
          </div>
        ) : (
          header
        )}

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

        <div className="flex flex-col gap-1.5 md:gap-2">
          <label
            className="font-semibold text-sm max-md:text-title"
            htmlFor={answerId}
          >
            Your answer
          </label>
          <Textarea
            className="min-h-25 resize-none rounded-md text-body md:min-h-28"
            id={answerId}
            maxLength={REPLY_MAX_LENGTH}
            onChange={handleReplyTextChange}
            placeholder="Write your answer…"
            value={replyText}
          />
          <span className="self-end text-muted-foreground text-xs tabular-nums md:text-sm">
            {replyText.length} / {REPLY_MAX_LENGTH}
          </span>
        </div>

        <SmartReplyIdeas
          drafts={drafts}
          hasError={hasDraftsError}
          isGenerating={isGenerating}
          isMobile={isMobile}
          onPick={onPickDraft}
          onRetry={onRetryDrafts}
        />

        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-col">
            <label className="cursor-pointer text-title" htmlFor={publishId}>
              Show in my Public Q&amp;A
            </label>
            <p
              className="text-muted-foreground text-xs md:text-sm"
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

        <ResponsiveDialogFooter
          className={cn(
            "flex-wrap gap-2 sm:gap-2",
            isMobile && onSaveAndShare && "grid grid-cols-[1fr_1.4fr]"
          )}
        >
          <Button
            className="rounded-full"
            disabled={!canSave}
            onClick={onSave}
            variant="outline"
          >
            {isSaving ? (
              <Loader2 aria-hidden="true" className="animate-spin" />
            ) : null}
            {saveLabel}
          </Button>
          {onSaveAndShare ? (
            <Button
              className="rounded-full"
              disabled={!canSave}
              onClick={onSaveAndShare}
              variant="brand"
            >
              <Share aria-hidden="true" />
              {isMobile ? "Story Card" : "Answer + Story Card"}
            </Button>
          ) : null}
        </ResponsiveDialogFooter>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
};

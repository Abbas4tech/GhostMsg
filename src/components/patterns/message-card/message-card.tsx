"use client";

import {
  Ban,
  CheckSquare,
  MessageSquare,
  ShieldOff,
  Sparkles,
  Square,
  Star,
  Trash2,
} from "lucide-react";
import type React from "react";
import { memo } from "react";
import { Button } from "@/components/elements/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  type CardProps,
  CardTitle,
} from "@/components/elements/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/elements/tooltip";
import { SentimentBadge } from "@/components/patterns/sentiment-badge";
import { cn } from "@/lib/utils";
import type { MessageDto } from "@/types/api";

const TIMESTAMP_FORMAT: Intl.DateTimeFormatOptions = {
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "numeric",
  hour12: true,
};

export interface MessageCardProps extends Omit<CardProps, "children"> {
  isSelected?: boolean;
  isSenderBlocked?: boolean;
  message: MessageDto;
  onOpenBlock?: (message: MessageDto) => void;
  onOpenDelete?: (message: MessageDto) => void;
  onOpenReply?: (message: MessageDto) => void;
  onOpenStoryCard?: (message: MessageDto) => void;
  onStarToggle?: (message: MessageDto) => void;
  onToggleSelect?: (messageId: string) => void;
}

type MessageCardFooterProps = Pick<
  MessageCardProps,
  | "isSenderBlocked"
  | "message"
  | "onOpenBlock"
  | "onOpenDelete"
  | "onOpenReply"
  | "onOpenStoryCard"
> & { hasReply: boolean };

/** Action footer bar: reply / story card on the left, block / delete on the right. */
function MessageCardFooter({
  message,
  hasReply,
  isSenderBlocked,
  onOpenReply,
  onOpenStoryCard,
  onOpenBlock,
  onOpenDelete,
}: MessageCardFooterProps): React.JSX.Element {
  return (
    <div className="flex items-center justify-between border-t bg-muted/20 px-4 py-2 text-xs">
      <div className="flex items-center gap-1.5">
        {onOpenReply && (
          <Button
            className="h-7 text-xs"
            onClick={() => onOpenReply(message)}
            size="sm"
            variant="outline"
          >
            <MessageSquare className="mr-1 h-3.5 w-3.5" />
            {hasReply ? "Edit Reply" : "Reply"}
          </Button>
        )}

        {onOpenStoryCard && (
          <Button
            className="h-7 text-xs"
            onClick={() => onOpenStoryCard(message)}
            size="sm"
            variant="ghost"
          >
            <Sparkles className="mr-1 h-3.5 w-3.5 text-purple-500" /> Story Card
          </Button>
        )}
      </div>

      <div className="flex items-center gap-1">
        {message.senderHash && onOpenBlock && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                aria-label={isSenderBlocked ? "Unblock sender" : "Block sender"}
                className={cn(
                  "h-7 w-7",
                  isSenderBlocked
                    ? "text-red-500 hover:text-red-600"
                    : "text-muted-foreground hover:text-destructive"
                )}
                onClick={() => onOpenBlock(message)}
                size="icon"
                variant="ghost"
              >
                {isSenderBlocked ? (
                  <ShieldOff className="h-3.5 w-3.5" />
                ) : (
                  <Ban className="h-3.5 w-3.5" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {isSenderBlocked ? "Unblock this sender" : "Block this sender"}
            </TooltipContent>
          </Tooltip>
        )}

        {onOpenDelete && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                aria-label="Delete message"
                className="h-7 w-7 text-muted-foreground hover:text-destructive"
                onClick={() => onOpenDelete(message)}
                size="icon"
                variant="ghost"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Delete message</TooltipContent>
          </Tooltip>
        )}
      </div>
    </div>
  );
}

/**
 * Pure presentational message card. Owns no queries, mutations or dialogs —
 * every interaction is emitted through a callback so the parent block decides
 * what happens (ADR 0014).
 */
export const MessageCard = memo(function MessageCardInner({
  message,
  isSelected = false,
  isSenderBlocked = false,
  onToggleSelect,
  onStarToggle,
  onOpenReply,
  onOpenStoryCard,
  onOpenBlock,
  onOpenDelete,
  className,
  ...props
}: MessageCardProps): React.JSX.Element {
  const messageId = String(message._id);
  const isPinned = Boolean(message.isPinned);
  const hasReply = Boolean(message.reply?.text);

  return (
    <Card
      className={cn(
        "relative w-full rounded-xl transition-all duration-200 hover:shadow-md",
        isSelected && "border-purple-500 ring-2 ring-purple-500/20",
        message.isQuarantined && "border-red-500/50 bg-red-500/5",
        className
      )}
      data-testid={`message-card-${messageId}`}
      {...props}
    >
      <CardHeader className="pb-2">
        {/* Header Row: Checkbox, Sentiment Badge, Star, and Status Badges */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            {onToggleSelect && (
              <button
                aria-label={isSelected ? "Deselect message" : "Select message"}
                aria-pressed={isSelected}
                className="text-muted-foreground hover:text-foreground"
                onClick={() => onToggleSelect(messageId)}
                type="button"
              >
                {isSelected ? (
                  <CheckSquare className="h-4 w-4 text-purple-600" />
                ) : (
                  <Square className="h-4 w-4" />
                )}
              </button>
            )}

            <SentimentBadge sentiment={message.sentimentTag} size="md" />

            {isSenderBlocked && (
              <span className="inline-flex items-center rounded-full bg-red-500/10 px-2 py-0.5 font-semibold text-red-700 text-xs dark:text-red-400">
                🚫 Blocked Sender
              </span>
            )}

            {message.isQuarantined && (
              <span className="inline-flex items-center rounded-full bg-red-500/10 px-2 py-0.5 font-semibold text-red-700 text-xs dark:text-red-400">
                🛡️ Quarantined
              </span>
            )}
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                aria-label={isPinned ? "Unstar message" : "Star message"}
                className="text-muted-foreground transition hover:text-yellow-500"
                onClick={() => onStarToggle?.(message)}
                type="button"
              >
                <Star
                  className={cn(
                    "h-4 w-4",
                    isPinned
                      ? "fill-yellow-400 text-yellow-500"
                      : "text-muted-foreground"
                  )}
                />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              {isPinned ? "Unstar message" : "Star message"}
            </TooltipContent>
          </Tooltip>
        </div>

        <CardTitle className="pt-2 font-medium text-base text-foreground leading-relaxed">
          {message.content}
        </CardTitle>

        <CardDescription className="text-xs">
          {new Date(message.createdAt).toLocaleString(
            "en-US",
            TIMESTAMP_FORMAT
          )}
        </CardDescription>
      </CardHeader>

      {/* Existing Reply Preview if Available */}
      {hasReply && (
        <CardContent className="pt-0 pb-3">
          <div className="rounded-lg border bg-muted/40 p-3 text-xs">
            <div className="flex items-center justify-between font-semibold text-purple-600 dark:text-purple-400">
              <span>💬 Your Reply:</span>
              {message.reply?.isPublished && (
                <span className="rounded bg-purple-500/10 px-1.5 py-0.5 text-[10px]">
                  Public
                </span>
              )}
            </div>
            <p className="mt-1 text-foreground">{message.reply?.text}</p>
          </div>
        </CardContent>
      )}

      <MessageCardFooter
        hasReply={hasReply}
        isSenderBlocked={isSenderBlocked}
        message={message}
        onOpenBlock={onOpenBlock}
        onOpenDelete={onOpenDelete}
        onOpenReply={onOpenReply}
        onOpenStoryCard={onOpenStoryCard}
      />
    </Card>
  );
});

export default MessageCard;

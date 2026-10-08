"use client";

import {
  Ban,
  CheckSquare,
  Loader2,
  MessageSquare,
  Sparkles,
  Square,
  Star,
  Trash2,
} from "lucide-react";
import type React from "react";
import { type MouseEvent, memo, useState } from "react";
import { useBlockSenderMutation } from "@/hooks/mutations/use-block-sender-mutation";
import { useDeleteMessageMutation } from "@/hooks/mutations/use-delete-message-mutation";
import { useUpdateMessageMutation } from "@/hooks/mutations/use-update-message-mutation";
import type { Message } from "@/model/user.model";
import { Button } from "../animate-ui/components/buttons/button";
import { LiquidButton } from "../animate-ui/components/buttons/liquid";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../animate-ui/components/radix/alert-dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

interface MessageCardProps {
  isSelected?: boolean;
  message: Message;
  onDelete?: (message: Message) => Promise<void>;
  onOpenReply?: (message: Message) => void;
  onOpenStoryCard?: (message: Message) => void;
  onToggleSelect?: (messageId: string) => void;
}

const SENTIMENT_BADGES: Record<
  string,
  { label: string; bg: string; text: string; icon: string }
> = {
  sweet: {
    label: "Sweet",
    bg: "bg-pink-500/10",
    text: "text-pink-600 dark:text-pink-400",
    icon: "💖",
  },
  curious: {
    label: "Curious",
    bg: "bg-blue-500/10",
    text: "text-blue-600 dark:text-blue-400",
    icon: "🤔",
  },
  spicy: {
    label: "Spicy",
    bg: "bg-orange-500/10",
    text: "text-orange-600 dark:text-orange-400",
    icon: "🔥",
  },
  advice: {
    label: "Advice",
    bg: "bg-emerald-500/10",
    text: "text-emerald-600 dark:text-emerald-400",
    icon: "💡",
  },
  neutral: {
    label: "Note",
    bg: "bg-muted",
    text: "text-muted-foreground",
    icon: "👻",
  },
};

const MessageCard = memo(
  ({
    message,
    onDelete,
    onOpenReply,
    onOpenStoryCard,
    isSelected = false,
    onToggleSelect,
  }: MessageCardProps): React.JSX.Element => {
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isBlockDialogOpen, setIsBlockDialogOpen] = useState(false);

    const deleteMutation = useDeleteMessageMutation();
    const updateMutation = useUpdateMessageMutation();
    const blockMutation = useBlockSenderMutation();

    const isPending = deleteMutation.isPending;

    const sentiment =
      SENTIMENT_BADGES[message.sentimentTag || "neutral"] ||
      SENTIMENT_BADGES.neutral;

    const handleDeleteConfirm = async (
      e: MouseEvent<HTMLButtonElement>
    ): Promise<void> => {
      e.preventDefault();
      e.stopPropagation();

      if (isPending) {
        return;
      }

      try {
        if (onDelete) {
          await onDelete(message);
        } else {
          await deleteMutation.mutateAsync(String(message._id));
        }
        setIsDeleteDialogOpen(false);
      } catch {
        // Handled by toast
      }
    };

    const handleToggleStar = async () => {
      try {
        await updateMutation.mutateAsync({
          messageId: String(message._id),
          isPinned: !message.isPinned,
        });
      } catch {
        // Handled by toast
      }
    };

    const handleBlockSender = async () => {
      if (!message.senderHash) {
        return;
      }
      try {
        await blockMutation.mutateAsync(message.senderHash);
        setIsBlockDialogOpen(false);
      } catch {
        // Handled by toast
      }
    };

    return (
      <Card
        className={`relative w-full rounded-xl transition-all duration-200 hover:shadow-md ${
          isSelected ? "border-purple-500 ring-2 ring-purple-500/20" : ""
        } ${message.isQuarantined ? "border-red-500/50 bg-red-500/5" : ""}`}
      >
        <CardHeader className="pb-2">
          {/* Header Row: Checkbox, Sentiment Badge, and Star */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {onToggleSelect && (
                <button
                  className="text-muted-foreground hover:text-foreground"
                  onClick={() => onToggleSelect(String(message._id))}
                  type="button"
                >
                  {isSelected ? (
                    <CheckSquare className="h-4 w-4 text-purple-600" />
                  ) : (
                    <Square className="h-4 w-4" />
                  )}
                </button>
              )}

              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-medium text-xs ${sentiment.bg} ${sentiment.text}`}
              >
                <span>{sentiment.icon}</span>
                {sentiment.label}
              </span>

              {message.isQuarantined && (
                <span className="inline-flex items-center rounded-full bg-red-500/10 px-2 py-0.5 font-semibold text-red-500 text-xs">
                  🛡️ Quarantined
                </span>
              )}
            </div>

            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className="text-muted-foreground transition hover:text-yellow-500"
                  onClick={handleToggleStar}
                  type="button"
                >
                  <Star
                    className={`h-4 w-4 ${
                      message.isPinned
                        ? "fill-yellow-400 text-yellow-500"
                        : "text-muted-foreground"
                    }`}
                  />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                {message.isPinned ? "Unstar message" : "Star message"}
              </TooltipContent>
            </Tooltip>
          </div>

          <CardTitle className="pt-2 font-medium text-base text-foreground leading-relaxed">
            {message.content}
          </CardTitle>

          <CardDescription className="text-xs">
            {new Date(message.createdAt).toLocaleString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
              hour: "numeric",
              minute: "numeric",
              hour12: true,
            })}
          </CardDescription>
        </CardHeader>

        {/* Existing Reply Preview if Available */}
        {message.reply?.text && (
          <CardContent className="pt-0 pb-3">
            <div className="rounded-lg border bg-muted/40 p-3 text-xs">
              <div className="flex items-center justify-between font-semibold text-purple-600 dark:text-purple-400">
                <span>💬 Your Reply:</span>
                {message.reply.isPublished && (
                  <span className="rounded bg-purple-500/10 px-1.5 py-0.5 text-[10px]">
                    Public
                  </span>
                )}
              </div>
              <p className="mt-1 text-foreground">{message.reply.text}</p>
            </div>
          </CardContent>
        )}

        {/* Action Footer Bar */}
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
                {message.reply?.text ? "Edit Reply" : "Reply"}
              </Button>
            )}

            {onOpenStoryCard && (
              <Button
                className="h-7 text-xs"
                onClick={() => onOpenStoryCard(message)}
                size="sm"
                variant="ghost"
              >
                <Sparkles className="mr-1 h-3.5 w-3.5 text-purple-500" /> Story
                Card
              </Button>
            )}
          </div>

          <div className="flex items-center gap-1">
            {/* Block Sender Dialog */}
            {Boolean(message.senderHash) && (
              <AlertDialog
                onOpenChange={setIsBlockDialogOpen}
                open={isBlockDialogOpen}
              >
                <Tooltip>
                  <TooltipTrigger asChild>
                    <AlertDialogTrigger asChild>
                      <Button
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        size="icon"
                        variant="ghost"
                      >
                        <Ban className="h-3.5 w-3.5" />
                      </Button>
                    </AlertDialogTrigger>
                  </TooltipTrigger>
                  <TooltipContent>Block this sender</TooltipContent>
                </Tooltip>
                <AlertDialogContent className="sm:max-w-md">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Block this sender?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Future messages from this sender will be silently dropped.
                      Their anonymity is preserved, and they will not be
                      notified.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <LiquidButton
                      disabled={blockMutation.isPending}
                      onClick={handleBlockSender}
                      variant="destructive"
                    >
                      Block Sender
                    </LiquidButton>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}

            {/* Delete Message Dialog */}
            <AlertDialog
              onOpenChange={setIsDeleteDialogOpen}
              open={isDeleteDialogOpen}
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <AlertDialogTrigger asChild>
                    <Button
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      size="icon"
                      variant="ghost"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </AlertDialogTrigger>
                </TooltipTrigger>
                <TooltipContent>Delete message</TooltipContent>
              </Tooltip>
              <AlertDialogContent className="sm:max-w-md">
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Message?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This message will be permanently deleted from your inbox.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={isPending}>
                    Cancel
                  </AlertDialogCancel>
                  <LiquidButton
                    disabled={isPending}
                    onClick={handleDeleteConfirm}
                    variant="destructive"
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                        Deleting...
                      </>
                    ) : (
                      "Delete"
                    )}
                  </LiquidButton>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </Card>
    );
  }
);

MessageCard.displayName = "MessageCard";

export default MessageCard;

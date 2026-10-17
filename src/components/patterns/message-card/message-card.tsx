"use client";

import { cva } from "class-variance-authority";
import {
  Ban,
  Check,
  Eye,
  Flag,
  Reply,
  Share2,
  ShieldOff,
  Star,
  Trash2,
} from "lucide-react";
import type React from "react";
import { memo, useCallback } from "react";
import { Button } from "@/components/elements/button";
import { Checkbox } from "@/components/elements/checkbox";
import { SentimentBadge } from "@/components/patterns/sentiment-badge";
import { formatRelativeTime } from "@/lib/format/relative-time";
import { cn } from "@/lib/utils";
import type { MessageDto } from "@/types/api";

export type MessageCardLayout = "grid" | "list";

export type MessageCardState =
  | "default"
  | "unread"
  | "selected"
  | "answered"
  | "quarantined";

const messageCardVariants = cva(
  "relative flex min-w-0 rounded-xl border bg-card text-card-foreground shadow-soft transition-[box-shadow,background-color,border-color] duration-200",
  {
    defaultVariants: { focused: false, layout: "grid", state: "default" },
    variants: {
      focused: {
        false: "",
        true: "outline-2 outline-ring outline-offset-2",
      },
      layout: {
        grid: "flex-col gap-3 p-4",
        list: "flex-row items-center gap-3 px-3 py-2.5 sm:px-4",
      },
      state: {
        answered: "bg-muted",
        default: "",
        quarantined: "border-input border-dashed bg-muted shadow-none",
        selected: "border-primary bg-primary/[0.07] ring-1 ring-primary",
        unread:
          "before:absolute before:top-[18px] before:-left-px before:h-5 before:w-1 before:rounded-r before:bg-primary",
      },
    },
  }
);

const hasAnswer = (message: MessageDto): boolean =>
  Boolean(message.reply?.text?.trim());

/** Visual state, most important first: selected > quarantined > unread > answered. */
export function getMessageCardState(
  message: MessageDto,
  isSelected: boolean
): MessageCardState {
  if (isSelected) {
    return "selected";
  }
  if (message.isQuarantined) {
    return "quarantined";
  }
  if (!message.isRead) {
    return "unread";
  }
  return hasAnswer(message) ? "answered" : "default";
}

export interface MessageCardProps
  extends Omit<React.HTMLAttributes<HTMLElement>, "children"> {
  /** Blur Spicy messages until revealed (Settings → Safety). */
  concealSpicy?: boolean;
  /** j/k keyboard cursor (adds a focus ring). */
  isFocused?: boolean;
  /** Concealed (quarantined or Spicy) body was revealed by the recipient. */
  isRevealed?: boolean;
  isSelected?: boolean;
  isSenderBlocked?: boolean;
  layout?: MessageCardLayout;
  message: MessageDto;
  /** Reference time for "2m" style ages (stories pin it). */
  now?: Date;
  onOpenBlock?: (message: MessageDto) => void;
  onOpenDelete?: (message: MessageDto) => void;
  onOpenReply?: (message: MessageDto) => void;
  onOpenStoryCard?: (message: MessageDto) => void;
  onReveal?: (message: MessageDto) => void;
  onStarToggle?: (message: MessageDto) => void;
  onToggleSelect?: (messageId: string) => void;
}

type CardCallbacks = Pick<
  MessageCardProps,
  | "onOpenBlock"
  | "onOpenDelete"
  | "onOpenReply"
  | "onOpenStoryCard"
  | "onReveal"
  | "onStarToggle"
  | "onToggleSelect"
>;

export type ConcealReason = "quarantined" | "spicy";

/** Why a card's text is hidden, if it is (quarantine always wins). */
export function getConcealReason(
  message: MessageDto,
  concealSpicy: boolean
): ConcealReason | null {
  if (message.isQuarantined) {
    return "quarantined";
  }
  return concealSpicy && message.sentimentTag === "spicy" ? "spicy" : null;
}

const CONCEAL_NOTE: Record<ConcealReason, string> = {
  quarantined: "Hidden. Flagged as hurtful.",
  spicy: "Spicy 🔥 Reveal to read.",
};

interface CardModel extends CardCallbacks {
  concealReason: ConcealReason | null;
  isAnswered: boolean;
  isHidden: boolean;
  isSelected: boolean;
  isSenderBlocked: boolean;
  message: MessageDto;
  now?: Date;
}

function SelectCheckbox({
  checked,
  onToggle,
}: {
  checked: boolean;
  onToggle: () => void;
}): React.JSX.Element {
  // 44px hit area around the 22px box.
  return (
    <span className="-m-2.5 grid size-11 shrink-0 place-items-center">
      <Checkbox
        aria-label="Select message"
        checked={checked}
        onCheckedChange={onToggle}
        size="lg"
      />
    </span>
  );
}

function IconAction({
  label,
  onClick,
  tone = "default",
  children,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  tone?: "default" | "danger" | "active";
}): React.JSX.Element {
  return (
    <Button
      aria-label={label}
      className={cn(
        "size-10 rounded-[10px] text-muted-foreground hover:text-foreground sm:size-9",
        tone === "danger" && "hover:text-destructive",
        tone === "active" && "text-destructive hover:text-destructive/80"
      )}
      onClick={onClick}
      size="icon"
      title={label}
      variant="ghost"
    >
      {children}
    </Button>
  );
}

function StarToggle({ message, onStarToggle }: CardModel) {
  const handleStarToggle = useCallback(() => {
    onStarToggle?.(message);
  }, [onStarToggle, message]);

  if (message.isQuarantined || !onStarToggle) {
    return null;
  }
  const isPinned = Boolean(message.isPinned);
  const label = isPinned ? "Unstar message" : "Star message";
  return (
    <Button
      aria-label={label}
      aria-pressed={isPinned}
      className="size-10 rounded-[10px] text-muted-foreground hover:text-star sm:size-9"
      onClick={handleStarToggle}
      size="icon"
      title={label}
      variant="ghost"
    >
      <Star
        aria-hidden="true"
        className={cn(
          isPinned &&
            "motion-safe:zoom-in-75 fill-star text-star motion-safe:animate-in"
        )}
      />
    </Button>
  );
}

function CardCheckbox({ message, isSelected, onToggleSelect }: CardModel) {
  const handleToggle = useCallback(() => {
    onToggleSelect?.(String(message._id));
  }, [onToggleSelect, message]);

  if (!onToggleSelect) {
    return null;
  }
  return <SelectCheckbox checked={isSelected} onToggle={handleToggle} />;
}

function CardBadge({ message }: { message: MessageDto }): React.JSX.Element {
  if (message.isQuarantined) {
    return (
      <span className="inline-flex h-7 shrink-0 items-center gap-1.5 rounded-full border border-sentiment-neutral/30 bg-sentiment-neutral-subtle px-2.5 font-semibold text-[13px] text-sentiment-neutral">
        <Flag aria-hidden="true" className="size-3.5" />
        Quarantined
      </span>
    );
  }
  return <SentimentBadge sentiment={message.sentimentTag} size="md" />;
}

function Age({ message, now }: CardModel): React.JSX.Element {
  const created = new Date(message.createdAt);
  return (
    <time
      className="shrink-0 text-muted-foreground text-sm tabular-nums"
      dateTime={created.toISOString()}
      title={created.toLocaleString("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      })}
    >
      {formatRelativeTime(created, now)}
    </time>
  );
}

/** Story Card, Block/Unblock and Delete icon buttons (each only when wired). */
function SecondaryActions({
  message,
  isSenderBlocked,
  onOpenStoryCard,
  onOpenBlock,
  onOpenDelete,
}: CardModel): React.JSX.Element {
  const handleOpenStoryCard = useCallback(() => {
    onOpenStoryCard?.(message);
  }, [onOpenStoryCard, message]);
  const handleOpenBlock = useCallback(() => {
    onOpenBlock?.(message);
  }, [onOpenBlock, message]);
  const handleOpenDelete = useCallback(() => {
    onOpenDelete?.(message);
  }, [onOpenDelete, message]);

  return (
    <>
      {!message.isQuarantined && onOpenStoryCard ? (
        <IconAction label="Share as Story Card" onClick={handleOpenStoryCard}>
          <Share2 aria-hidden="true" />
        </IconAction>
      ) : null}
      {message.senderHash && onOpenBlock ? (
        <IconAction
          label={isSenderBlocked ? "Unblock sender" : "Block sender"}
          onClick={handleOpenBlock}
          tone={isSenderBlocked ? "active" : "default"}
        >
          {isSenderBlocked ? (
            <ShieldOff aria-hidden="true" />
          ) : (
            <Ban aria-hidden="true" />
          )}
        </IconAction>
      ) : null}
      {onOpenDelete ? (
        <IconAction
          label="Delete message"
          onClick={handleOpenDelete}
          tone="danger"
        >
          <Trash2 aria-hidden="true" />
        </IconAction>
      ) : null}
    </>
  );
}

/** Reveal (hidden quarantined) or Reply / Edit answer. */
function PrimaryAction({
  message,
  isHidden,
  isAnswered,
  onReveal,
  onOpenReply,
  compact,
}: CardModel & { compact: boolean }) {
  const handleReveal = useCallback(() => {
    onReveal?.(message);
  }, [onReveal, message]);
  const handleOpenReply = useCallback(() => {
    onOpenReply?.(message);
  }, [onOpenReply, message]);

  if (isHidden) {
    if (!onReveal) {
      return null;
    }
    return compact ? (
      <IconAction label="Reveal" onClick={handleReveal}>
        <Eye aria-hidden="true" />
      </IconAction>
    ) : (
      <Button
        className="rounded-full"
        onClick={handleReveal}
        size="sm"
        variant="outline"
      >
        <Eye aria-hidden="true" />
        Reveal
      </Button>
    );
  }
  if (!onOpenReply) {
    return null;
  }
  const label = isAnswered ? "Edit answer" : "Reply";
  return compact ? (
    <IconAction label={label} onClick={handleOpenReply}>
      <Reply aria-hidden="true" />
    </IconAction>
  ) : (
    <Button
      className="rounded-full"
      onClick={handleOpenReply}
      size="sm"
      variant={isAnswered ? "secondary" : "default"}
    >
      {isAnswered ? null : <Reply aria-hidden="true" />}
      {label}
    </Button>
  );
}

function GridBody(model: CardModel): React.JSX.Element {
  const { message, isHidden, isAnswered, isSenderBlocked } = model;
  return (
    <>
      <div className="flex min-w-0 items-center gap-2.5">
        <CardCheckbox {...model} />
        <CardBadge message={message} />
        {isAnswered ? (
          <span className="inline-flex items-center gap-1 font-semibold text-sm text-success">
            <Check aria-hidden="true" className="size-4" />
            Answered
          </span>
        ) : null}
        {isSenderBlocked ? (
          <span className="font-semibold text-destructive text-sm">
            Blocked
          </span>
        ) : null}
        <span className="ml-auto" />
        <Age {...model} />
        <StarToggle {...model} />
      </div>

      {isHidden ? (
        <div className="relative">
          <p
            aria-hidden="true"
            className="select-none font-message text-base leading-relaxed blur-[7px]"
          >
            This message contains language we think you would rather not read.
          </p>
          <span className="absolute inset-0 grid place-items-center">
            <span className="rounded-full bg-muted px-2.5 py-0.5 font-semibold text-foreground text-sm">
              {CONCEAL_NOTE[model.concealReason ?? "quarantined"]}
            </span>
          </span>
        </div>
      ) : (
        <p className="text-pretty font-message text-base leading-relaxed">
          {message.content}
        </p>
      )}

      {isAnswered && !isHidden ? (
        <div className="rounded-xl bg-accent px-3 py-2.5 text-accent-foreground text-sm">
          <b>You:</b> {message.reply?.text}
          {message.reply?.isPublished ? (
            <span className="ml-2 inline-flex rounded-full bg-background/60 px-2 py-0.5 font-semibold text-[11px]">
              Public
            </span>
          ) : null}
        </div>
      ) : null}

      <div className="mt-auto flex items-center gap-0.5">
        <PrimaryAction {...model} compact={false} />
        <span className="flex-1" />
        <SecondaryActions {...model} />
      </div>
    </>
  );
}

function ListBody(model: CardModel): React.JSX.Element {
  const { message, isHidden } = model;
  return (
    <>
      <CardCheckbox {...model} />
      <span className="hidden sm:contents">
        <CardBadge message={message} />
      </span>
      <p className="min-w-0 flex-1 truncate font-message text-[15px]">
        {isHidden ? (
          <span className="text-muted-foreground">
            {CONCEAL_NOTE[model.concealReason ?? "quarantined"]}
          </span>
        ) : (
          message.content
        )}
      </p>
      <Age {...model} />
      <div className="flex shrink-0 items-center">
        <StarToggle {...model} />
        <PrimaryAction {...model} compact />
        <span className="hidden sm:contents">
          <SecondaryActions {...model} onOpenDelete={undefined} />
        </span>
        <SecondaryActions
          {...model}
          onOpenBlock={undefined}
          onOpenStoryCard={undefined}
        />
      </div>
    </>
  );
}

/**
 * Pure presentational message card (grid card or compact list row). Owns no
 * queries, mutations or dialogs: every interaction is a callback (ADR 0014).
 */
export const MessageCard = memo(function MessageCardInner({
  message,
  layout = "grid",
  isSelected = false,
  isFocused = false,
  isSenderBlocked = false,
  isRevealed = false,
  concealSpicy = false,
  now,
  onToggleSelect,
  onStarToggle,
  onOpenReply,
  onOpenStoryCard,
  onOpenBlock,
  onOpenDelete,
  onReveal,
  className,
  ...props
}: MessageCardProps): React.JSX.Element {
  const messageId = String(message._id);
  const state = getMessageCardState(message, isSelected);
  const concealReason = getConcealReason(message, concealSpicy);
  const model: CardModel = {
    concealReason,
    isAnswered: hasAnswer(message),
    isHidden: concealReason !== null && !isRevealed,
    isSelected,
    isSenderBlocked,
    message,
    now,
    onOpenBlock,
    onOpenDelete,
    onOpenReply,
    onOpenStoryCard,
    onReveal,
    onStarToggle,
    onToggleSelect,
  };

  return (
    <article
      className={cn(
        messageCardVariants({ focused: isFocused, layout, state }),
        className
      )}
      data-state={state}
      data-testid={`message-card-${messageId}`}
      id={`message-${messageId}`}
      {...props}
    >
      {layout === "list" ? <ListBody {...model} /> : <GridBody {...model} />}
    </article>
  );
});

export { messageCardVariants };

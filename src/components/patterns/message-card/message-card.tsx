"use client";

import { cva } from "class-variance-authority";
import {
  Archive,
  ArchiveRestore,
  Ban,
  Check,
  Eye,
  Flag,
  Mail,
  MailOpen,
  Reply,
  Share,
  ShieldOff,
  Star,
  Trash2,
} from "lucide-react";
import { useInView } from "motion/react";
import type React from "react";
import { memo, useCallback, useEffect, useRef } from "react";
import { Button } from "@/components/elements/button";
import { Checkbox } from "@/components/elements/checkbox";
import { Kbd } from "@/components/elements/kbd";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/elements/tooltip";
import {
  type MessageAction,
  MessageActionsMenu,
} from "@/components/patterns/message-actions-menu";
import { SentimentBadge } from "@/components/patterns/sentiment-badge";
import { useIsMobile } from "@/hooks/use-mobile";
import { formatRelativeTime } from "@/lib/format/relative-time";
import {
  quarantineConcealNote,
  quarantineTagLabel,
} from "@/lib/messages/quarantine-reason";
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
  "@container/card relative flex min-w-0 rounded-xl border bg-card text-card-foreground shadow-soft transition-[box-shadow,background-color,border-color] duration-200",
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
  /**
   * Called once the card has been at least 60% on screen for 600ms (design:
   * "Mark read after 600ms in view"). Never for quarantined or concealed cards.
   */
  onSeen?: (message: MessageDto) => void;
  onStarToggle?: (message: MessageDto) => void;
  /** Archive (or, in the Archived view, move back to the inbox). `e`. */
  onToggleArchive?: (message: MessageDto) => void;
  /** Phones' "More actions": Mark as unread / Mark as read. */
  onToggleRead?: (message: MessageDto) => void;
  onToggleSelect?: (messageId: string) => void;
  /**
   * Show the select checkbox. Desktop always does; phones only in selection
   * mode (design: tap "Select" in the top bar).
   */
  showSelect?: boolean;
}

type CardCallbacks = Pick<
  MessageCardProps,
  | "onOpenBlock"
  | "onOpenDelete"
  | "onOpenReply"
  | "onOpenStoryCard"
  | "onReveal"
  | "onSeen"
  | "onStarToggle"
  | "onToggleArchive"
  | "onToggleRead"
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

const SPICY_NOTE = "Spicy 🔥 Reveal to read.";

/** The blur chip: the quarantine reason, or the Spicy hint. */
const concealNote = (message: MessageDto, reason: ConcealReason | null) =>
  reason === "spicy"
    ? SPICY_NOTE
    : quarantineConcealNote(message.quarantineReason);

interface CardModel extends CardCallbacks {
  concealReason: ConcealReason | null;
  isAnswered: boolean;
  isHidden: boolean;
  /** Phones: tonal Reply, Share + "More actions" menu instead of inline icons. */
  isMobile: boolean;
  isSelected: boolean;
  isSenderBlocked: boolean;
  message: MessageDto;
  now?: Date;
  showSelect: boolean;
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

/**
 * Tooltip naming the action and, on desktop, its inbox shortcut (design: "Tooltips
 * on those buttons show the key").
 */
function ActionTooltip({
  children,
  label,
  shortcut,
}: {
  children: React.ReactElement;
  label: string;
  shortcut?: string;
}): React.JSX.Element {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent className="flex items-center gap-2">
        {label}
        {shortcut ? <Kbd>{shortcut}</Kbd> : null}
      </TooltipContent>
    </Tooltip>
  );
}

function IconAction({
  label,
  onClick,
  shortcut,
  tone = "default",
  children,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  /** Inbox keyboard shortcut shown in the tooltip. */
  shortcut?: string;
  tone?: "default" | "danger" | "active";
}): React.JSX.Element {
  return (
    <ActionTooltip label={label} shortcut={shortcut}>
      <Button
        aria-label={label}
        className={cn(
          "size-11 rounded-xl text-muted-foreground hover:text-foreground md:size-9 md:rounded-[10px]",
          tone === "danger" && "hover:text-destructive",
          tone === "active" && "text-destructive hover:text-destructive/80"
        )}
        onClick={onClick}
        size="icon"
        variant="ghost"
      >
        {children}
      </Button>
    </ActionTooltip>
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
    <ActionTooltip label={label} shortcut="s">
      <Button
        aria-label={label}
        aria-pressed={isPinned}
        className="size-11 rounded-xl text-muted-foreground hover:text-star md:size-9 md:rounded-[10px]"
        onClick={handleStarToggle}
        size="icon"
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
    </ActionTooltip>
  );
}

function CardCheckbox({
  message,
  isSelected,
  onToggleSelect,
  showSelect,
}: CardModel) {
  const handleToggle = useCallback(() => {
    onToggleSelect?.(String(message._id));
  }, [onToggleSelect, message]);

  if (!(onToggleSelect && showSelect)) {
    return null;
  }
  return <SelectCheckbox checked={isSelected} onToggle={handleToggle} />;
}

function CardBadge({ message }: { message: MessageDto }): React.JSX.Element {
  if (message.isQuarantined) {
    return (
      <span className="inline-flex h-7 shrink-0 items-center gap-1.5 rounded-full border border-sentiment-neutral/30 bg-sentiment-neutral-subtle px-2.5 font-semibold text-[13px] text-sentiment-neutral">
        <Flag aria-hidden="true" className="size-3.5" />
        {quarantineTagLabel(message.quarantineReason)}
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

/** What the phone sheet offers; a missing handler means "not for this message". */
interface PhoneMenuInput {
  isAnswered: boolean;
  isSenderBlocked: boolean;
  message: MessageDto;
  onArchive?: () => void;
  onBlock?: () => void;
  onDelete?: () => void;
  onReply?: () => void;
  onShare?: () => void;
  onStar?: () => void;
  onToggleRead?: () => void;
}

function phoneMenuPrimary(input: PhoneMenuInput): MessageAction[] {
  const { message } = input;
  const list: MessageAction[] = [];
  if (input.onReply) {
    list.push({
      icon: <Reply aria-hidden="true" />,
      key: "reply",
      label: input.isAnswered ? "Edit answer" : "Reply",
      onClick: input.onReply,
    });
  }
  if (input.onStar) {
    list.push({
      icon: <Star aria-hidden="true" />,
      key: "star",
      label: message.isPinned ? "Unstar" : "Star",
      onClick: input.onStar,
    });
  }
  if (input.onShare) {
    list.push({
      icon: <Share aria-hidden="true" />,
      key: "story-card",
      label: "Share as Story Card",
      onClick: input.onShare,
    });
  }
  if (input.onArchive) {
    list.push({
      icon: message.isArchived ? (
        <ArchiveRestore aria-hidden="true" />
      ) : (
        <Archive aria-hidden="true" />
      ),
      key: "archive",
      label: message.isArchived ? "Move to Inbox" : "Archive",
      onClick: input.onArchive,
    });
  }
  if (input.onToggleRead) {
    list.push({
      icon: message.isRead ? (
        <Mail aria-hidden="true" />
      ) : (
        <MailOpen aria-hidden="true" />
      ),
      key: "read",
      label: message.isRead ? "Mark as unread" : "Mark as read",
      onClick: input.onToggleRead,
    });
  }
  return list;
}

function phoneMenuDanger(input: PhoneMenuInput): MessageAction[] {
  const list: MessageAction[] = [];
  if (input.onBlock) {
    list.push({
      icon: input.isSenderBlocked ? (
        <ShieldOff aria-hidden="true" />
      ) : (
        <Ban aria-hidden="true" />
      ),
      key: "block",
      label: input.isSenderBlocked ? "Unblock sender…" : "Block sender…",
      onClick: input.onBlock,
    });
  }
  if (input.onDelete) {
    list.push({
      icon: <Trash2 aria-hidden="true" />,
      key: "delete",
      label: "Delete…",
      onClick: input.onDelete,
      tone: "danger",
    });
  }
  return list;
}

/**
 * Phones' "More actions" sheet (design MobDrawerActions): Reply, Star, Share
 * as Story Card, Mark as unread, a divider, then Block sender… and Delete… (both confirm).
 */
function buildPhoneMenu(input: PhoneMenuInput): MessageAction[] {
  const primary = phoneMenuPrimary(input);
  const [firstDanger, ...restDanger] = phoneMenuDanger(input);
  if (!firstDanger) {
    return primary;
  }
  return [
    ...primary,
    { ...firstDanger, startsGroup: primary.length > 0 },
    ...restDanger,
  ];
}

/** Sentiment emoji + the message's first line, atop the phone sheet. */
function PhoneMenuPreview({
  isHidden,
  message,
}: {
  isHidden: boolean;
  message: MessageDto;
}): React.JSX.Element {
  return (
    <>
      <CardBadge message={message} />
      <p className="min-w-0 flex-1 truncate text-sm">
        {isHidden ? "Hidden message" : message.content}
      </p>
    </>
  );
}

/**
 * Phones, Quarantined Message (design MobQuarantine): one text action beside
 * Reveal, Block sender when there's a Sender Hash, otherwise Delete.
 */
function QuarantinedPhoneAction({
  isSenderBlocked,
  onBlock,
  onDelete,
}: {
  isSenderBlocked: boolean;
  onBlock?: () => void;
  onDelete?: () => void;
}): React.JSX.Element | null {
  if (onBlock) {
    return (
      <Button
        className="h-11 rounded-full px-4"
        onClick={onBlock}
        variant="secondary"
      >
        {isSenderBlocked ? (
          <ShieldOff aria-hidden="true" />
        ) : (
          <Ban aria-hidden="true" />
        )}
        {isSenderBlocked ? "Unblock sender" : "Block sender"}
      </Button>
    );
  }
  if (onDelete) {
    return (
      <Button
        className="h-11 rounded-full px-4 text-destructive hover:bg-destructive/10 hover:text-destructive"
        onClick={onDelete}
        variant="ghost"
      >
        <Trash2 aria-hidden="true" />
        Delete
      </Button>
    );
  }
  return null;
}

/** Phones: Share inline, then every action in a "More actions" sheet. */
function PhoneCardActions(model: CardModel): React.JSX.Element {
  const {
    message,
    isAnswered,
    isHidden,
    isSenderBlocked,
    onOpenStoryCard,
    onOpenBlock,
    onOpenDelete,
    onOpenReply,
    onStarToggle,
    onToggleArchive,
    onToggleRead,
  } = model;
  const handleOpenStoryCard = useCallback(() => {
    onOpenStoryCard?.(message);
  }, [onOpenStoryCard, message]);
  const handleOpenBlock = useCallback(() => {
    onOpenBlock?.(message);
  }, [onOpenBlock, message]);
  const handleOpenDelete = useCallback(() => {
    onOpenDelete?.(message);
  }, [onOpenDelete, message]);
  const handleOpenReply = useCallback(() => {
    onOpenReply?.(message);
  }, [onOpenReply, message]);
  const handleStar = useCallback(() => {
    onStarToggle?.(message);
  }, [onStarToggle, message]);
  const handleToggleRead = useCallback(() => {
    onToggleRead?.(message);
  }, [onToggleRead, message]);
  const handleToggleArchive = useCallback(() => {
    onToggleArchive?.(message);
  }, [onToggleArchive, message]);

  if (message.isQuarantined) {
    return (
      <QuarantinedPhoneAction
        isSenderBlocked={isSenderBlocked}
        onBlock={
          message.senderHash && onOpenBlock ? handleOpenBlock : undefined
        }
        onDelete={onOpenDelete ? handleOpenDelete : undefined}
      />
    );
  }

  const offersOpenActions = !message.isQuarantined;
  const canShare = offersOpenActions && Boolean(onOpenStoryCard);
  const actions = buildPhoneMenu({
    isAnswered,
    isSenderBlocked,
    message,
    onArchive: onToggleArchive ? handleToggleArchive : undefined,
    onBlock: message.senderHash && onOpenBlock ? handleOpenBlock : undefined,
    onDelete: onOpenDelete ? handleOpenDelete : undefined,
    onReply: onOpenReply && !isHidden ? handleOpenReply : undefined,
    onShare: canShare ? handleOpenStoryCard : undefined,
    onStar: onStarToggle && offersOpenActions ? handleStar : undefined,
    onToggleRead: onToggleRead ? handleToggleRead : undefined,
  });

  return (
    <>
      {canShare ? (
        <IconAction label="Share as Story Card" onClick={handleOpenStoryCard}>
          <Share aria-hidden="true" />
        </IconAction>
      ) : null}
      <MessageActionsMenu
        actions={actions}
        label="More actions"
        preview={<PhoneMenuPreview isHidden={isHidden} message={message} />}
      />
    </>
  );
}

/** Desktop (design Inbox board): Share, Block/Unblock and Delete as inline icons. */
function DesktopCardActions({
  message,
  isSenderBlocked,
  onOpenStoryCard,
  onOpenBlock,
  onOpenDelete,
  onToggleArchive,
}: CardModel): React.JSX.Element {
  const handleOpenStoryCard = useCallback(() => {
    onOpenStoryCard?.(message);
  }, [onOpenStoryCard, message]);
  const handleToggleArchive = useCallback(() => {
    onToggleArchive?.(message);
  }, [onToggleArchive, message]);
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
          <Share aria-hidden="true" />
        </IconAction>
      ) : null}
      {!message.isQuarantined && onToggleArchive ? (
        <IconAction
          label={message.isArchived ? "Move to Inbox" : "Archive"}
          onClick={handleToggleArchive}
          shortcut="e"
        >
          {message.isArchived ? (
            <ArchiveRestore aria-hidden="true" />
          ) : (
            <Archive aria-hidden="true" />
          )}
        </IconAction>
      ) : null}
      {message.senderHash && onOpenBlock ? (
        <IconAction
          label={isSenderBlocked ? "Unblock sender" : "Block sender"}
          onClick={handleOpenBlock}
          shortcut="⇧B"
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
          shortcut="#"
          tone="danger"
        >
          <Trash2 aria-hidden="true" />
        </IconAction>
      ) : null}
    </>
  );
}

/** The secondary actions for the current viewport. */
function CardActionsMenu(model: CardModel): React.JSX.Element {
  return model.isMobile ? (
    <PhoneCardActions {...model} />
  ) : (
    <DesktopCardActions {...model} />
  );
}

/** Reveal (hidden quarantined) or Reply / Edit answer. */
function PrimaryAction({
  message,
  isHidden,
  isAnswered,
  isMobile,
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
        className={cn("rounded-full", isMobile && "h-11 px-5")}
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
  const replyVariant = isAnswered || isMobile ? "secondary" : "default";
  return compact ? (
    <IconAction label={label} onClick={handleOpenReply} shortcut="r">
      <Reply aria-hidden="true" />
    </IconAction>
  ) : (
    <Button
      className={cn("rounded-full", isMobile && "h-11 px-4")}
      onClick={handleOpenReply}
      size="sm"
      variant={replyVariant}
    >
      {isAnswered ? null : <Reply aria-hidden="true" />}
      {label}
    </Button>
  );
}

function GridBody(model: CardModel): React.JSX.Element {
  const { message, isHidden, isAnswered, isSenderBlocked } = model;
  // Phones in selection mode (design MobInboxSelect): just checkbox, tag,
  // age and text; no star or action row competing with the selection.
  const isPicking = model.isMobile && model.showSelect;
  return (
    <>
      <div className="flex min-w-0 items-center gap-2.5">
        <CardCheckbox {...model} />
        <CardBadge message={message} />
        {isAnswered ? (
          // A ✓ on narrow cards (a text label pushed the star off them);
          // "✓ Answered" once the card is 24rem wide (container query).
          <span
            className="inline-flex shrink-0 items-center gap-1 font-semibold text-sm text-success"
            title="Answered"
          >
            <Check aria-hidden="true" className="size-4" />
            <span className="sr-only @sm/card:not-sr-only">Answered</span>
          </span>
        ) : null}
        {isSenderBlocked ? (
          <span className="font-semibold text-destructive text-sm">
            Blocked
          </span>
        ) : null}
        <span className="ml-auto" />
        <Age {...model} />
        {isPicking ? null : <StarToggle {...model} />}
      </div>

      {isHidden ? (
        <div className="relative">
          <p
            aria-hidden="true"
            className="select-none text-pretty font-message text-body blur-[7px]"
          >
            This message contains language we think you would rather not read.
          </p>
          <span className="absolute inset-0 grid place-items-center">
            <span className="rounded-full bg-muted px-2.5 py-0.5 font-semibold text-foreground text-sm">
              {concealNote(message, model.concealReason)}
            </span>
          </span>
        </div>
      ) : (
        <p className="text-pretty font-message text-body">{message.content}</p>
      )}

      {isAnswered && !isHidden ? (
        <div className="rounded-xl bg-accent px-3 py-2.5 text-accent-foreground text-sm">
          <b>You:</b> {message.reply?.text}
          {message.reply?.isPublished ? (
            <span className="ml-2 inline-flex rounded-full bg-background/60 px-2 py-0.5 font-semibold text-xs">
              Public
            </span>
          ) : null}
        </div>
      ) : null}

      {isPicking ? null : (
        <div className="mt-auto flex items-center gap-0.5">
          <PrimaryAction {...model} compact={false} />
          <span className="flex-1" />
          <CardActionsMenu {...model} />
        </div>
      )}
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
      <p className="min-w-0 flex-1 truncate font-message text-body">
        {isHidden ? (
          <span className="text-muted-foreground">
            {concealNote(message, model.concealReason)}
          </span>
        ) : (
          message.content
        )}
      </p>
      <Age {...model} />
      <div className="flex shrink-0 items-center">
        <StarToggle {...model} />
        <PrimaryAction {...model} compact />
        <CardActionsMenu {...model} />
      </div>
    </>
  );
}

/** Design: "Mark read after 600ms in view". */
export const SEEN_AFTER_MS = 600;

function useMarkSeen(
  ref: React.RefObject<HTMLElement | null>,
  message: MessageDto,
  isHidden: boolean,
  onSeen?: (message: MessageDto) => void
): void {
  const inView = useInView(ref, { amount: 0.6 });
  const canMark = Boolean(
    onSeen && !message.isRead && !message.isQuarantined && !isHidden
  );
  useEffect(() => {
    if (!(inView && canMark && onSeen)) {
      return;
    }
    const timer = setTimeout(() => onSeen(message), SEEN_AFTER_MS);
    return () => clearTimeout(timer);
  }, [inView, canMark, onSeen, message]);
}

/**
 * Pure presentational message card (grid card or compact list row). Owns no
 * queries, mutations or dialogs: every interaction is a callback (ADR 0014).
 */
export const MessageCard = memo(function MessageCardInner({
  message,
  layout = "grid",
  showSelect = true,
  isSelected = false,
  isFocused = false,
  isSenderBlocked = false,
  isRevealed = false,
  concealSpicy = false,
  now,
  onToggleSelect,
  onStarToggle,
  onToggleArchive,
  onToggleRead,
  onOpenReply,
  onOpenStoryCard,
  onOpenBlock,
  onOpenDelete,
  onReveal,
  onSeen,
  className,
  ...props
}: MessageCardProps): React.JSX.Element {
  const messageId = String(message._id);
  const articleRef = useRef<HTMLElement>(null);
  const isMobile = useIsMobile();
  const state = getMessageCardState(message, isSelected);
  const concealReason = getConcealReason(message, concealSpicy);
  const model: CardModel = {
    concealReason,
    isAnswered: hasAnswer(message),
    isHidden: concealReason !== null && !isRevealed,
    isMobile,
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
    onToggleArchive,
    onToggleRead,
    onToggleSelect,
    showSelect,
  };
  useMarkSeen(articleRef, message, model.isHidden, onSeen);

  return (
    <article
      className={cn(
        messageCardVariants({ focused: isFocused, layout, state }),
        className
      )}
      data-state={state}
      data-testid={`message-card-${messageId}`}
      id={`message-${messageId}`}
      ref={articleRef}
      {...props}
    >
      {layout === "list" ? <ListBody {...model} /> : <GridBody {...model} />}
    </article>
  );
});

export { messageCardVariants };

import type { InfiniteData } from "@tanstack/react-query";
import {
  type InboxCounts,
  type InboxQueryStatus,
  matchesInboxStatus,
} from "@/lib/messages/inbox-filter";
import type { MessageDto, MessagesPageDto } from "@/types/api";

/** The `new_message` SSE payload (`/api/messages/stream`). */
export interface LiveMessageEvent {
  _id?: string;
  content?: string;
  createdAt?: string;
  isPinned?: boolean;
  isQuarantined?: boolean;
  isRead?: boolean;
  quarantineReason?: MessageDto["quarantineReason"];
  sentimentTag?: MessageDto["sentimentTag"];
}

export interface LiveMessageToast {
  description?: string;
  title: string;
}

const PREVIEW_LENGTH = 40;

export const LIVE_TOAST_TITLE = "New anonymous message received! 👻";
export const HIDDEN_LIVE_TOAST_TITLE = "New Anonymous Message 👻";

/**
 * What the in-app toast may say about a live message (Chapter 17, S3/S7):
 * nothing for a quarantined message, no text when the recipient hides
 * message text in notifications, otherwise a short preview.
 */
export function buildLiveMessageToast(
  message: LiveMessageEvent,
  hideMessageText: boolean
): LiveMessageToast | null {
  if (message.isQuarantined) {
    return null;
  }
  if (hideMessageText || !message.content) {
    return { title: HIDDEN_LIVE_TOAST_TITLE };
  }
  const { content } = message;
  return {
    description:
      content.length > PREVIEW_LENGTH
        ? `${content.slice(0, PREVIEW_LENGTH)}…`
        : content,
    title: LIVE_TOAST_TITLE,
  };
}

/**
 * The SSE payload as an inbox message, or `null` if it is incomplete. It has
 * no Sender Hash or reply yet; the follow-up refetch fills those in.
 */
export function toLiveMessageDto(event: LiveMessageEvent): MessageDto | null {
  if (!(event._id && event.content && event.createdAt)) {
    return null;
  }
  return {
    _id: event._id,
    content: event.content,
    createdAt: event.createdAt,
    isArchived: false,
    isPinned: Boolean(event.isPinned),
    isQuarantined: Boolean(event.isQuarantined),
    isRead: Boolean(event.isRead),
    quarantineReason: event.isQuarantined ? event.quarantineReason : undefined,
    reply: null,
    sentimentTag: event.sentimentTag ?? "neutral",
  };
}

export interface InboxListFilters {
  q?: string;
  status?: InboxQueryStatus;
}

/**
 * Puts a new message at the top of a cached inbox list when it belongs to
 * that filter. Searches are left alone (the refetch decides), and a message
 * already present is not duplicated.
 */
export function insertLiveMessage(
  data: InfiniteData<MessagesPageDto> | undefined,
  filters: InboxListFilters,
  message: MessageDto
): InfiniteData<MessagesPageDto> | undefined {
  const [first, ...rest] = data?.pages ?? [];
  const belongs =
    !filters.q && matchesInboxStatus(message, filters.status ?? "all");
  const alreadyThere = data?.pages.some((page) =>
    page.messages.some((m) => m._id === message._id)
  );
  if (!(data && first && belongs) || alreadyThere) {
    return data;
  }
  const bump = (page: MessagesPageDto) => ({
    ...page,
    total: page.total === undefined ? undefined : page.total + 1,
  });
  return {
    ...data,
    pages: [
      { ...bump(first), messages: [message, ...first.messages] },
      ...rest.map(bump),
    ],
  };
}

/** Adds one new message to the inbox counts. */
export function addToInboxCounts(
  counts: InboxCounts,
  message: MessageDto
): InboxCounts {
  const add = (status: Exclude<keyof InboxCounts, "total">) =>
    counts[status] + (matchesInboxStatus(message, status) ? 1 : 0);
  return {
    all: add("all"),
    answered: add("answered"),
    archived: add("archived"),
    quarantined: add("quarantined"),
    starred: add("starred"),
    total: counts.total + 1,
    unread: add("unread"),
  };
}

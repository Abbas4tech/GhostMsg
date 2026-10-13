import type {
  MessageFilterCounts,
  MessageFilterStatus,
} from "@/components/patterns/filter-bar";
import type { MessageDto } from "@/types/api";

/** Inbox filtering and counting rules (pure; used by `useInboxController`). */

export const hasReplyText = (message: MessageDto): boolean =>
  Boolean(message.reply?.text && message.reply.text.trim().length > 0);

export function matchesStatus(
  message: MessageDto,
  status: MessageFilterStatus
): boolean {
  switch (status) {
    case "unread":
      return !(message.isQuarantined || message.isRead);
    case "starred":
      return Boolean(message.isPinned);
    case "quarantined":
      return Boolean(message.isQuarantined);
    case "answered":
      return hasReplyText(message);
    default:
      return !message.isQuarantined;
  }
}

export function matchesSearch(message: MessageDto, query: string): boolean {
  if (!query.trim()) {
    return true;
  }
  const q = query.toLowerCase();
  const contentMatch = message.content.toLowerCase().includes(q);
  const replyMatch = Boolean(message.reply?.text?.toLowerCase().includes(q));
  return contentMatch || replyMatch;
}

export function countByStatus(messages: MessageDto[]): MessageFilterCounts {
  return {
    all: messages.filter((m) => matchesStatus(m, "all")).length,
    unread: messages.filter((m) => matchesStatus(m, "unread")).length,
    starred: messages.filter((m) => matchesStatus(m, "starred")).length,
    quarantined: messages.filter((m) => matchesStatus(m, "quarantined")).length,
    answered: messages.filter((m) => matchesStatus(m, "answered")).length,
  };
}

const FILTER_STATUSES: readonly MessageFilterStatus[] = [
  "all",
  "unread",
  "starred",
  "quarantined",
  "answered",
];

/** Narrows a `?filter=` search param to a known inbox filter. */
export const isFilterStatus = (value: unknown): value is MessageFilterStatus =>
  typeof value === "string" &&
  (FILTER_STATUSES as readonly string[]).includes(value);

export type InboxShortcut =
  | "next"
  | "prev"
  | "select"
  | "star"
  | "reply"
  | "search";

const SHORTCUT_KEYS: Record<string, InboxShortcut> = {
  j: "next",
  k: "prev",
  x: "select",
  s: "star",
  r: "reply",
  "/": "search",
};

/** Maps a bare key press to an inbox shortcut (modifiers are handled by the caller). */
export const resolveInboxShortcut = (key: string): InboxShortcut | null =>
  SHORTCUT_KEYS[key] ?? null;

/**
 * Next id for the j/k cursor. Starts at the first message, clamps at both
 * ends, and recovers when the focused message has been filtered away.
 */
export function moveFocus(
  ids: string[],
  currentId: string | null,
  delta: 1 | -1
): string | null {
  if (ids.length === 0) {
    return null;
  }
  const index = currentId ? ids.indexOf(currentId) : -1;
  if (index === -1) {
    return ids[0];
  }
  const next = Math.min(ids.length - 1, Math.max(0, index + delta));
  return ids[next];
}

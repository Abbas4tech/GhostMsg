import type { MessageDto } from "@/types/api";

/**
 * Inbox filter rules shared by the client, the MSW mocks and (as MongoDB
 * filters) the server in `src/server/messages/inbox-query.ts`. Change both
 * together: the contract test in `inbox-query.test.ts` checks they agree.
 */
export const INBOX_STATUSES = [
  "all",
  "unread",
  "starred",
  "quarantined",
  "answered",
] as const;

export type InboxStatus = (typeof INBOX_STATUSES)[number];

/** API-only status: every message regardless of state (exports). */
export type InboxQueryStatus = InboxStatus | "any";

export interface InboxCounts {
  all: number;
  answered: number;
  quarantined: number;
  starred: number;
  /** Every message, quarantined included (Delete all, empty state). */
  total: number;
  unread: number;
}

export const EMPTY_INBOX_COUNTS: InboxCounts = {
  all: 0,
  unread: 0,
  starred: 0,
  quarantined: 0,
  answered: 0,
  total: 0,
};

export const isInboxStatus = (value: unknown): value is InboxStatus =>
  typeof value === "string" &&
  (INBOX_STATUSES as readonly string[]).includes(value);

export const isInboxQueryStatus = (value: unknown): value is InboxQueryStatus =>
  value === "any" || isInboxStatus(value);

type FilterableMessage = Pick<
  MessageDto,
  "content" | "isPinned" | "isQuarantined" | "isRead" | "reply"
>;

const NON_BLANK = /\S/;

export const hasReplyText = (message: FilterableMessage): boolean =>
  Boolean(message.reply?.text && NON_BLANK.test(message.reply.text));

export function matchesInboxStatus(
  message: FilterableMessage,
  status: InboxQueryStatus
): boolean {
  switch (status) {
    case "any":
      return true;
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

/** Case-insensitive match on the message or its answer (blank = match). */
export function matchesInboxSearch(
  message: FilterableMessage,
  query: string
): boolean {
  const q = query.trim().toLowerCase();
  if (!q) {
    return true;
  }
  return (
    message.content.toLowerCase().includes(q) ||
    Boolean(message.reply?.text?.toLowerCase().includes(q))
  );
}

export function countInboxStatuses(messages: FilterableMessage[]): InboxCounts {
  const count = (status: InboxStatus) =>
    messages.filter((message) => matchesInboxStatus(message, status)).length;
  return {
    all: count("all"),
    unread: count("unread"),
    starred: count("starred"),
    quarantined: count("quarantined"),
    answered: count("answered"),
    total: messages.length,
  };
}

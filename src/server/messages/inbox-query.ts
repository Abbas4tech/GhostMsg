import "server-only";
import { Types } from "mongoose";
import type { InboxCursor } from "@/lib/messages/inbox-cursor";
import type {
  InboxCounts,
  InboxQueryStatus,
} from "@/lib/messages/inbox-filter";

/**
 * MongoDB side of the inbox contract in `src/lib/messages/inbox-filter.ts`:
 * status filters, escaped search, keyset paging and per-status counts.
 */

export const DEFAULT_INBOX_PAGE_SIZE = 30;
export const MAX_INBOX_PAGE_SIZE = 100;

const REGEX_SPECIAL_CHARS = /[.*+?^${}()|[\]\\]/g;
const NON_BLANK = /\S/;

type Filter = Record<string, unknown>;

/** Escapes user input so search is a literal, never a regular expression. */
export const escapeRegExp = (value: string): string =>
  value.replace(REGEX_SPECIAL_CHARS, "\\$&");

/** Older messages have no `isArchived`, so "not archived" is `$ne: true`. */
const NOT_ARCHIVED = { isArchived: { $ne: true } };

export function statusFilter(status: InboxQueryStatus): Filter {
  switch (status) {
    case "any":
      return {};
    case "archived":
      return { isArchived: true };
    case "unread":
      return { ...NOT_ARCHIVED, isQuarantined: false, isRead: false };
    case "starred":
      return { ...NOT_ARCHIVED, isPinned: true };
    case "quarantined":
      return { ...NOT_ARCHIVED, isQuarantined: true };
    case "answered":
      return { ...NOT_ARCHIVED, "reply.text": { $regex: NON_BLANK } };
    default:
      return { ...NOT_ARCHIVED, isQuarantined: false };
  }
}

/** Case-insensitive literal match on the message or its answer. */
export function searchFilter(query: string): Filter | null {
  const q = query.trim();
  if (!q) {
    return null;
  }
  const pattern = { $options: "i", $regex: escapeRegExp(q) };
  return { $or: [{ content: pattern }, { "reply.text": pattern }] };
}

/** Messages strictly after the cursor in newest-first order. */
export function cursorFilter(cursor: InboxCursor): Filter {
  return {
    $or: [
      { createdAt: { $lt: cursor.createdAt } },
      {
        _id: { $lt: new Types.ObjectId(cursor.id) },
        createdAt: cursor.createdAt,
      },
    ],
  };
}

export function buildInboxFilter(
  recipientId: Types.ObjectId,
  {
    status,
    q = "",
    cursor = null,
  }: { cursor?: InboxCursor | null; q?: string; status: InboxQueryStatus }
): Filter {
  const clauses = [
    searchFilter(q),
    cursor ? cursorFilter(cursor) : null,
  ].filter((clause): clause is Filter => clause !== null);
  return {
    recipientId,
    ...statusFilter(status),
    ...(clauses.length > 0 ? { $and: clauses } : {}),
  };
}

/** `?limit=` within 1..100, default 30. */
export function parsePageSize(raw: string | null): number {
  const value = Number(raw);
  if (!(Number.isInteger(value) && value > 0)) {
    return DEFAULT_INBOX_PAGE_SIZE;
  }
  return Math.min(value, MAX_INBOX_PAGE_SIZE);
}

const sumWhen = (condition: unknown) => ({
  $sum: { $cond: [condition, 1, 0] },
});

const notArchived = { $ne: ["$isArchived", true] };

/** One pass over a recipient's messages: the count for every inbox filter. */
export const inboxCountsPipeline = (recipientId: Types.ObjectId) => [
  { $match: { recipientId } },
  {
    $group: {
      _id: null,
      all: sumWhen({ $and: [notArchived, { $ne: ["$isQuarantined", true] }] }),
      answered: sumWhen({
        $and: [
          notArchived,
          {
            $regexMatch: {
              input: { $ifNull: ["$reply.text", ""] },
              regex: NON_BLANK,
            },
          },
        ],
      }),
      archived: sumWhen({ $eq: ["$isArchived", true] }),
      quarantined: sumWhen({
        $and: [notArchived, { $eq: ["$isQuarantined", true] }],
      }),
      starred: sumWhen({ $and: [notArchived, { $eq: ["$isPinned", true] }] }),
      total: { $sum: 1 },
      unread: sumWhen({
        $and: [
          notArchived,
          { $ne: ["$isQuarantined", true] },
          { $ne: ["$isRead", true] },
        ],
      }),
    },
  },
];

/** Maps the aggregation row (none for an empty inbox) to counts. */
export function toInboxCounts(
  row: Partial<InboxCounts> | undefined
): InboxCounts {
  return {
    all: row?.all ?? 0,
    answered: row?.answered ?? 0,
    archived: row?.archived ?? 0,
    quarantined: row?.quarantined ?? 0,
    starred: row?.starred ?? 0,
    total: row?.total ?? 0,
    unread: row?.unread ?? 0,
  };
}

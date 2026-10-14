/**
 * Keyset cursor for the inbox (newest first, ties broken by id):
 * `"<ISO createdAt>_<message id>"`. Opaque to the client, shared by the
 * server and the MSW mocks so paging behaves the same in tests.
 */
export interface InboxCursor {
  createdAt: Date;
  id: string;
}

const SEPARATOR = "_";
/** Ids are ObjectIds on the server (checked there); fixtures use "msg-1". */
const MESSAGE_ID = /^[\w-]+$/;

interface CursorSource {
  _id: unknown;
  createdAt: Date | string;
}

export const encodeInboxCursor = (message: CursorSource): string =>
  `${new Date(message.createdAt).toISOString()}${SEPARATOR}${String(message._id)}`;

/** Parses a cursor; `null` for missing or malformed input. */
export function decodeInboxCursor(
  cursor: string | null | undefined
): InboxCursor | null {
  if (!cursor) {
    return null;
  }
  const index = cursor.lastIndexOf(SEPARATOR);
  if (index <= 0) {
    return null;
  }
  const createdAt = new Date(cursor.slice(0, index));
  const id = cursor.slice(index + 1);
  if (Number.isNaN(createdAt.getTime()) || !MESSAGE_ID.test(id)) {
    return null;
  }
  return { createdAt, id };
}

/** Newest first, then larger id first (the inbox sort order). */
export function compareNewestFirst(a: CursorSource, b: CursorSource): number {
  const byDate =
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  if (byDate !== 0) {
    return byDate;
  }
  // Byte order, like MongoDB sorts ObjectIds (not locale order).
  const idA = String(a._id);
  const idB = String(b._id);
  if (idA === idB) {
    return 0;
  }
  return idA < idB ? 1 : -1;
}

/** True when `message` sorts after the cursor (belongs to a later page). */
export const isAfterCursor = (
  message: CursorSource,
  cursor: InboxCursor
): boolean =>
  compareNewestFirst({ _id: cursor.id, createdAt: cursor.createdAt }, message) <
  0;

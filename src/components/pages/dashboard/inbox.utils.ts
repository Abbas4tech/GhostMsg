import type { MessageFilterStatus } from "@/components/patterns/filter-bar";
import { isInboxStatus } from "@/lib/messages/inbox-filter";
import type { MessageDto } from "@/types/api";

/**
 * Inbox page helpers (pure). Filtering and counting rules live in
 * `src/lib/messages/inbox-filter.ts`, shared with the server and the mocks.
 */

/** Narrows a `?filter=` search param to a known inbox filter. */
export const isFilterStatus = (value: unknown): value is MessageFilterStatus =>
  isInboxStatus(value);

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

// ── URL state ──────────────────────────────────────────────────────────────

/**
 * `/dashboard?filter=unread&q=hi` for the current inbox view. The default
 * filter and an empty search are left out so the plain URL stays clean.
 */
export function buildInboxHref(
  pathname: string,
  status: MessageFilterStatus,
  query: string
): string {
  const params = new URLSearchParams();
  if (status !== "all") {
    params.set("filter", status);
  }
  const q = query.trim();
  if (q) {
    params.set("q", q);
  }
  const search = params.toString();
  return search ? `${pathname}?${search}` : pathname;
}

// ── Selection ──────────────────────────────────────────────────────────────

/** Selected ids together with the filter + search ("scope") they belong to. */
export interface ScopedSelection {
  ids: readonly string[];
  scope: string;
}

/** Adds or removes `id`; a selection from another scope starts over. */
export function toggleScopedSelection(
  selection: ScopedSelection,
  scope: string,
  id: string
): ScopedSelection {
  const ids = selection.scope === scope ? selection.ids : [];
  return {
    scope,
    ids: ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id],
  };
}

/** The ids that count as selected: same scope and currently loaded. */
export function visibleSelection(
  selection: ScopedSelection,
  scope: string,
  loadedIds: ReadonlySet<string>
): string[] {
  return selection.scope === scope
    ? selection.ids.filter((id) => loadedIds.has(id))
    : [];
}

// ── Dialogs ────────────────────────────────────────────────────────────────

export type InboxModalKind = "block" | "delete" | "reply" | "reveal" | "story";

/**
 * The open dialog, by message id. `snapshot` is the message as it was when the
 * dialog opened: used only if the message is no longer loaded (e.g. deleted
 * while the dialog animates out). Closing keeps the id so content stays put.
 */
export interface InboxModalState {
  kind: InboxModalKind | null;
  messageId: string | null;
  snapshot: MessageDto | null;
}

export const CLOSED_INBOX_MODAL: InboxModalState = {
  kind: null,
  messageId: null,
  snapshot: null,
};

/** The dialog's message: the live cached copy, else the snapshot. */
export function resolveModalMessage(
  modal: InboxModalState,
  messages: readonly MessageDto[]
): MessageDto | null {
  if (!modal.messageId) {
    return null;
  }
  return (
    messages.find((message) => String(message._id) === modal.messageId) ??
    modal.snapshot
  );
}

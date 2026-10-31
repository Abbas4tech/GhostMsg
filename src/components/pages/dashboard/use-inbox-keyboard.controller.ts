"use client";

import { useEffect } from "react";
import { shouldIgnoreShortcut } from "@/lib/browser/shortcuts";
import type { MessageDto } from "@/types/api";
import {
  type InboxShortcut,
  moveFocus,
  resolveInboxShortcut,
} from "./inbox.utils";

export interface UseInboxKeyboardControllerOptions {
  focusedId: string | null;
  messages: MessageDto[];
  /** `e`: archive (or, in Archived, move back to the inbox). */
  onArchive: (message: MessageDto) => void;
  /** ⇧B: opens the Block Sender dialog. */
  onBlock: (message: MessageDto) => void;
  /** esc: clears the selection. */
  onClearSelection: () => void;
  /** #: opens the delete confirm (no undo). */
  onDelete: (message: MessageDto) => void;
  onOpenReply: (message: MessageDto) => void;
  onStarToggle: (message: MessageDto) => void;
  onToggleSelect: (messageId: string) => void;
  searchInputId: string;
  selectedIds: string[];
  setFocusedId: (id: string | null) => void;
}

type ShortcutContext = Pick<
  UseInboxKeyboardControllerOptions,
  | "onArchive"
  | "onBlock"
  | "onClearSelection"
  | "onDelete"
  | "onOpenReply"
  | "onStarToggle"
  | "onToggleSelect"
  | "searchInputId"
  | "selectedIds"
> & {
  focused: MessageDto | undefined;
  /** Moves the cursor and returns the newly focused id. */
  move: (delta: 1 | -1) => string | null;
};

/** ⇧J / ⇧K: select where you are, then move and select the next one too. */
function extendSelection(delta: 1 | -1, ctx: ShortcutContext): void {
  const select = (id: string | null) => {
    if (id && !ctx.selectedIds.includes(id)) {
      ctx.onToggleSelect(id);
    }
  };
  select(ctx.focused ? String(ctx.focused._id) : null);
  select(ctx.move(delta));
}

/** Shortcuts that act on the focused message (not on quarantined ones, except delete/block). */
function runMessageShortcut(
  shortcut: InboxShortcut,
  focused: MessageDto,
  ctx: ShortcutContext
): void {
  const canAct = !focused.isQuarantined;
  switch (shortcut) {
    case "star":
      if (canAct) {
        ctx.onStarToggle(focused);
      }
      break;
    case "reply":
      if (canAct) {
        ctx.onOpenReply(focused);
      }
      break;
    case "archive":
      if (canAct) {
        ctx.onArchive(focused);
      }
      break;
    case "delete":
      ctx.onDelete(focused);
      break;
    case "block":
      if (focused.senderHash) {
        ctx.onBlock(focused);
      }
      break;
    case "select":
      ctx.onToggleSelect(String(focused._id));
      break;
    default:
      break;
  }
}

/** Runs one resolved shortcut (cursor, search, selection, or the focused message). */
function runShortcut(shortcut: InboxShortcut, ctx: ShortcutContext): void {
  switch (shortcut) {
    case "next":
      ctx.move(1);
      return;
    case "prev":
      ctx.move(-1);
      return;
    case "extend-next":
      extendSelection(1, ctx);
      return;
    case "extend-prev":
      extendSelection(-1, ctx);
      return;
    case "search":
      document.getElementById(ctx.searchInputId)?.focus();
      return;
    case "clear-selection":
      ctx.onClearSelection();
      return;
    default:
      if (ctx.focused) {
        runMessageShortcut(shortcut, ctx.focused, ctx);
      }
  }
}

/**
 * Inbox triage from the keyboard (design UX board): j/k or ↑/↓ move, x
 * selects (⇧J/⇧K extend), s stars, r replies, e archives, # deletes (via
 * the confirm), ⇧B blocks (via its dialog), "/" focuses search, esc clears
 * the selection. Page-wide keys (g-chords, ⇧C, ?) live in the dashboard shell.
 */
export function useInboxKeyboardController({
  messages,
  focusedId,
  setFocusedId,
  selectedIds,
  onToggleSelect,
  onClearSelection,
  onStarToggle,
  onOpenReply,
  onArchive,
  onDelete,
  onBlock,
  searchInputId,
}: UseInboxKeyboardControllerOptions): void {
  useEffect(() => {
    const ids = messages.map((message) => String(message._id));
    const context: ShortcutContext = {
      focused: messages.find((m) => String(m._id) === focusedId),
      move: (delta) => {
        const id = moveFocus(ids, focusedId, delta);
        setFocusedId(id);
        if (id) {
          document
            .getElementById(`message-${id}`)
            ?.scrollIntoView({ block: "nearest" });
        }
        return id;
      },
      onArchive,
      onBlock,
      onClearSelection,
      onDelete,
      onOpenReply,
      onStarToggle,
      onToggleSelect,
      searchInputId,
      selectedIds,
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (shouldIgnoreShortcut(event)) {
        return;
      }
      const shortcut = resolveInboxShortcut(event.key);
      if (shortcut) {
        event.preventDefault();
        runShortcut(shortcut, context);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    messages,
    focusedId,
    setFocusedId,
    selectedIds,
    onToggleSelect,
    onClearSelection,
    onStarToggle,
    onOpenReply,
    onArchive,
    onDelete,
    onBlock,
    searchInputId,
  ]);
}

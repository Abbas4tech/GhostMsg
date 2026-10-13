"use client";

import { useEffect } from "react";
import type { MessageDto } from "@/types/api";
import {
  type InboxShortcut,
  moveFocus,
  resolveInboxShortcut,
} from "./inbox.utils";

export interface UseInboxKeyboardControllerOptions {
  focusedId: string | null;
  messages: MessageDto[];
  onOpenReply: (message: MessageDto) => void;
  onStarToggle: (message: MessageDto) => void;
  onToggleSelect: (messageId: string) => void;
  searchInputId: string;
  setFocusedId: (id: string | null) => void;
}

const TYPING_TAGS = new Set(["INPUT", "TEXTAREA", "SELECT"]);

/** Typing in a field or working in a dialog must never trigger shortcuts. */
const shouldIgnore = (event: KeyboardEvent): boolean => {
  if (
    event.defaultPrevented ||
    event.metaKey ||
    event.ctrlKey ||
    event.altKey
  ) {
    return true;
  }
  const target = event.target as HTMLElement | null;
  if (target && (TYPING_TAGS.has(target.tagName) || target.isContentEditable)) {
    return true;
  }
  return Boolean(
    document.querySelector('[role="dialog"], [role="alertdialog"]')
  );
};

type ShortcutContext = Pick<
  UseInboxKeyboardControllerOptions,
  "onOpenReply" | "onStarToggle" | "onToggleSelect" | "searchInputId"
> & {
  focused: MessageDto | undefined;
  move: (delta: 1 | -1) => void;
};

/** Runs one resolved shortcut against the focused message. */
function runShortcut(shortcut: InboxShortcut, ctx: ShortcutContext): void {
  const { focused } = ctx;
  const canAct = Boolean(focused && !focused.isQuarantined);
  switch (shortcut) {
    case "next":
      ctx.move(1);
      break;
    case "prev":
      ctx.move(-1);
      break;
    case "search":
      document.getElementById(ctx.searchInputId)?.focus();
      break;
    case "select":
      if (focused) {
        ctx.onToggleSelect(String(focused._id));
      }
      break;
    case "star":
      if (focused && canAct) {
        ctx.onStarToggle(focused);
      }
      break;
    case "reply":
      if (focused && canAct) {
        ctx.onOpenReply(focused);
      }
      break;
    default:
      break;
  }
}

/**
 * Inbox triage from the keyboard: j/k move the cursor, x selects, s stars,
 * r replies, "/" focuses search.
 */
export function useInboxKeyboardController({
  messages,
  focusedId,
  setFocusedId,
  onToggleSelect,
  onStarToggle,
  onOpenReply,
  searchInputId,
}: UseInboxKeyboardControllerOptions): void {
  useEffect(() => {
    const ids = messages.map((message) => String(message._id));
    const context: ShortcutContext = {
      focused: messages.find((m) => String(m._id) === focusedId),
      onOpenReply,
      onStarToggle,
      onToggleSelect,
      searchInputId,
      move: (delta) => {
        const id = moveFocus(ids, focusedId, delta);
        setFocusedId(id);
        if (id) {
          document
            .getElementById(`message-${id}`)
            ?.scrollIntoView({ block: "nearest" });
        }
      },
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (shouldIgnore(event)) {
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
    onToggleSelect,
    onStarToggle,
    onOpenReply,
    searchInputId,
  ]);
}

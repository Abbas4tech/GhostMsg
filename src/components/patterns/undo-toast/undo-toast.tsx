"use client";

import { Undo2 } from "lucide-react";
import type React from "react";
import { useCallback } from "react";
import { toast } from "sonner";
import { toastActionClassName } from "@/components/elements/sonner";

export interface UndoToastActionProps {
  /** How long Undo stays available; the bar drains over this time. */
  durationMs: number;
  onUndo: () => void;
  /** The Sonner toast this renders in; Undo dismisses it. */
  toastId: number | string;
}

/**
 * The "Undo" button and 3px time-left bar of an Undo toast. Sonner renders it
 * as the toast's action, so it sits in the Toaster's toast surface; the bar
 * pins to the toast's bottom edge and pauses while the toaster is hovered,
 * like Sonner's own timer.
 */
export function UndoToastAction({
  durationMs,
  onUndo,
  toastId,
}: UndoToastActionProps): React.JSX.Element {
  const handleUndo = useCallback(() => {
    onUndo();
    toast.dismiss(toastId);
  }, [onUndo, toastId]);

  return (
    <>
      <button
        className={toastActionClassName}
        onClick={handleUndo}
        type="button"
      >
        <Undo2 aria-hidden="true" />
        Undo
      </button>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]"
      >
        <span
          className="absolute bottom-0 left-0 h-[3px] animate-countdown rounded-r-[3px] bg-primary in-data-[expanded=true]:[animation-play-state:paused]"
          style={{ animationDuration: `${durationMs}ms` }}
        />
      </span>
    </>
  );
}

/** Wraps both outcomes so whichever fires first wins and the other is a no-op. */
function settleOnce(onCommit: () => void, onUndo: () => void) {
  let settled = false;
  const once = (callback: () => void) => () => {
    if (!settled) {
      settled = true;
      callback();
    }
  };
  return { commit: once(onCommit), undo: once(onUndo) };
}

let undoToastCount = 0;

export interface ShowUndoToastOptions {
  durationMs: number;
  icon?: React.ReactNode;
  /** One line, verb first. Never the message text (privacy on shared screens). */
  message: string;
  /** Runs when the toast closes without Undo: time ran out, or it was swiped or dismissed. */
  onCommit: () => void;
  onUndo: () => void;
}

/**
 * Shows an Undo toast and returns its id. Exactly one of `onUndo` / `onCommit`
 * runs, once, so callers can hold a reversible action until the toast closes.
 */
export function showUndoToast({
  durationMs,
  icon,
  message,
  onCommit,
  onUndo,
}: ShowUndoToastOptions): number | string {
  const { commit, undo } = settleOnce(onCommit, onUndo);
  undoToastCount += 1;
  const id = `undo-toast-${undoToastCount}`;

  return toast(message, {
    action: (
      <UndoToastAction durationMs={durationMs} onUndo={undo} toastId={id} />
    ),
    duration: durationMs,
    icon,
    id,
    onAutoClose: commit,
    onDismiss: commit,
  });
}

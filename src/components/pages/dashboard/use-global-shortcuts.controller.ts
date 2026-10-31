"use client";

import { useEffect } from "react";
import { shouldIgnoreShortcut } from "@/lib/browser/shortcuts";

/** How long after `g` the second key of a chord still counts. */
export const CHORD_WINDOW_MS = 1200;

/** g i / g p / g s (design UX board). */
export const CHORD_ROUTES: Record<string, string> = {
  i: "/dashboard",
  p: "/dashboard/profile",
  s: "/dashboard/settings",
};

export interface UseGlobalShortcutsControllerOptions {
  /** ⇧C */
  onCopyLink: () => void;
  /** g-chords */
  onNavigate: (href: string) => void;
  /** ? */
  onOpenShortcuts: () => void;
}

/**
 * Dashboard-wide keys: `g i` / `g p` / `g s` jump to Inbox / Profile /
 * Settings, ⇧C copies the Public Profile Link, `?` opens the shortcut sheet.
 * Listens in the capture phase and stops a consumed chord key, so `g s`
 * never also stars the focused message in the inbox.
 */
export function useGlobalShortcutsController({
  onCopyLink,
  onNavigate,
  onOpenShortcuts,
}: UseGlobalShortcutsControllerOptions): void {
  useEffect(() => {
    let chordStartedAt = 0;

    const consume = (event: KeyboardEvent) => {
      event.preventDefault();
      event.stopImmediatePropagation();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (shouldIgnoreShortcut(event)) {
        return;
      }
      if (chordStartedAt && Date.now() - chordStartedAt < CHORD_WINDOW_MS) {
        chordStartedAt = 0;
        const href = CHORD_ROUTES[event.key];
        if (href) {
          consume(event);
          onNavigate(href);
        }
        return;
      }
      chordStartedAt = 0;
      if (event.key === "g") {
        consume(event);
        chordStartedAt = Date.now();
      } else if (event.key === "C") {
        consume(event);
        onCopyLink();
      } else if (event.key === "?") {
        consume(event);
        onOpenShortcuts();
      }
    };

    window.addEventListener("keydown", handleKeyDown, { capture: true });
    return () =>
      window.removeEventListener("keydown", handleKeyDown, { capture: true });
  }, [onCopyLink, onNavigate, onOpenShortcuts]);
}

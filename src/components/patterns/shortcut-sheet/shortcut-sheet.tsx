"use client";

import type React from "react";
import { useCallback } from "react";
import { Button } from "@/components/elements/button";
import { Kbd } from "@/components/elements/kbd";
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from "@/components/patterns/responsive-dialog";

export interface Shortcut {
  /** Each entry is one key cap; a sequence like `g i` is two entries. */
  keys: string[];
  label: string;
}

export interface ShortcutGroup {
  heading: string;
  shortcuts: Shortcut[];
}

/** The design UX board's keyboard map, grouped as the sheet shows it. */
export const SHORTCUT_GROUPS: ShortcutGroup[] = [
  {
    heading: "Inbox",
    shortcuts: [
      { keys: ["j", "k"], label: "Next / previous message (↑ ↓ also work)" },
      { keys: ["x"], label: "Select (⇧ + j / k extends)" },
      { keys: ["s"], label: "Star / unstar" },
      { keys: ["r"], label: "Reply" },
      { keys: ["e"], label: "Archive" },
      { keys: ["#"], label: "Delete" },
      { keys: ["⇧", "B"], label: "Block sender" },
      { keys: ["/"], label: "Focus search" },
      { keys: ["esc"], label: "Clear selection" },
    ],
  },
  {
    heading: "Anywhere",
    shortcuts: [
      { keys: ["⌘", "K"], label: "Command palette" },
      { keys: ["g", "i"], label: "Go to Inbox" },
      { keys: ["g", "p"], label: "Go to Profile" },
      { keys: ["g", "s"], label: "Go to Settings" },
      { keys: ["⇧", "C"], label: "Copy my Public Profile Link" },
      { keys: ["?"], label: "This list" },
    ],
  },
];

export interface ShortcutSheetProps {
  groups?: ShortcutGroup[];
  onOpenChange: (open: boolean) => void;
  open: boolean;
}

/** `?` in the dashboard: every keyboard shortcut. Shortcuts pause while it's open. */
export function ShortcutSheet({
  groups = SHORTCUT_GROUPS,
  onOpenChange,
  open,
}: ShortcutSheetProps): React.JSX.Element {
  const handleDone = useCallback(() => onOpenChange(false), [onOpenChange]);
  return (
    <ResponsiveDialog onOpenChange={onOpenChange} open={open}>
      <ResponsiveDialogContent className="gap-5 shadow-lift sm:max-w-lg">
        <ResponsiveDialogHeader className="text-left">
          <ResponsiveDialogTitle>Keyboard shortcuts</ResponsiveDialogTitle>
          <ResponsiveDialogDescription>
            Shortcuts are ignored while you type in a field or a dialog is open.
          </ResponsiveDialogDescription>
        </ResponsiveDialogHeader>
        {groups.map((group) => (
          <section className="flex flex-col gap-2" key={group.heading}>
            <h3 className="text-muted-foreground text-overline uppercase">
              {group.heading}
            </h3>
            <dl className="flex flex-col divide-y">
              {group.shortcuts.map((shortcut) => (
                <div
                  className="flex items-center justify-between gap-4 py-2"
                  key={shortcut.label}
                >
                  <dt className="text-sm">{shortcut.label}</dt>
                  <dd className="flex shrink-0 items-center gap-1">
                    {shortcut.keys.map((key) => (
                      <Kbd key={key}>{key}</Kbd>
                    ))}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
        {/* Also the keyboard route into a scrolling phone drawer (axe: scrollable-region-focusable). */}
        <ResponsiveDialogFooter>
          <Button
            className="rounded-full"
            onClick={handleDone}
            variant="outline"
          >
            Done
          </Button>
        </ResponsiveDialogFooter>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}

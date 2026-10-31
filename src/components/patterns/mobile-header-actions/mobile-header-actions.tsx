"use client";

import type React from "react";
import { createContext, useContext, useEffect } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/elements/button";
import { cn } from "@/lib/utils";

/** The phone top bar's two page-fillable areas (the shell renders both). */
export interface MobileHeaderSlots {
  /** Right side, after the brand tile. */
  actions: HTMLElement | null;
  /** Left side; when filled (e.g. a back button) the brand tile hides. */
  leading: HTMLElement | null;
  /** `MobileHeaderLeading` calls this on mount; the returned function on unmount. */
  registerLeading: () => () => void;
}

const NO_SLOTS: MobileHeaderSlots = {
  actions: null,
  leading: null,
  registerLeading: () => () => undefined,
};

const MobileHeaderSlotContext = createContext<MobileHeaderSlots>(NO_SLOTS);

/**
 * Wraps the dashboard so pages can put their own controls in the phone top
 * bar. The shell renders the slot elements and passes them here.
 */
export function MobileHeaderSlotProvider({
  children,
  slots,
}: {
  children: React.ReactNode;
  slots: MobileHeaderSlots;
}): React.JSX.Element {
  return (
    <MobileHeaderSlotContext value={slots}>{children}</MobileHeaderSlotContext>
  );
}

/**
 * Page-specific actions for the phone top bar (design: Inbox shows Search +
 * Select, Profile shows "View as visitor", Settings shows none). Rendered
 * into the shell's slot, so they sit right of the brand tile; nothing shows
 * on desktop because the top bar is `md:hidden`.
 */
export function MobileHeaderActions({
  children,
}: {
  children: React.ReactNode;
}): React.ReactPortal | null {
  const { actions } = useContext(MobileHeaderSlotContext);
  return actions ? createPortal(children, actions) : null;
}

/** Replaces the brand tile, e.g. the Quarantined view's "Back to inbox". */
export function MobileHeaderLeading({
  children,
}: {
  children: React.ReactNode;
}): React.ReactPortal | null {
  const { leading, registerLeading } = useContext(MobileHeaderSlotContext);
  useEffect(() => registerLeading(), [registerLeading]);
  return leading ? createPortal(children, leading) : null;
}

/** A 44px icon button for the phone top bar (design `.act`). */
export function MobileHeaderAction({
  children,
  className,
  label,
  onClick,
  pressed,
}: {
  children: React.ReactNode;
  className?: string;
  label: string;
  onClick: () => void;
  /** Toggle buttons (e.g. search open) report their state. */
  pressed?: boolean;
}): React.JSX.Element {
  return (
    <Button
      aria-label={label}
      aria-pressed={pressed}
      className={cn(
        "size-11 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground active:scale-95 aria-pressed:bg-muted aria-pressed:text-foreground [&_svg:not([class*='size-'])]:size-5",
        className
      )}
      onClick={onClick}
      size="icon"
      title={label}
      variant="ghost"
    >
      {children}
    </Button>
  );
}

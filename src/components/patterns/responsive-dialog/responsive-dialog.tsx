"use client";

import type React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/elements/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/elements/drawer";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

export interface ResponsiveDialogProps {
  children: React.ReactNode;
  onOpenChange: (open: boolean) => void;
  open: boolean;
}

/**
 * Dialog on >=768px, bottom Drawer below it (ADR: handoff rule 7). Swaps the
 * whole Radix primitive, not just the chrome, so each stays fully accessible
 * (Dialog focus trap vs Drawer's swipe-to-dismiss sheet).
 */
function ResponsiveDialog({
  open,
  onOpenChange,
  children,
}: ResponsiveDialogProps): React.JSX.Element {
  const isMobile = useIsMobile();
  const Root = isMobile ? Drawer : Dialog;

  return (
    <Root onOpenChange={onOpenChange} open={open}>
      {children}
    </Root>
  );
}

export interface ResponsiveDialogContentProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Desktop: `className` lands on `DialogContent` (padded grid). Phones: the
 * Drawer keeps its own chrome (handle, 28px top radius, up to 92dvh) and
 * `className` goes on a padded, scrolling body, so tall content (Smart
 * Reply, Story Card) scrolls instead of being cut off.
 */
function ResponsiveDialogContent({
  children,
  className,
}: ResponsiveDialogContentProps): React.JSX.Element {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <DrawerContent className="max-h-[92dvh] rounded-t-drawer data-[vaul-drawer-direction=bottom]:max-h-[92dvh] data-[vaul-drawer-direction=bottom]:rounded-t-drawer">
        <div
          className={cn(
            "flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 pt-3 pb-[calc(16px+env(safe-area-inset-bottom))]",
            className
          )}
        >
          {children}
        </div>
      </DrawerContent>
    );
  }

  return <DialogContent className={className}>{children}</DialogContent>;
}

export interface ResponsiveDialogHeaderProps {
  children: React.ReactNode;
  className?: string;
}

function ResponsiveDialogHeader({
  children,
  className,
}: ResponsiveDialogHeaderProps): React.JSX.Element {
  const isMobile = useIsMobile();

  if (isMobile) {
    // Left-aligned like the design's drawers (stock Drawer centres its header).
    return (
      <DrawerHeader
        className={cn(
          "gap-1.5 p-0 text-left group-data-[vaul-drawer-direction=bottom]/drawer-content:text-left",
          className
        )}
      >
        {children}
      </DrawerHeader>
    );
  }

  return <DialogHeader className={className}>{children}</DialogHeader>;
}

export interface ResponsiveDialogTitleProps {
  children: React.ReactNode;
  className?: string;
}

function ResponsiveDialogTitle({
  children,
  className,
}: ResponsiveDialogTitleProps): React.JSX.Element {
  const isMobile = useIsMobile();
  const Title = isMobile ? DrawerTitle : DialogTitle;

  return (
    <Title className={cn("font-display text-h3", className)}>{children}</Title>
  );
}

export interface ResponsiveDialogDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

function ResponsiveDialogDescription({
  children,
  className,
}: ResponsiveDialogDescriptionProps): React.JSX.Element {
  const isMobile = useIsMobile();
  const Description = isMobile ? DrawerDescription : DialogDescription;

  return <Description className={className}>{children}</Description>;
}

export interface ResponsiveDialogFooterProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Phones: full-width buttons, primary action first (design drawers), so put
 * the primary action last in JSX as on desktop and the column reverses it.
 */
function ResponsiveDialogFooter({
  children,
  className,
}: ResponsiveDialogFooterProps): React.JSX.Element {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <DrawerFooter
        className={cn(
          "mt-2 flex-col-reverse p-0 *:h-13 *:w-full *:text-body",
          className
        )}
      >
        {children}
      </DrawerFooter>
    );
  }

  return <DialogFooter className={className}>{children}</DialogFooter>;
}

export {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
};

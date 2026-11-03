"use client";

import { AlertDialog as AlertDialogPrimitive } from "radix-ui";
import type * as React from "react";
import { createContext, useContext } from "react";
import {
  DialogPop,
  OverlayFade,
  OverlayPresence,
} from "@/components/animate/overlay";
import { buttonVariants } from "@/components/elements/button";
import { useControlledState } from "@/hooks/use-controlled-state";
import { cn } from "@/lib/utils";

/** Open state shared with AlertDialogContent so motion can play the exit (ADR 0036). */
const AlertDialogOpenContext = createContext(false);

function AlertDialog({
  defaultOpen,
  onOpenChange,
  open,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Root>) {
  const [isOpen, setIsOpen] = useControlledState({
    defaultValue: defaultOpen ?? false,
    onChange: onOpenChange,
    value: open,
  });
  return (
    <AlertDialogOpenContext.Provider value={isOpen}>
      <AlertDialogPrimitive.Root
        onOpenChange={setIsOpen}
        open={isOpen}
        {...props}
      />
    </AlertDialogOpenContext.Provider>
  );
}

const AlertDialogTrigger = AlertDialogPrimitive.Trigger;

const AlertDialogPortal = AlertDialogPrimitive.Portal;

function AlertDialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Overlay>) {
  return (
    <AlertDialogPrimitive.Overlay asChild forceMount {...props}>
      <OverlayFade
        className={cn("fixed inset-0 z-50 bg-black/80", className)}
      />
    </AlertDialogPrimitive.Overlay>
  );
}

function AlertDialogContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Content>) {
  const isOpen = useContext(AlertDialogOpenContext);
  return (
    <AlertDialogPortal forceMount>
      <OverlayPresence open={isOpen}>
        <AlertDialogOverlay />
        <AlertDialogPrimitive.Content asChild forceMount {...props}>
          <DialogPop
            className={cn(
              "fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 gap-4 rounded-lg border bg-background p-6 shadow-lg sm:max-w-lg",
              className
            )}
          >
            {children}
          </DialogPop>
        </AlertDialogPrimitive.Content>
      </OverlayPresence>
    </AlertDialogPortal>
  );
}

function AlertDialogHeader({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex flex-col gap-2 text-center sm:text-left", className)}
      {...props}
    />
  );
}

function AlertDialogFooter({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className
      )}
      {...props}
    />
  );
}

function AlertDialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Title>) {
  return (
    <AlertDialogPrimitive.Title
      className={cn("font-semibold text-lg", className)}
      {...props}
    />
  );
}

function AlertDialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Description>) {
  return (
    <AlertDialogPrimitive.Description
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

function AlertDialogAction({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Action>) {
  return (
    <AlertDialogPrimitive.Action
      className={cn(buttonVariants(), className)}
      {...props}
    />
  );
}

function AlertDialogCancel({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Cancel>) {
  return (
    <AlertDialogPrimitive.Cancel
      className={cn(buttonVariants({ variant: "outline" }), className)}
      {...props}
    />
  );
}

export {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogTitle,
  AlertDialogTrigger,
};

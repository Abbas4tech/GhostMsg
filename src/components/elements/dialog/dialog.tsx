"use client";

import { X } from "lucide-react";
import { Dialog as DialogPrimitive } from "radix-ui";
import type * as React from "react";
import { createContext, useContext } from "react";
import {
  DialogPop,
  OverlayFade,
  OverlayPresence,
} from "@/components/animate/overlay";
import { useControlledState } from "@/hooks/use-controlled-state";
import { cn } from "@/lib/utils";

/** Open state shared with DialogContent so motion can play the exit (ADR 0036). */
const DialogOpenContext = createContext(false);

function Dialog({
  defaultOpen,
  onOpenChange,
  open,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root>) {
  const [isOpen, setIsOpen] = useControlledState({
    defaultValue: defaultOpen ?? false,
    onChange: onOpenChange,
    value: open,
  });
  return (
    <DialogOpenContext.Provider value={isOpen}>
      <DialogPrimitive.Root onOpenChange={setIsOpen} open={isOpen} {...props} />
    </DialogOpenContext.Provider>
  );
}

const DialogTrigger = DialogPrimitive.Trigger;

const DialogPortal = DialogPrimitive.Portal;

const DialogClose = DialogPrimitive.Close;

function DialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay asChild forceMount {...props}>
      <OverlayFade
        className={cn("fixed inset-0 z-50 bg-black/80", className)}
      />
    </DialogPrimitive.Overlay>
  );
}

function DialogContent({
  className,
  children,
  showCloseButton = true,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  /** Hide the corner X (e.g. the command palette closes on Escape). */
  showCloseButton?: boolean;
}) {
  const isOpen = useContext(DialogOpenContext);
  return (
    <DialogPortal forceMount>
      <OverlayPresence open={isOpen}>
        <DialogOverlay />
        <DialogPrimitive.Content asChild forceMount {...props}>
          <DialogPop
            className={cn(
              "fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 gap-4 rounded-xl border bg-background p-6 shadow-lg sm:max-w-lg",
              className
            )}
          >
            {children}
            {showCloseButton ? (
              <DialogPrimitive.Close className="absolute top-4 right-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </DialogPrimitive.Close>
            ) : null}
          </DialogPop>
        </DialogPrimitive.Content>
      </OverlayPresence>
    </DialogPortal>
  );
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex flex-col gap-1.5 text-center sm:text-left",
        className
      )}
      {...props}
    />
  );
}

function DialogFooter({ className, ...props }: React.ComponentProps<"div">) {
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

function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      className={cn(
        "font-semibold text-lg leading-none tracking-tight",
        className
      )}
      {...props}
    />
  );
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
};

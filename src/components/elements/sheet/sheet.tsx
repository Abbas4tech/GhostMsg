"use client";

import { XIcon } from "lucide-react";
import { Dialog as SheetPrimitive } from "radix-ui";
import type * as React from "react";
import { createContext, useContext } from "react";
import {
  OverlayFade,
  OverlayPresence,
  SheetSlide,
} from "@/components/animate/overlay";
import { useControlledState } from "@/hooks/use-controlled-state";
import { cn } from "@/lib/utils";

/** Open state shared with SheetContent so motion can play the exit (ADR 0036). */
const SheetOpenContext = createContext(false);

function Sheet({
  defaultOpen,
  onOpenChange,
  open,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Root>) {
  const [isOpen, setIsOpen] = useControlledState({
    defaultValue: defaultOpen ?? false,
    onChange: onOpenChange,
    value: open,
  });
  return (
    <SheetOpenContext.Provider value={isOpen}>
      <SheetPrimitive.Root
        data-slot="sheet"
        onOpenChange={setIsOpen}
        open={isOpen}
        {...props}
      />
    </SheetOpenContext.Provider>
  );
}

function SheetTrigger({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Trigger>) {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />;
}

function SheetClose({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Close>) {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />;
}

function SheetPortal({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Portal>) {
  return <SheetPrimitive.Portal data-slot="sheet-portal" {...props} />;
}

function SheetOverlay({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Overlay>) {
  return (
    <SheetPrimitive.Overlay
      asChild
      data-slot="sheet-overlay"
      forceMount
      {...props}
    >
      <OverlayFade
        className={cn("fixed inset-0 z-50 bg-black/50", className)}
      />
    </SheetPrimitive.Overlay>
  );
}

const SHEET_SIDE_CLASS = {
  bottom: "inset-x-0 bottom-0 h-auto border-t",
  left: "inset-y-0 left-0 h-full w-3/4 border-r sm:max-w-sm",
  right: "inset-y-0 right-0 h-full w-3/4 border-l sm:max-w-sm",
  top: "inset-x-0 top-0 h-auto border-b",
} as const;

function SheetContent({
  className,
  children,
  side = "right",
  showCloseButton = true,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Content> & {
  side?: "top" | "right" | "bottom" | "left";
  showCloseButton?: boolean;
}) {
  const isOpen = useContext(SheetOpenContext);
  return (
    <SheetPortal forceMount>
      <OverlayPresence open={isOpen}>
        <SheetOverlay />
        <SheetPrimitive.Content
          asChild
          data-slot="sheet-content"
          forceMount
          {...props}
        >
          <SheetSlide
            className={cn(
              "fixed z-50 flex flex-col gap-4 bg-background shadow-lg",
              SHEET_SIDE_CLASS[side],
              className
            )}
            side={side}
          >
            {children}
            {showCloseButton ? (
              <SheetPrimitive.Close className="absolute top-4 right-4 rounded-xs opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary">
                <XIcon className="size-4" />
                <span className="sr-only">Close</span>
              </SheetPrimitive.Close>
            ) : null}
          </SheetSlide>
        </SheetPrimitive.Content>
      </OverlayPresence>
    </SheetPortal>
  );
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex flex-col gap-1.5 p-4", className)}
      data-slot="sheet-header"
      {...props}
    />
  );
}

function SheetFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("mt-auto flex flex-col gap-2 p-4", className)}
      data-slot="sheet-footer"
      {...props}
    />
  );
}

function SheetTitle({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Title>) {
  return (
    <SheetPrimitive.Title
      className={cn("font-semibold text-foreground", className)}
      data-slot="sheet-title"
      {...props}
    />
  );
}

function SheetDescription({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Description>) {
  return (
    <SheetPrimitive.Description
      className={cn("text-muted-foreground text-sm", className)}
      data-slot="sheet-description"
      {...props}
    />
  );
}

export {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
};

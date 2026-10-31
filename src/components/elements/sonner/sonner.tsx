"use client";

import {
  CircleCheck,
  Info,
  LoaderCircle,
  OctagonX,
  TriangleAlert,
} from "lucide-react";
import { useTheme } from "next-themes";
import { type JSX, useSyncExternalStore } from "react";
import { Toaster as Sonner, type ToasterProps } from "sonner";
import { buttonVariants } from "@/components/elements/button";
import { cn } from "@/lib/utils";
import { assertiveAnnouncements } from "./notify";

/** Bottom nav is min-h-16 (64px) + its own safe-area padding; clear it with a 16px gap. */
const MOBILE_BOTTOM_OFFSET = "calc(4rem + env(safe-area-inset-bottom) + 16px)";
/** Phone toasts sit 12px from the screen edges. */
const MOBILE_SIDE_OFFSET = "12px";

/** Ghost action in primary colour: 36px, 44px touch target below md. Also used by custom toasts. */
export const toastActionClassName = cn(
  buttonVariants({ size: "sm", variant: "ghost" }),
  "h-9 shrink-0 rounded-full px-3.5 text-primary text-sm hover:text-primary max-md:h-11"
);

/**
 * Toasts are unstyled Sonner toasts wearing the design's `.toast` surface: one
 * 52px line on the popover, 16px radius, lift shadow, coloured icon, at most
 * one action. Custom actions get the same surface, and an absolutely
 * positioned child pins to the toast's edges (the Undo toast's time-left bar).
 */
const Toaster = ({ ...props }: ToasterProps): JSX.Element => {
  const { theme = "system" } = useTheme();
  const assertive = useSyncExternalStore(
    assertiveAnnouncements.subscribe,
    assertiveAnnouncements.getSnapshot,
    assertiveAnnouncements.getServerSnapshot
  );

  return (
    <>
      {/* Errors from `notify.error` are announced at once; Sonner's region is
          polite. No role="alert", so it never competes with a screen's Alert. */}
      <div aria-atomic="true" aria-live="assertive" className="sr-only">
        {assertive}
      </div>
      <Sonner
        className="toaster group"
        icons={{
          error: <OctagonX className="text-destructive" />,
          info: <Info className="text-info" />,
          loading: <LoaderCircle className="animate-spin text-primary" />,
          success: <CircleCheck className="text-success" />,
          warning: (
            <TriangleAlert className="text-warning-foreground dark:text-warning" />
          ),
        }}
        mobileOffset={{
          bottom: MOBILE_BOTTOM_OFFSET,
          left: MOBILE_SIDE_OFFSET,
          right: MOBILE_SIDE_OFFSET,
        }}
        theme={theme as ToasterProps["theme"]}
        toastOptions={{
          classNames: {
            actionButton: toastActionClassName,
            cancelButton: cn(toastActionClassName, "text-muted-foreground"),
            content: "flex min-w-0 flex-1 flex-col gap-0.5",
            description: "font-normal text-muted-foreground",
            icon: "relative flex size-[1.2em] shrink-0 items-center justify-center [&_svg]:size-full",
            toast:
              "flex min-h-[52px] w-(--width) items-center gap-3 rounded-2xl border bg-popover py-3 pr-3 pl-4 font-semibold text-popover-foreground text-sm shadow-lift data-[expanded=false]:data-[front=false]:*:opacity-0 *:transition-opacity",
          },
          unstyled: true,
        }}
        {...props}
      />
    </>
  );
};

export { Toaster };

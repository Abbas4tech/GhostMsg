"use client";

import { AnimatePresence } from "motion/react";
import { span as MotionSpan } from "motion/react-m";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

const RING_INITIAL = { opacity: 0.55, scale: 1 } as const;
const RING_ANIMATE = { opacity: 0, scale: 1.9 } as const;
const RING_TRANSITION = { duration: 1.1, ease: "easeOut" } as const;
const REPEAT_TRANSITION = {
  ...RING_TRANSITION,
  repeat: 1,
  repeatDelay: 0.25,
} as const;

export interface PulseProps {
  children: ReactNode;
  className?: string;
  /** Tailwind classes for the ring (colour + shape). */
  ringClassName?: string;
  /** A new value starts a new pulse (e.g. unread count, a message id). Falsy = no ring. */
  trigger: unknown;
  /** Pulses twice instead of once. */
  twice?: boolean;
}

/**
 * One-shot attention ring expanding behind the child: a new Anonymous
 * Message, a verified mark. Opacity + scale only (compositor).
 */
function Pulse({
  children,
  className,
  ringClassName = "rounded-full bg-primary",
  trigger,
  twice = false,
}: PulseProps) {
  return (
    <span className={cn("relative isolate inline-grid", className)}>
      <AnimatePresence>
        {trigger ? (
          <MotionSpan
            animate={RING_ANIMATE}
            aria-hidden="true"
            className={cn("absolute inset-0 -z-10", ringClassName)}
            initial={RING_INITIAL}
            key={String(trigger)}
            transition={twice ? REPEAT_TRANSITION : RING_TRANSITION}
          />
        ) : null}
      </AnimatePresence>
      {children}
    </span>
  );
}

export { Pulse };

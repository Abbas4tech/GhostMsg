"use client";

import { AnimatePresence, type Variants } from "motion/react";
import { span as MotionSpan } from "motion/react-m";
import type { ReactNode } from "react";

import { useMotionTone } from "@/components/animate/tone";
import { type MotionTone, spring } from "@/lib/motion";
import { cn } from "@/lib/utils";

type SwapDirection = "down" | "fade" | "rotate" | "up";

const OFFSET = 14;

/** Vertical travel for a direction; `sign` is 1 entering, -1 leaving. */
const travel = (direction: SwapDirection, sign: 1 | -1): number => {
  if (direction === "up") {
    return OFFSET * sign;
  }
  if (direction === "down") {
    return -OFFSET * sign;
  }
  return 0;
};
const shrinks = (direction: SwapDirection): boolean =>
  direction === "rotate" || direction === "fade";

/** `custom` = direction; variants are shared module constants. */
const VARIANTS: Variants = {
  center: { filter: "blur(0px)", opacity: 1, rotate: 0, scale: 1, y: 0 },
  enter: (direction: SwapDirection) => ({
    filter: "blur(2px)",
    opacity: 0,
    rotate: direction === "rotate" ? -90 : 0,
    scale: shrinks(direction) ? 0.6 : 1,
    y: travel(direction, 1),
  }),
  exit: (direction: SwapDirection) => ({
    filter: "blur(2px)",
    opacity: 0,
    rotate: direction === "rotate" ? 90 : 0,
    scale: shrinks(direction) ? 0.6 : 1,
    y: travel(direction, -1),
  }),
};

const TRANSITION = { calm: spring.calm, expressive: spring.snappy } as const;

export interface SwapProps {
  children: ReactNode;
  className?: string;
  /** `up` (label slides up and out), `down`, `fade` (scale), `rotate` (icons). */
  direction?: SwapDirection;
  disabled?: boolean;
  /** Changing this swaps the old content out and the new content in. */
  swapKey: string | number;
  tone?: MotionTone;
}

/**
 * Crossfade + slide between keyed contents: button labels (Send → Sending →
 * Sent), icon swaps (copy → check, sun → moon). `popLayout` lets the new
 * content take its place at once, so the container never jumps.
 */
function Swap({
  children,
  className,
  direction = "up",
  disabled = false,
  swapKey,
  tone,
}: SwapProps) {
  const resolvedTone = useMotionTone(tone);
  if (disabled) {
    return <span className={cn("inline-flex", className)}>{children}</span>;
  }
  return (
    <AnimatePresence custom={direction} initial={false} mode="popLayout">
      <MotionSpan
        animate="center"
        className={cn("inline-flex items-center gap-[inherit]", className)}
        custom={direction}
        data-slot="swap"
        exit="exit"
        initial="enter"
        key={swapKey}
        transition={TRANSITION[resolvedTone]}
        variants={VARIANTS}
      >
        {children}
      </MotionSpan>
    </AnimatePresence>
  );
}

export { Swap, type SwapDirection };

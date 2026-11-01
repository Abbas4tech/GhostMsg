"use client";

import type { TargetAndTransition, Transition } from "motion/react";
import { span as MotionSpan } from "motion/react-m";

import { cn } from "@/lib/utils";

const SWEEP: TargetAndTransition = { x: ["-100%", "100%"] };
const SWEEP_TRANSITION: Transition = {
  duration: 1.6,
  ease: "easeInOut",
  repeat: Number.POSITIVE_INFINITY,
  repeatDelay: 0.2,
};

export interface ShimmerProps {
  className?: string;
}

/**
 * Light sweep across a loading surface. Place inside a `relative
 * overflow-hidden` box (Skeleton does this). Translate only (compositor).
 */
function Shimmer({ className }: ShimmerProps) {
  return (
    <MotionSpan
      animate={SWEEP}
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 bg-linear-to-r from-transparent via-background/60 to-transparent",
        className
      )}
      data-slot="shimmer"
      transition={SWEEP_TRANSITION}
    />
  );
}

export { Shimmer };

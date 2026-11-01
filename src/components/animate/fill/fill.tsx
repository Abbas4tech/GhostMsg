"use client";

import { type HTMLMotionProps, useReducedMotion } from "motion/react";
import { div as MotionDiv } from "motion/react-m";

import { spring } from "@/lib/motion";
import { cn } from "@/lib/utils";

const PERCENT = 100;

export interface FillProps
  extends Omit<HTMLMotionProps<"div">, "animate" | "initial"> {
  /** 0–100. */
  value: number;
}

/**
 * A bar that springs to `value` percent (Progress indicator, step bars).
 * Scales from the left instead of animating width, so it stays on the
 * compositor and never relayouts.
 */
function Fill({ className, style, value, ...props }: FillProps) {
  const prefersReduced = useReducedMotion();
  const clamped = Math.min(PERCENT, Math.max(0, value)) / PERCENT;
  return (
    <MotionDiv
      animate={{ scaleX: clamped }}
      className={cn("h-full w-full origin-left", className)}
      data-slot="fill"
      initial={false}
      style={style}
      transition={prefersReduced ? { duration: 0 } : spring.soft}
      {...props}
    />
  );
}

export { Fill };

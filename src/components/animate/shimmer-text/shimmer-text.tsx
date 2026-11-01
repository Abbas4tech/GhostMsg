"use client";

import {
  type TargetAndTransition,
  type Transition,
  useInView,
} from "motion/react";
import { span as MotionSpan } from "motion/react-m";
import { type ReactNode, useRef } from "react";

import { cn } from "@/lib/utils";

const SWEEP: TargetAndTransition = {
  backgroundPosition: ["200% 50%", "-200% 50%"],
};
const SWEEP_TRANSITION: Transition = {
  duration: 3.2,
  ease: "linear",
  repeat: Number.POSITIVE_INFINITY,
};

export interface ShimmerTextProps {
  children: ReactNode;
  className?: string;
  disabled?: boolean;
}

/**
 * A light sweep travelling across gradient text (brand words). Only runs while
 * visible, because background-position repaints the text.
 */
function ShimmerText({
  children,
  className,
  disabled = false,
}: ShimmerTextProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref);
  const isRunning = isInView && !disabled;
  return (
    <MotionSpan
      animate={isRunning ? SWEEP : undefined}
      className={cn(
        "bg-[length:200%_100%] bg-[linear-gradient(110deg,currentColor_40%,color-mix(in_oklch,currentColor_35%,white)_50%,currentColor_60%)] bg-clip-text text-transparent",
        className
      )}
      data-slot="shimmer-text"
      ref={ref}
      transition={SWEEP_TRANSITION}
    >
      {children}
    </MotionSpan>
  );
}

export { ShimmerText };

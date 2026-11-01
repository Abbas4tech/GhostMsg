"use client";

import type { TargetAndTransition, Transition } from "motion/react";
import { span as MotionSpan } from "motion/react-m";

import { cn } from "@/lib/utils";

const BLINK: TargetAndTransition = { opacity: [1, 1, 0, 0] };
const BLINK_TRANSITION: Transition = {
  duration: 1,
  ease: "linear",
  repeat: Number.POSITIVE_INFINITY,
  times: [0, 0.5, 0.5, 1],
};

export interface CaretProps {
  className?: string;
}

/** Blinking text caret (InputOTP fake caret, TypeWriter cursor). Opacity only. */
function Caret({ className }: CaretProps) {
  return (
    <MotionSpan
      animate={BLINK}
      aria-hidden="true"
      className={cn("inline-block h-[1em] w-px bg-current", className)}
      data-slot="caret"
      transition={BLINK_TRANSITION}
    />
  );
}

export { Caret };

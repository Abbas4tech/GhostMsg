"use client";

import {
  path as MotionPath,
  span as MotionSpan,
  svg as MotionSvg,
} from "motion/react-m";

import { Burst } from "@/components/animate/burst";
import { spring } from "@/lib/motion";
import { cn } from "@/lib/utils";

const CIRCLE_INITIAL = { opacity: 0, rotate: -20, scale: 0.4 } as const;
const CIRCLE_ANIMATE = { opacity: 1, rotate: 0, scale: 1 } as const;
const CHECK_INITIAL = { pathLength: 0 } as const;
const CHECK_ANIMATE = { pathLength: 1 } as const;
const CHECK_TRANSITION = {
  delay: 0.18,
  duration: 0.36,
  ease: "easeOut",
} as const;

export interface CelebrateProps {
  /** Classes for the circle (size + colours). */
  className?: string;
  /** Classes for the burst dots. */
  dotClassName?: string;
  /** Classes for the check icon (size). */
  iconClassName?: string;
  /** Burst radius in px. */
  radius?: number;
}

/**
 * Success mark for a Delight moment (sent, verified): the circle springs in
 * with a twist, the check draws itself, then a burst. Plays once on mount.
 */
function Celebrate({
  className = "size-19 bg-success text-success-foreground",
  dotClassName = "size-2 bg-success",
  iconClassName = "size-9",
  radius = 72,
}: CelebrateProps) {
  return (
    <span className="relative grid place-items-center" data-slot="celebrate">
      <MotionSpan
        animate={CIRCLE_ANIMATE}
        className={cn("grid place-items-center rounded-full", className)}
        initial={CIRCLE_INITIAL}
        transition={spring.bouncy}
      >
        <MotionSvg
          aria-hidden="true"
          className={iconClassName}
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2.5}
          viewBox="0 0 24 24"
        >
          <MotionPath
            animate={CHECK_ANIMATE}
            d="M5 12.5l4.5 4.5L19 7.5"
            initial={CHECK_INITIAL}
            transition={CHECK_TRANSITION}
          />
        </MotionSvg>
      </MotionSpan>
      <Burst count={12} dotClassName={dotClassName} radius={radius} />
    </span>
  );
}

export { Celebrate };

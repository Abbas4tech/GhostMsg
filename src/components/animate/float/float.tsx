"use client";

import { useInView } from "motion/react";
import { type ReactElement, useRef } from "react";

import { Slot } from "@/components/animate/slot";
import { loop } from "@/lib/motion";

const REST = { rotate: 0, y: 0 } as const;

export interface FloatProps {
  /** Vertical travel in px. */
  amplitude?: number;
  /** One element (illustration, ghost, sparkle); the motion props merge onto it. */
  children: ReactElement;
  /** Start offset (s) so neighbours don't bob in sync. */
  delay?: number;
  disabled?: boolean;
  /** Full cycle in seconds. */
  duration?: number;
  /** Degrees of sway added to the bob. */
  sway?: number;
}

/**
 * Idle bob with a little sway, for the landing hero, empty states and the 404
 * ghost only. Pauses while off-screen, so idle pages burn no frames.
 */
function Float({
  amplitude = 6,
  children,
  delay = 0,
  disabled = false,
  duration = loop.float.duration,
  sway = 2,
}: FloatProps) {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref);

  if (disabled) {
    return children;
  }
  return (
    <Slot
      animate={isInView ? { rotate: [-sway, sway], y: [0, -amplitude] } : REST}
      ref={ref}
      transition={isInView ? { ...loop.float, delay, duration } : undefined}
    >
      {children}
    </Slot>
  );
}

export { Float };

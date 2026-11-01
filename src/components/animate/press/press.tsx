"use client";

import type { ReactElement } from "react";

import { Slot } from "@/components/animate/slot";
import { useMotionTone } from "@/components/animate/tone";
import { type MotionTone, spring } from "@/lib/motion";

/** Gesture targets are module constants: no allocation per render. */
const TAP = { deep: { scale: 0.9 }, normal: { scale: 0.96 } } as const;
/** Public pages grow a touch on hover; the dashboard stays put. */
const HOVER = { calm: undefined, expressive: { scale: 1.02 } } as const;
const TRANSITION = { calm: spring.calm, expressive: spring.press } as const;

export interface PressProps {
  /** One element (Button, Link, chip…); the motion props merge onto it. */
  children: ReactElement;
  /** `deep` for icon-only controls. */
  depth?: keyof typeof TAP;
  /** Turns the animation off; the child renders untouched. */
  disabled?: boolean;
  /** Overrides the hover scale (1 = no hover growth). */
  hoverScale?: number;
  /** Overrides the tap scale. */
  scale?: number;
  tone?: MotionTone;
}

/**
 * Spring tap squash with a release overshoot, plus a slight hover growth on
 * pointer devices (motion's hover gesture ignores touch). Adds no DOM node.
 */
function Press({
  children,
  depth = "normal",
  disabled = false,
  hoverScale,
  scale,
  tone,
}: PressProps) {
  const resolvedTone = useMotionTone(tone);
  if (disabled) {
    return children;
  }
  let whileHover: { scale: number } | undefined = HOVER[resolvedTone];
  if (hoverScale !== undefined) {
    whileHover = hoverScale === 1 ? undefined : { scale: hoverScale };
  }
  return (
    <Slot
      transition={TRANSITION[resolvedTone]}
      whileHover={whileHover}
      whileTap={scale === undefined ? TAP[depth] : { scale }}
    >
      {children}
    </Slot>
  );
}

export { Press };

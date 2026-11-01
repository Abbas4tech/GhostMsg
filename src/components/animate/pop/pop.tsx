"use client";

import { type Transition, useAnimationControls } from "motion/react";
import { type ReactElement, useEffect, useRef } from "react";

import { Slot } from "@/components/animate/slot";
import { useMotionTone } from "@/components/animate/tone";
import type { MotionTone } from "@/lib/motion";

const PEAK = { calm: 1.12, expressive: 1.28 } as const;
/** Three keyframes, so a tween with an overshoot curve (springs take only two). */
const TIMING: Record<MotionTone, Transition> = {
  calm: { duration: 0.26, ease: "easeOut", times: [0, 0.4, 1] },
  expressive: {
    duration: 0.42,
    ease: [0.34, 1.56, 0.64, 1],
    times: [0, 0.45, 1],
  },
};

export interface PopProps {
  /** One element (star, badge, check, icon); the motion props merge onto it. */
  children: ReactElement;
  disabled?: boolean;
  /** Pops only when `trigger` becomes truthy (e.g. starred), not when it clears. */
  onlyWhenTruthy?: boolean;
  /** Peak scale; defaults by tone. */
  scale?: number;
  tone?: MotionTone;
  /** Pops each time this changes (never on mount). */
  trigger: unknown;
}

/** Pop to a peak and back each time `trigger` changes. */
function Pop({
  children,
  disabled = false,
  onlyWhenTruthy = false,
  scale,
  tone,
  trigger,
}: PopProps) {
  const resolvedTone = useMotionTone(tone);
  const controls = useAnimationControls();
  const previous = useRef<unknown>(trigger);

  useEffect(() => {
    const changed = previous.current !== trigger;
    previous.current = trigger;
    if (disabled || !changed || (onlyWhenTruthy && !trigger)) {
      return;
    }
    controls.start({
      scale: [1, scale ?? PEAK[resolvedTone], 1],
      transition: TIMING[resolvedTone],
    });
  }, [controls, disabled, onlyWhenTruthy, resolvedTone, scale, trigger]);

  if (disabled) {
    return children;
  }
  return <Slot animate={controls}>{children}</Slot>;
}

export { Pop };

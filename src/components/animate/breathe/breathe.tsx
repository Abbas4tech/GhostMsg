"use client";

import type { TargetAndTransition, Transition } from "motion/react";
import type { ReactElement } from "react";

import { Slot } from "@/components/animate/slot";

const BREATHE: TargetAndTransition = { opacity: [1, 0.5] };
const BREATHE_TRANSITION: Transition = {
  duration: 1,
  ease: "easeInOut",
  repeat: Number.POSITIVE_INFINITY,
  repeatType: "mirror",
};

export interface BreatheProps {
  /** One element (a skeleton block); the motion props merge onto it. */
  children: ReactElement;
  disabled?: boolean;
}

/** Slow opacity pulse for placeholders (stock Skeleton look). Opacity only. */
function Breathe({ children, disabled = false }: BreatheProps) {
  if (disabled) {
    return children;
  }
  return (
    <Slot animate={BREATHE} transition={BREATHE_TRANSITION}>
      {children}
    </Slot>
  );
}

export { Breathe };

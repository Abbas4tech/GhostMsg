"use client";

import type { ReactElement } from "react";

import { Slot } from "@/components/animate/slot";
import { loop } from "@/lib/motion";

const SPIN = { rotate: 360 } as const;

export interface SpinProps {
  /** Spins only while true (e.g. refreshing). */
  active?: boolean;
  /** One element (a loader icon); the motion props merge onto it. */
  children: ReactElement;
}

/**
 * Continuous rotation for loaders. `rotate` is a transform, so it stays on
 * the compositor. Reduced motion keeps it still (MotionConfig).
 */
function Spin({ active = true, children }: SpinProps) {
  if (!active) {
    return children;
  }
  return (
    <Slot animate={SPIN} transition={loop.spin}>
      {children}
    </Slot>
  );
}

export { Spin };

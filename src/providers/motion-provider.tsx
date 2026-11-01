"use client";

import { LazyMotion, MotionConfig } from "motion/react";
import type { ReactNode } from "react";

const loadFeatures = () =>
  import("./motion-features").then((module) => module.default);

export interface MotionProviderProps {
  children: ReactNode;
}

/**
 * App-wide motion setup (ADR 0035, ADR 0036). The full feature set (`domMax`:
 * animation, gestures, layout, drag) loads as one async chunk after first
 * paint, so it never counts toward first-load JS. `strict` makes a stray full
 * `motion.*` component throw instead of pulling the whole engine in sync.
 * `reducedMotion="user"` keeps transforms off when the OS asks for it.
 */
export function MotionProvider({ children }: MotionProviderProps) {
  return (
    <LazyMotion features={loadFeatures} strict>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  );
}

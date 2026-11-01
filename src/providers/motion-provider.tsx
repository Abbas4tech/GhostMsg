"use client";

import { LazyMotion, MotionConfig } from "motion/react";
import type { ReactNode } from "react";

const loadFeatures = () =>
  import("./motion-features").then((module) => module.default);

export interface MotionProviderProps {
  children: ReactNode;
}

/**
 * App-wide motion setup (ADR 0035). `m.*` components render their initial state
 * on the server and animate once the feature chunk has loaded, so the engine
 * never blocks first paint. `strict` makes a stray full `motion.*` component
 * throw instead of silently pulling the whole engine into the bundle.
 * `reducedMotion="user"` keeps transforms off when the OS asks for it.
 */
export function MotionProvider({ children }: MotionProviderProps) {
  return (
    <LazyMotion features={loadFeatures} strict>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  );
}

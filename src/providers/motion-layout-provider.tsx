"use client";

import { LazyMotion } from "motion/react";
import type { ReactNode } from "react";

const loadLayoutFeatures = () =>
  import("./motion-features-max").then((module) => module.default);

export interface MotionLayoutProviderProps {
  children: ReactNode;
}

/**
 * Upgrades descendants from `domAnimation` to `domMax` so `layout` and
 * `layoutId` work (reorder, shared indicators). Wrap only the screens that use
 * them, such as the dashboard, so landing and auth never download the extra
 * chunk (ADR 0035, M3, M6).
 */
export function MotionLayoutProvider({ children }: MotionLayoutProviderProps) {
  return (
    <LazyMotion features={loadLayoutFeatures} strict>
      {children}
    </LazyMotion>
  );
}

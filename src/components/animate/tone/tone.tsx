"use client";

import { createContext, type ReactNode, useContext } from "react";

import type { MotionTone } from "@/lib/motion";

const MotionToneContext = createContext<MotionTone>("expressive");

export interface MotionToneProviderProps {
  children: ReactNode;
  tone: MotionTone;
}

/**
 * Sets the default intensity for every animate/ wrapper below it (ADR 0036,
 * A7). The dashboard wraps its shell in `tone="calm"`: same wrappers, springs
 * that settle without visible overshoot. Public pages keep "expressive".
 */
function MotionToneProvider({ children, tone }: MotionToneProviderProps) {
  return (
    <MotionToneContext.Provider value={tone}>
      {children}
    </MotionToneContext.Provider>
  );
}

/** The tone a wrapper should use: its own `tone` prop wins over the context. */
function useMotionTone(override?: MotionTone): MotionTone {
  const contextTone = useContext(MotionToneContext);
  return override ?? contextTone;
}

export { MotionToneProvider, useMotionTone };

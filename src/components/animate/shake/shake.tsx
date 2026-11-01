"use client";

import { type TargetAndTransition, useAnimationControls } from "motion/react";
import { type ReactElement, useEffect, useRef } from "react";

import { Slot } from "@/components/animate/slot";

/** A damped wobble: big first swing, settling in ~360 ms. */
const SHAKE: TargetAndTransition = {
  transition: { duration: 0.36, ease: "easeOut" },
  x: [0, -9, 8, -6, 4, -2, 0],
};
const SHAKE_SOFT: TargetAndTransition = {
  transition: { duration: 0.3, ease: "easeOut" },
  x: [0, -5, 4, -3, 2, 0],
};

export interface ShakeProps {
  /** One element (an input, a field, the OTP row); the motion props merge onto it. */
  children: ReactElement;
  disabled?: boolean;
  intensity?: "soft" | "strong";
  /**
   * Shakes every time this changes to a truthy value: pass the error message,
   * an error key, or a counter. Falsy values never shake.
   */
  trigger: unknown;
}

/** Error shake. Fires on each new error, never on mount or on clearing. */
function Shake({
  children,
  disabled = false,
  intensity = "strong",
  trigger,
}: ShakeProps) {
  const controls = useAnimationControls();
  const previous = useRef<unknown>(trigger);

  useEffect(() => {
    const changed = previous.current !== trigger;
    previous.current = trigger;
    if (disabled || !changed || !trigger) {
      return;
    }
    controls.start(intensity === "soft" ? SHAKE_SOFT : SHAKE);
  }, [controls, disabled, intensity, trigger]);

  if (disabled) {
    return children;
  }
  return <Slot animate={controls}>{children}</Slot>;
}

export { Shake };

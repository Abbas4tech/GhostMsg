"use client";

import type { ReactElement } from "react";

import { Slot } from "@/components/animate/slot";
import { useMotionTone } from "@/components/animate/tone";
import { type MotionTone, spring } from "@/lib/motion";

const LIFT_PX = { calm: -2, expressive: -4 } as const;
const HOVER = {
  calm: { y: LIFT_PX.calm },
  expressive: { scale: 1.01, y: LIFT_PX.expressive },
} as const;
const TAP = { scale: 0.99, y: 0 } as const;

export interface LiftProps {
  /** One element (a card); the motion props merge onto it. */
  children: ReactElement;
  disabled?: boolean;
  tone?: MotionTone;
}

/** Card hover: rises on a soft spring on pointer devices, settles on press. */
function Lift({ children, disabled = false, tone }: LiftProps) {
  const resolvedTone = useMotionTone(tone);
  if (disabled) {
    return children;
  }
  return (
    <Slot
      transition={spring.soft}
      whileHover={HOVER[resolvedTone]}
      whileTap={TAP}
    >
      {children}
    </Slot>
  );
}

export { Lift };

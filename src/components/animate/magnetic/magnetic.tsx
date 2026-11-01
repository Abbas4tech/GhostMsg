"use client";

import { useMotionValue, useSpring } from "motion/react";
import { type PointerEvent, type ReactElement, useCallback } from "react";

import { Slot } from "@/components/animate/slot";
import { useRichMotion } from "@/hooks/use-rich-motion";
import { spring } from "@/lib/motion";

export interface MagneticProps {
  /** One element (usually the hero CTA); the motion props merge onto it. */
  children: ReactElement;
  disabled?: boolean;
  /** Share of the pointer offset the child follows (0–1). */
  strength?: number;
}

/**
 * The child leans toward the pointer while it is over it and springs back on
 * leave. Driven by motion values: no React re-render per pointer move. Rich
 * motion only (ADR 0035, R4).
 */
function Magnetic({
  children,
  disabled = false,
  strength = 0.3,
}: MagneticProps) {
  const isRich = useRichMotion();
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(rawX, spring.soft);
  const y = useSpring(rawY, spring.soft);

  const handlePointerMove = useCallback(
    (event: PointerEvent<HTMLElement>) => {
      const rect = event.currentTarget.getBoundingClientRect();
      rawX.set((event.clientX - (rect.left + rect.width / 2)) * strength);
      rawY.set((event.clientY - (rect.top + rect.height / 2)) * strength);
    },
    [rawX, rawY, strength]
  );
  const handlePointerLeave = useCallback(() => {
    rawX.set(0);
    rawY.set(0);
  }, [rawX, rawY]);

  if (disabled || !isRich) {
    return children;
  }
  return (
    <Slot
      onPointerLeave={handlePointerLeave}
      onPointerMove={handlePointerMove}
      style={{ x, y }}
    >
      {children}
    </Slot>
  );
}

export { Magnetic };

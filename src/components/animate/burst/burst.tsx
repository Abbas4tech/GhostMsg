"use client";

import { span as MotionSpan } from "motion/react-m";

import { useRichMotion } from "@/hooks/use-rich-motion";
import { cn } from "@/lib/utils";

const FULL_TURN = Math.PI * 2;
const BURST_DURATION_S = 0.7;
const BURST_DELAY_S = 0.12;
const DOT_STEP_S = 0.015;

export interface BurstProps {
  className?: string;
  /** Number of dots around the circle. */
  count?: number;
  /** Tailwind classes for each dot (size + colour). */
  dotClassName?: string;
  /** Distance (px) the dots travel from the centre. */
  radius?: number;
}

/**
 * One-shot radial burst for a Delight moment (sent, verified). Place it inside
 * a `relative` box; it centres itself and plays once on mount. Rich motion
 * only (ADR 0035, R4): skipped under reduced motion, Save-Data or low-end.
 */
function Burst({
  className,
  count = 10,
  dotClassName = "size-1.5 bg-primary",
  radius = 64,
}: BurstProps) {
  const isRich = useRichMotion();
  if (!isRich) {
    return null;
  }

  const dots = Array.from({ length: count }, (_, index) => {
    const angle = (index / count) * FULL_TURN;
    return {
      delay: BURST_DELAY_S + index * DOT_STEP_S,
      id: `burst-${index}`,
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
    };
  });

  return (
    <span
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 grid place-items-center",
        className
      )}
      data-slot="burst"
    >
      {dots.map((dot) => (
        <MotionSpan
          animate={{
            opacity: [0, 1, 0],
            scale: [0.4, 1, 0.6],
            x: [0, dot.x],
            y: [0, dot.y],
          }}
          className={cn("absolute rounded-full", dotClassName)}
          initial={{ opacity: 0 }}
          key={dot.id}
          transition={{
            delay: dot.delay,
            duration: BURST_DURATION_S,
            ease: [0.2, 0.8, 0.2, 1],
          }}
        />
      ))}
    </span>
  );
}

export { Burst };

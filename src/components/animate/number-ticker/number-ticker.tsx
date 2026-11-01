"use client";

import { useReducedMotion, useSpring, useTransform } from "motion/react";
import { span as MotionSpan } from "motion/react-m";
import { useEffect } from "react";

import { cn } from "@/lib/utils";

const COUNT_SPRING = { damping: 30, mass: 0.6, stiffness: 220 } as const;

export interface NumberTickerProps {
  className?: string;
  value: number;
}

/**
 * A count that rolls to its new value instead of jumping. Renders the real
 * number on the server and on first paint (no animation on mount), then
 * springs on change. Assistive tech reads the settled value from a hidden
 * span; the rolling digits are `aria-hidden`.
 */
function NumberTicker({ className, value }: NumberTickerProps) {
  const prefersReduced = useReducedMotion();
  const spring = useSpring(value, COUNT_SPRING);
  const display = useTransform(spring, (latest) => Math.round(latest));

  useEffect(() => {
    if (prefersReduced) {
      spring.jump(value);
      return;
    }
    spring.set(value);
  }, [prefersReduced, spring, value]);

  return (
    <span className={cn("tabular-nums", className)} data-slot="number-ticker">
      <span className="sr-only">{value}</span>
      <MotionSpan aria-hidden="true">{display}</MotionSpan>
    </span>
  );
}

export { NumberTicker };

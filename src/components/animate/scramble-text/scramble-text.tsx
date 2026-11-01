"use client";

import {
  animate,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "motion/react";
import { span as MotionSpan } from "motion/react-m";
import { useEffect } from "react";

import { cn } from "@/lib/utils";

const GLYPHS = "abcdefghijklmnopqrstuvwxyz0123456789@#$%&";

export interface ScrambleTextProps {
  className?: string;
  /** Seconds for the whole reveal. */
  duration?: number;
  text: string;
  /** Replays the scramble each time this changes. Defaults to once on mount. */
  trigger?: unknown;
}

const scramble = (text: string, progress: number): string => {
  const settled = Math.floor(progress * text.length);
  let out = text.slice(0, settled);
  for (let index = settled; index < text.length; index += 1) {
    out +=
      text[index] === " "
        ? " "
        : (GLYPHS[Math.floor(Math.random() * GLYPHS.length)] ?? "");
  }
  return out;
};

/**
 * Letters cycle through random glyphs and lock in left to right (a handle on
 * the verify success screen). Motion-value driven: no React re-renders.
 */
function ScrambleText({
  className,
  duration = 0.9,
  text,
  trigger,
}: ScrambleTextProps) {
  const prefersReduced = useReducedMotion();
  const progress = useMotionValue(prefersReduced ? 1 : 0);
  const display = useTransform(progress, (value) =>
    value >= 1 ? text : scramble(text, value)
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: `trigger` is the replay signal
  useEffect(() => {
    if (prefersReduced) {
      progress.set(1);
      return;
    }
    progress.set(0);
    const controls = animate(progress, 1, { duration, ease: "easeOut" });
    return () => controls.stop();
  }, [duration, prefersReduced, progress, trigger]);

  return (
    <span className={cn("tabular-nums", className)} data-slot="scramble-text">
      <span className="sr-only">{text}</span>
      <MotionSpan aria-hidden="true">{display}</MotionSpan>
    </span>
  );
}

export { ScrambleText };

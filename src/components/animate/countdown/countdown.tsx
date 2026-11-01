"use client";

import { useAnimate } from "motion/react";
import { useEffect, useRef } from "react";

import { cn } from "@/lib/utils";

export interface CountdownProps {
  className?: string;
  /** Total time in ms; the bar empties linearly over it. */
  durationMs: number;
  /** Freezes the bar (e.g. while the toast is hovered and its timer is paused). */
  paused?: boolean;
}

/**
 * Time-left bar (Undo toast). Shrinks with `scaleX` from the left, so it runs
 * on the compositor. It carries information, so it runs even under reduced
 * motion. Pausing keeps the exact position and resumes from it.
 */
function Countdown({ className, durationMs, paused = false }: CountdownProps) {
  const [scope, animate] = useAnimate<HTMLSpanElement>();
  const controls = useRef<ReturnType<typeof animate> | null>(null);

  useEffect(() => {
    controls.current = animate(
      scope.current,
      { scaleX: [1, 0] },
      { duration: durationMs / 1000, ease: "linear" }
    );
    return () => controls.current?.stop();
  }, [animate, durationMs, scope]);

  useEffect(() => {
    if (paused) {
      controls.current?.pause();
    } else {
      controls.current?.play();
    }
  }, [paused]);

  return (
    <span
      aria-hidden="true"
      className={cn("block origin-left", className)}
      data-slot="countdown"
      ref={scope}
    />
  );
}

export { Countdown };

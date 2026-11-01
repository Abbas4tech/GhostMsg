"use client";

import type { HTMLMotionProps } from "motion/react";
import { div as MotionDiv } from "motion/react-m";
import { useEffect } from "react";

import { useMotionTone } from "@/components/animate/tone";
import { type MotionTone, spring } from "@/lib/motion";

/**
 * Module-level: false until the first PageTransition has mounted. The first
 * render (server HTML + hydration) never animates, so server-rendered pages
 * are never hidden waiting for JS; every later navigation slides in.
 */
let hasHydrated = false;

const OFFSET = { calm: 12, expressive: 28 } as const;
const SHOWN = { filter: "blur(0px)", opacity: 1, x: 0, y: 0 } as const;

export interface PageTransitionProps
  extends Omit<HTMLMotionProps<"div">, "animate" | "initial"> {
  /** 1 = moving forward (enter from the right), -1 = back, 0 = rise from below. */
  direction?: -1 | 0 | 1;
  tone?: MotionTone;
}

/** Route or step enter: slides in the direction of travel with a blur fade. */
function PageTransition({
  direction = 0,
  tone,
  ...props
}: PageTransitionProps) {
  const resolvedTone = useMotionTone(tone);
  const isFirstRender = !hasHydrated;

  useEffect(() => {
    hasHydrated = true;
  }, []);

  const offset = OFFSET[resolvedTone];
  return (
    <MotionDiv
      animate={SHOWN}
      data-slot="page-transition"
      initial={
        isFirstRender
          ? false
          : {
              filter: "blur(6px)",
              opacity: 0,
              x: direction * offset,
              y: direction === 0 ? offset / 2 : 0,
            }
      }
      transition={resolvedTone === "calm" ? spring.calm : spring.gentle}
      {...props}
    />
  );
}

export { PageTransition };

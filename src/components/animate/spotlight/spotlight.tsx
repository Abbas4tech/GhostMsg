"use client";

import { useMotionTemplate, useMotionValue, useSpring } from "motion/react";
import { div as MotionDiv } from "motion/react-m";
import { type PointerEvent, type ReactNode, useCallback } from "react";

import { useRichMotion } from "@/hooks/use-rich-motion";
import { spring } from "@/lib/motion";
import { cn } from "@/lib/utils";

const HIDDEN_OPACITY = 0;
const SHOWN_OPACITY = 1;

export interface SpotlightProps {
  children: ReactNode;
  className?: string;
  /** Radius of the light in px. */
  size?: number;
}

/**
 * A soft light that follows the pointer across a surface (public cards).
 * Desktop pointers only; motion values, no re-render per move. Rich motion.
 */
function Spotlight({ children, className, size = 260 }: SpotlightProps) {
  const isRich = useRichMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const opacity = useSpring(HIDDEN_OPACITY, spring.soft);
  const background = useMotionTemplate`radial-gradient(${size}px circle at ${x}px ${y}px, color-mix(in oklch, var(--primary) 14%, transparent), transparent 70%)`;

  const handlePointerMove = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      if (event.pointerType !== "mouse") {
        return;
      }
      const rect = event.currentTarget.getBoundingClientRect();
      x.set(event.clientX - rect.left);
      y.set(event.clientY - rect.top);
      opacity.set(SHOWN_OPACITY);
    },
    [opacity, x, y]
  );
  const handlePointerLeave = useCallback(() => {
    opacity.set(HIDDEN_OPACITY);
  }, [opacity]);

  if (!isRich) {
    return <div className={className}>{children}</div>;
  }
  return (
    <div
      className={cn("relative isolate", className)}
      data-slot="spotlight"
      onPointerLeave={handlePointerLeave}
      onPointerMove={handlePointerMove}
    >
      {children}
      <MotionDiv
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-[inherit]"
        style={{ background, opacity }}
      />
    </div>
  );
}

export { Spotlight };

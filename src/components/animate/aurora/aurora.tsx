"use client";

import { useInView } from "motion/react";
import { div as MotionDiv } from "motion/react-m";
import { useRef } from "react";

import { useRichMotion } from "@/hooks/use-rich-motion";
import { cn } from "@/lib/utils";

interface Blob {
  animate: { scale: number[]; x: string[]; y: string[] };
  className: string;
  duration: number;
}

/** Three slow, out-of-phase blobs. Transform-only loops on pre-blurred layers. */
const BLOBS: readonly Blob[] = [
  {
    animate: {
      scale: [1, 1.15, 1],
      x: ["0%", "12%", "0%"],
      y: ["0%", "8%", "0%"],
    },
    className: "top-[-20%] left-[-10%] size-[55%] bg-primary/25",
    duration: 18,
  },
  {
    animate: {
      scale: [1, 0.9, 1],
      x: ["0%", "-10%", "0%"],
      y: ["0%", "12%", "0%"],
    },
    className: "top-[10%] right-[-15%] size-[50%] bg-accent/40",
    duration: 22,
  },
  {
    animate: {
      scale: [1, 1.2, 1],
      x: ["0%", "6%", "0%"],
      y: ["0%", "-10%", "0%"],
    },
    className: "bottom-[-25%] left-[25%] size-[45%] bg-star/20",
    duration: 26,
  },
];

export interface AuroraProps {
  className?: string;
}

/**
 * Drifting gradient mesh behind the landing hero. Rich motion only and paused
 * off-screen; otherwise the blobs sit still, so the backdrop still shows.
 */
function Aurora({ className }: AuroraProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref);
  const isRich = useRichMotion();
  const isRunning = isRich && isInView;

  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 -z-10 overflow-hidden",
        className
      )}
      data-slot="aurora"
      ref={ref}
    >
      {BLOBS.map((blob) => (
        <MotionDiv
          animate={isRunning ? blob.animate : undefined}
          className={cn("absolute rounded-full blur-3xl", blob.className)}
          key={blob.className}
          transition={{
            duration: blob.duration,
            ease: "easeInOut",
            repeat: Number.POSITIVE_INFINITY,
          }}
        />
      ))}
    </div>
  );
}

export { Aurora };

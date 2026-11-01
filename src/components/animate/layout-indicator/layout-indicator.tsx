"use client";

import { span as MotionSpan } from "motion/react-m";

import { spring } from "@/lib/motion";
import { cn } from "@/lib/utils";

export interface LayoutIndicatorProps {
  className?: string;
  /** Shared id (see `layoutIds` in lib/motion): one indicator per id on screen. */
  layoutId: string;
}

/**
 * The sliding "active" pill behind a nav item, tab or chip. Render it inside
 * the active item only; when the active item changes, the pill glides there
 * with the soft spring. The item must be `relative isolate` with a transparent
 * active background. Layout features come from the root MotionProvider (domMax).
 */
function LayoutIndicator({ className, layoutId }: LayoutIndicatorProps) {
  return (
    <MotionSpan
      aria-hidden="true"
      className={cn("absolute inset-0 -z-10", className)}
      data-slot="layout-indicator"
      layoutId={layoutId}
      transition={spring.soft}
    />
  );
}

export { LayoutIndicator };

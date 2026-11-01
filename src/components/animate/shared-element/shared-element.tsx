"use client";

import type { HTMLMotionProps } from "motion/react";
import { div as MotionDiv } from "motion/react-m";

import { spring } from "@/lib/motion";

export interface SharedElementProps
  extends Omit<HTMLMotionProps<"div">, "layoutId"> {
  /** Renders a plain motion div with no shared id (e.g. phones, reduced motion). */
  disabled?: boolean;
  /** The same id on two elements makes the second grow out of the first. */
  layoutId: string;
}

/**
 * Shared-element morph: when an element with the same `layoutId` mounts
 * elsewhere (a dialog), it animates from this one's box to its own. Layout
 * features come from the root MotionProvider (domMax).
 */
function SharedElement({
  disabled = false,
  layoutId,
  ...props
}: SharedElementProps) {
  return (
    <MotionDiv
      data-slot="shared-element"
      layoutId={disabled ? undefined : layoutId}
      transition={spring.soft}
      {...props}
    />
  );
}

export { SharedElement };

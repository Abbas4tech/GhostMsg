"use client";

import { AnimatePresence, type HTMLMotionProps } from "motion/react";
import { div as MotionDiv } from "motion/react-m";
import type { ReactNode } from "react";

import { transition } from "@/lib/motion";

/** Items past this index appear with no delay, so long lists never feel slow. */
const STAGGER_CAP = 8;
const STAGGER_STEP_S = 0.04;
const ENTER_OFFSET_PX = 8;
const EXIT_SCALE = 0.96;

export interface PresenceListProps {
  children: ReactNode;
}

/**
 * Wraps keyed `PresenceItem`s so removed items animate out while the rest
 * slide into place. `popLayout` takes the leaving item out of flow at once.
 * Needs `MotionLayoutProvider` above it (domMax) for the slide; without it
 * items still fade in and out.
 */
function PresenceList({ children }: PresenceListProps) {
  return <AnimatePresence mode="popLayout">{children}</AnimatePresence>;
}

export interface PresenceItemProps
  extends Omit<HTMLMotionProps<"div">, "animate" | "exit" | "initial"> {
  /** Position in the list; the first few items stagger in. */
  index?: number;
}

/** A list item that fades and rises in, fades and shrinks out, and re-flows. */
function PresenceItem({
  index = 0,
  layout = "position",
  ...props
}: PresenceItemProps) {
  const delay = index < STAGGER_CAP ? index * STAGGER_STEP_S : 0;
  return (
    <MotionDiv
      animate={{
        opacity: 1,
        transition: { ...transition.moderate, delay },
        y: 0,
      }}
      exit={{ opacity: 0, scale: EXIT_SCALE, transition: transition.exit }}
      initial={{ opacity: 0, y: ENTER_OFFSET_PX }}
      layout={layout}
      {...props}
    />
  );
}

export { PresenceItem, PresenceList };

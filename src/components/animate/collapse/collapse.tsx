"use client";

import { AnimatePresence, type HTMLMotionProps } from "motion/react";
import { div as MotionDiv } from "motion/react-m";

import { spring, transition } from "@/lib/motion";

const CLOSED = { height: 0, opacity: 0 } as const;
const OPEN = { height: "auto", opacity: 1 } as const;
const OPEN_TRANSITION = {
  height: spring.soft,
  opacity: { ...transition.base, delay: 0.04 },
} as const;
const CLOSE = {
  height: 0,
  opacity: 0,
  transition: { height: spring.calm, opacity: transition.exit },
} as const;

export interface CollapseProps
  extends Omit<HTMLMotionProps<"div">, "animate" | "exit" | "initial"> {
  /** Render the content (and keep it mounted) even while closed. */
  keepMounted?: boolean;
  open: boolean;
}

/**
 * Height auto ↔ 0 with a content fade, on a spring (accordion panels, the
 * Export row, Profile's edit card). `overflow: hidden` only while moving.
 */
function Collapse({
  children,
  keepMounted = false,
  open,
  style,
  ...props
}: CollapseProps) {
  if (keepMounted) {
    return (
      <MotionDiv
        animate={open ? OPEN : CLOSED}
        aria-hidden={!open}
        data-slot="collapse"
        initial={false}
        style={{ overflow: "hidden", ...style }}
        transition={open ? OPEN_TRANSITION : CLOSE.transition}
        {...props}
      >
        {children}
      </MotionDiv>
    );
  }
  return (
    <AnimatePresence initial={false}>
      {open ? (
        <MotionDiv
          animate={OPEN}
          data-slot="collapse"
          exit={CLOSE}
          initial={CLOSED}
          style={{ overflow: "hidden", ...style }}
          transition={OPEN_TRANSITION}
          {...props}
        >
          {children}
        </MotionDiv>
      ) : null}
    </AnimatePresence>
  );
}

export { Collapse };

"use client";

import { AnimatePresence, type HTMLMotionProps } from "motion/react";
import { div as MotionDiv } from "motion/react-m";

import { transition } from "@/lib/motion";

const HIDDEN = { filter: "blur(4px)", opacity: 0, y: 6 } as const;
const SHOWN = { filter: "blur(0px)", opacity: 1, y: 0 } as const;
const EXIT = {
  filter: "blur(4px)",
  opacity: 0,
  transition: transition.exit,
  y: -4,
} as const;

export interface FadeSwitchProps
  extends Omit<HTMLMotionProps<"div">, "animate" | "exit" | "initial"> {
  /** `wait`: old leaves, then new enters. `popLayout`: both at once, no jump. */
  mode?: "popLayout" | "wait";
  /** Changing this crossfades from the old content to the new one. */
  switchKey: string | number;
}

/**
 * Crossfade with a light de-blur between states of one region: skeleton →
 * content, tab panels, empty ↔ list, settings section bodies.
 */
function FadeSwitch({
  children,
  mode = "popLayout",
  switchKey,
  ...props
}: FadeSwitchProps) {
  return (
    <AnimatePresence initial={false} mode={mode}>
      <MotionDiv
        animate={SHOWN}
        data-slot="fade-switch"
        exit={EXIT}
        initial={HIDDEN}
        key={switchKey}
        transition={transition.moderate}
        {...props}
      >
        {children}
      </MotionDiv>
    </AnimatePresence>
  );
}

export { FadeSwitch };

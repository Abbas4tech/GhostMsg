"use client";

import type { HTMLMotionProps } from "motion/react";
import { div as MotionDiv } from "motion/react-m";

import { spring, transition } from "@/lib/motion";

/*
 * Motion surfaces for Radix overlays. Elements render them through Radix
 * `asChild` + `forceMount` inside an <AnimatePresence> keyed on the open state,
 * so Radix keeps focus/a11y and motion owns enter and exit (ADR 0036).
 */

const FADE_IN = { opacity: 1, transition: transition.base } as const;
const FADE_OUT = { opacity: 0, transition: transition.exit } as const;
const TRANSPARENT = { opacity: 0 } as const;

export type OverlayMotionProps = Omit<
  HTMLMotionProps<"div">,
  "animate" | "exit" | "initial"
>;

/** Dimmed backdrop behind dialogs and sheets. */
function OverlayFade(props: OverlayMotionProps) {
  return (
    <MotionDiv
      animate={FADE_IN}
      data-motion="overlay"
      exit={FADE_OUT}
      initial={TRANSPARENT}
      {...props}
    />
  );
}

const DIALOG_HIDDEN = {
  filter: "blur(4px)",
  opacity: 0,
  scale: 0.94,
  y: 14,
} as const;
const DIALOG_SHOWN = {
  filter: "blur(0px)",
  opacity: 1,
  scale: 1,
  transition: spring.snappy,
  y: 0,
} as const;
const DIALOG_EXIT = {
  filter: "blur(2px)",
  opacity: 0,
  scale: 0.97,
  transition: transition.exit,
  y: 6,
} as const;

/**
 * Centred dialog surface: springs up from 0.94 with a blur clear. The element
 * keeps Radix's centring via `x`/`y` percentages in its own style when needed.
 */
function DialogPop(props: OverlayMotionProps) {
  return (
    <MotionDiv
      animate={DIALOG_SHOWN}
      data-motion="dialog"
      exit={DIALOG_EXIT}
      initial={DIALOG_HIDDEN}
      {...props}
    />
  );
}

const FLOATING_HIDDEN = { opacity: 0, scale: 0.92 } as const;
const FLOATING_SHOWN = {
  opacity: 1,
  scale: 1,
  transition: spring.snappy,
} as const;
const FLOATING_EXIT = {
  opacity: 0,
  scale: 0.96,
  transition: transition.exit,
} as const;

/**
 * Menus, popovers, selects, tooltips, hover cards: scales out of the trigger
 * (the element sets `transform-origin` from Radix's CSS variable).
 */
function FloatingPop(props: OverlayMotionProps) {
  return (
    <MotionDiv
      animate={FLOATING_SHOWN}
      data-motion="floating"
      exit={FLOATING_EXIT}
      initial={FLOATING_HIDDEN}
      {...props}
    />
  );
}

type SheetSide = "bottom" | "left" | "right" | "top";

const SHEET_OFFSCREEN: Record<SheetSide, { x?: string; y?: string }> = {
  bottom: { y: "100%" },
  left: { x: "-100%" },
  right: { x: "100%" },
  top: { y: "-100%" },
};
const SHEET_SHOWN = { transition: spring.soft, x: 0, y: 0 } as const;

export interface SheetSlideProps extends OverlayMotionProps {
  side?: SheetSide;
}

/** Side sheet: slides in from its edge on a soft spring, out on a quick tween. */
function SheetSlide({ side = "right", ...props }: SheetSlideProps) {
  const offscreen = SHEET_OFFSCREEN[side];
  return (
    <MotionDiv
      animate={SHEET_SHOWN}
      data-motion="sheet"
      exit={{ ...offscreen, transition: transition.base }}
      initial={offscreen}
      {...props}
    />
  );
}

export { DialogPop, FloatingPop, OverlayFade, type SheetSide, SheetSlide };

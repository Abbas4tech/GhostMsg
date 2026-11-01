"use client";

import type { HTMLMotionProps } from "motion/react";
import { button as MotionButton } from "motion/react-m";

import { Slot, type WithAsChild } from "@/components/animate/slot";

type ButtonProps = WithAsChild<
  HTMLMotionProps<"button"> & {
    /** Opt-in JS hover scale. Press and hover feedback is CSS (`press`), ADR 0035. */
    hoverScale?: number;
    /** Opt-in JS tap scale. Prefer the CSS `press` utility. */
    tapScale?: number;
  }
>;

function Button({
  hoverScale,
  tapScale,
  asChild = false,
  ...props
}: ButtonProps) {
  const Component = asChild ? Slot : MotionButton;

  return (
    <Component
      whileHover={hoverScale ? { scale: hoverScale } : undefined}
      whileTap={tapScale ? { scale: tapScale } : undefined}
      {...props}
    />
  );
}

export { Button, type ButtonProps };

"use client";

import type { HTMLMotionProps } from "motion/react";
import { button as MotionButton } from "motion/react-m";

import { Slot, type WithAsChild } from "@/components/elements/effects/slot";

type ButtonProps = WithAsChild<
  HTMLMotionProps<"button"> & {
    hoverScale?: number;
    tapScale?: number;
  }
>;

function Button({
  hoverScale = 1.05,
  tapScale = 0.95,
  asChild = false,
  ...props
}: ButtonProps) {
  const Component = asChild ? Slot : MotionButton;

  return (
    <Component
      whileHover={{ scale: hoverScale }}
      whileTap={{ scale: tapScale }}
      {...props}
    />
  );
}

export { Button, type ButtonProps };

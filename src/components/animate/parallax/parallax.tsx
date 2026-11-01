"use client";

import {
  type HTMLMotionProps,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import { div as MotionDiv } from "motion/react-m";

import { useRichMotion } from "@/hooks/use-rich-motion";

/** Scroll distance (px) over which the full offset is applied. */
const SCROLL_RANGE_PX = 600;
const SMOOTHING = { damping: 30, mass: 0.4, stiffness: 120 } as const;

export interface ParallaxProps extends HTMLMotionProps<"div"> {
  /** How far (px) the layer drifts up over the first 600px of scroll. Negative drifts down. */
  offset?: number;
}

/**
 * Decorative scroll depth: the layer drifts against the page as it scrolls,
 * smoothed by a spring. Driven by motion values, so it never re-renders React.
 * Only runs as Rich motion (ADR 0035, R4); otherwise it is a plain wrapper.
 */
function Parallax({ children, offset = 40, style, ...props }: ParallaxProps) {
  const isRich = useRichMotion();
  const { scrollY } = useScroll();
  const raw = useTransform(scrollY, [0, SCROLL_RANGE_PX], [0, -offset], {
    clamp: true,
  });
  const y = useSpring(raw, SMOOTHING);

  return (
    <MotionDiv
      data-slot="parallax"
      style={isRich ? { ...style, y } : style}
      {...props}
    >
      {children}
    </MotionDiv>
  );
}

export { Parallax };

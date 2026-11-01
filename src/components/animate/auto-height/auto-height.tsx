"use client";

import type {
  HTMLMotionProps,
  LegacyAnimationControls,
  TargetAndTransition,
  Transition,
} from "motion/react";
import { div as MotionDiv } from "motion/react-m";
import type * as React from "react";
import { Slot, type WithAsChild } from "@/components/animate/slot";
import { useAutoHeight } from "@/hooks/use-auto-height";

type AutoHeightProps = WithAsChild<
  {
    children: React.ReactNode;
    deps?: React.DependencyList;
    animate?: TargetAndTransition | LegacyAnimationControls;
    transition?: Transition;
  } & Omit<HTMLMotionProps<"div">, "animate">
>;

function AutoHeight({
  children,
  deps = [],
  transition = {
    bounce: 0,
    damping: 30,
    restDelta: 0.01,
    stiffness: 300,
    type: "spring",
  },
  style,
  animate,
  asChild = false,
  ...props
}: AutoHeightProps) {
  const { ref, height } = useAutoHeight<HTMLDivElement>(deps);

  const Comp = asChild ? Slot : MotionDiv;

  return (
    <Comp
      animate={{ height, ...animate }}
      style={{ overflow: "hidden", ...style }}
      transition={transition}
      {...props}
    >
      <div ref={ref}>{children}</div>
    </Comp>
  );
}

export { AutoHeight, type AutoHeightProps };

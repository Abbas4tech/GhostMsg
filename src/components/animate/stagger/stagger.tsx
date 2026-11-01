"use client";

import type { HTMLMotionProps, Variants } from "motion/react";
import {
  div as MotionDiv,
  li as MotionLi,
  ul as MotionUl,
} from "motion/react-m";

import { useMotionTone } from "@/components/animate/tone";
import { type MotionTone, spring } from "@/lib/motion";

const DEFAULT_STAGGER_S = 0.06;
const OFFSET_PX = 14;

const GROUP: Variants = {
  hidden: {},
  show: (stagger: number) => ({
    transition: { delayChildren: 0.04, staggerChildren: stagger },
  }),
};
const ITEM_EXPRESSIVE: Variants = {
  hidden: { filter: "blur(4px)", opacity: 0, scale: 0.98, y: OFFSET_PX },
  show: {
    filter: "blur(0px)",
    opacity: 1,
    scale: 1,
    transition: spring.gentle,
    y: 0,
  },
};
const ITEM_CALM: Variants = {
  hidden: { opacity: 0, y: OFFSET_PX / 2 },
  show: { opacity: 1, transition: spring.calm, y: 0 },
};

type GroupElement = "div" | "ul";

export type StaggerProps = {
  /** Seconds between children. */
  stagger?: number;
} & (
  | ({ as?: "div" } & Omit<
      HTMLMotionProps<"div">,
      "animate" | "initial" | "variants"
    >)
  | ({ as: "ul" } & Omit<
      HTMLMotionProps<"ul">,
      "animate" | "initial" | "variants"
    >)
);

/**
 * Children marked `StaggerItem` enter one after another when the group mounts.
 * For content that appears after an interaction or a client fetch (forms,
 * lists, dialogs, chips). For server-rendered, below-the-fold sections use
 * `Reveal`, which never hides first-paint HTML.
 */
function Stagger({
  as = "div",
  stagger = DEFAULT_STAGGER_S,
  ...props
}: StaggerProps) {
  const shared = {
    animate: "show",
    custom: stagger,
    "data-slot": "stagger",
    initial: "hidden",
    variants: GROUP,
  } as const;
  const Component = (
    (as as GroupElement) === "ul" ? MotionUl : MotionDiv
  ) as typeof MotionDiv;
  return <Component {...shared} {...(props as HTMLMotionProps<"div">)} />;
}

export type StaggerItemProps = { tone?: MotionTone } & (
  | ({ as?: "div" } & Omit<HTMLMotionProps<"div">, "variants">)
  | ({ as: "li" } & Omit<HTMLMotionProps<"li">, "variants">)
);

/** One step of a `Stagger` (or `Reveal`) sequence. */
function StaggerItem({ as = "div", tone, ...props }: StaggerItemProps) {
  const resolvedTone = useMotionTone(tone);
  const variants = resolvedTone === "calm" ? ITEM_CALM : ITEM_EXPRESSIVE;
  const Component = (as === "li" ? MotionLi : MotionDiv) as typeof MotionDiv;
  return (
    <Component
      data-slot="stagger-item"
      variants={variants}
      {...(props as HTMLMotionProps<"div">)}
    />
  );
}

export { Stagger, StaggerItem };

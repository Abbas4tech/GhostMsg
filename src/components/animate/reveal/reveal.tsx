"use client";

import { type HTMLMotionProps, useInView } from "motion/react";
import {
  div as MotionDiv,
  li as MotionLi,
  section as MotionSection,
  ul as MotionUl,
} from "motion/react-m";
import { useLayoutEffect, useRef, useState } from "react";

import { revealGroup, revealItem } from "@/lib/motion";

type RevealState = "hidden" | "show" | undefined;

/**
 * True once the element should play its reveal: only if it was still below
 * the fold after hydration, so anything already on screen never blinks out.
 */
function useRevealState(ref: React.RefObject<HTMLElement | null>): RevealState {
  const isInView = useInView(ref, { amount: 0.2, once: true });
  const [isArmed, setIsArmed] = useState(false);

  useLayoutEffect(() => {
    const node = ref.current;
    if (node && node.getBoundingClientRect().top > window.innerHeight) {
      setIsArmed(true);
    }
  }, [ref]);

  if (!isArmed) {
    return undefined;
  }
  return isInView ? "show" : "hidden";
}

interface RevealOwnProps {
  /** Seconds between each RevealItem child. */
  stagger?: number;
}

export type RevealProps = RevealOwnProps &
  (
    | ({ as?: "div" } & Omit<
        HTMLMotionProps<"div">,
        "animate" | "initial" | "variants"
      >)
    | ({ as: "ul" } & Omit<
        HTMLMotionProps<"ul">,
        "animate" | "initial" | "variants"
      >)
    | ({ as: "section" } & Omit<
        HTMLMotionProps<"section">,
        "animate" | "initial" | "variants"
      >)
  );

/**
 * Below-the-fold choreography: children marked `RevealItem` rise in one after
 * another the first time the group scrolls into view (ADR 0035, R2).
 *
 * Server HTML is fully visible (no `initial` state), so content never depends
 * on JavaScript and never hides the page before hydration.
 */
function Reveal({ as = "div", stagger, ...props }: RevealProps) {
  const ref = useRef<HTMLElement>(null);
  const animate = useRevealState(ref);
  const shared = {
    animate,
    custom: stagger,
    "data-slot": "reveal",
    initial: false as const,
    variants: revealGroup,
  };

  if (as === "section") {
    return (
      <MotionSection
        {...shared}
        {...(props as HTMLMotionProps<"section">)}
        ref={ref}
      />
    );
  }
  if (as === "ul") {
    return (
      <MotionUl
        {...shared}
        {...(props as HTMLMotionProps<"ul">)}
        ref={ref as React.RefObject<HTMLUListElement>}
      />
    );
  }
  return (
    <MotionDiv
      {...shared}
      {...(props as HTMLMotionProps<"div">)}
      ref={ref as React.RefObject<HTMLDivElement>}
    />
  );
}

export type RevealItemProps =
  | ({ as?: "div" } & Omit<HTMLMotionProps<"div">, "variants">)
  | ({ as: "li" } & Omit<HTMLMotionProps<"li">, "variants">);

/** One step of a `Reveal` sequence. Inherits the group's state. */
function RevealItem({ as = "div", ...props }: RevealItemProps) {
  if (as === "li") {
    return (
      <MotionLi
        data-slot="reveal-item"
        variants={revealItem}
        {...(props as HTMLMotionProps<"li">)}
      />
    );
  }
  return (
    <MotionDiv
      data-slot="reveal-item"
      variants={revealItem}
      {...(props as HTMLMotionProps<"div">)}
    />
  );
}

export { Reveal, RevealItem };

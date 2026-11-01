"use client";

import { useInView, type Variants } from "motion/react";
import { span as MotionSpan } from "motion/react-m";
import {
  createElement,
  Fragment,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { spring } from "@/lib/motion";
import { cn } from "@/lib/utils";

type TextTag = "h1" | "h2" | "h3" | "p" | "span";

const GROUP: Variants = {
  hidden: {},
  show: ({ delay, stagger }: { delay: number; stagger: number }) => ({
    transition: { delayChildren: delay, staggerChildren: stagger },
  }),
};
/** Client-only text: tokens fade, rise and de-blur in. */
const TOKEN: Variants = {
  hidden: { filter: "blur(8px)", opacity: 0, y: "0.45em" },
  show: { filter: "blur(0px)", opacity: 1, transition: spring.gentle, y: 0 },
};
/**
 * First-paint text (the LCP headline): tokens stay fully opaque and only
 * settle into place, so the largest paint is never delayed (ADR 0036, A8).
 */
const TOKEN_SETTLE: Variants = {
  hidden: { opacity: 1, rotate: 2, y: "0.28em" },
  show: { opacity: 1, rotate: 0, transition: spring.gentle, y: 0 },
};

export interface TextRevealProps {
  as?: TextTag;
  /** Split into words (default) or characters. */
  by?: "char" | "word";
  className?: string;
  /** Seconds before the first token. */
  delay?: number;
  disabled?: boolean;
  /**
   * Server-rendered, visible-at-first-paint text: never hides, only settles.
   * Use for the hero headline and any heading above the fold.
   */
  settle?: boolean;
  /** Seconds between tokens. */
  stagger?: number;
  text: string;
  /** `mount` plays on mount; `inView` plays the first time it scrolls into view. */
  trigger?: "inView" | "mount";
}

/** True when an `inView` reveal may hide and replay (still below the fold after hydration). */
function useArmed(
  ref: React.RefObject<HTMLElement | null>,
  enabled: boolean
): boolean {
  const [armed, setArmed] = useState(false);
  useLayoutEffect(() => {
    const node = ref.current;
    if (
      enabled &&
      node &&
      node.getBoundingClientRect().top > window.innerHeight
    ) {
      setArmed(true);
    }
  }, [enabled, ref]);
  return armed;
}

/**
 * Heading/text reveal: words or letters rise, de-blur and fade in one after
 * another. The full string stays in the DOM (screen readers and crawlers read
 * it at once); the animated tokens are `aria-hidden`.
 */
function TextReveal({
  as = "span",
  by = "word",
  className,
  delay = 0,
  disabled = false,
  settle = false,
  stagger = by === "char" ? 0.022 : 0.06,
  text,
  trigger = "mount",
}: TextRevealProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { amount: 0.4, once: true });
  const armed = useArmed(ref, trigger === "inView");
  const tokens = useMemo(
    () => (by === "char" ? Array.from(text) : text.split(" ")),
    [by, text]
  );
  const custom = useMemo(() => ({ delay, stagger }), [delay, stagger]);

  if (disabled) {
    return createElement(as, { className }, text);
  }

  let initial: false | "hidden" = "hidden";
  let animate: "hidden" | "show" | undefined = "show";
  if (trigger === "inView") {
    initial = false;
    if (!armed) {
      animate = undefined;
    } else if (isInView) {
      animate = "show";
    } else {
      animate = "hidden";
    }
  }
  const tokenVariants = settle ? TOKEN_SETTLE : TOKEN;

  return createElement(
    as,
    { className, "data-slot": "text-reveal" },
    <span className="sr-only">{text}</span>,
    <MotionSpan
      animate={animate}
      aria-hidden="true"
      custom={custom}
      initial={initial}
      ref={ref}
      variants={GROUP}
    >
      {tokens.map((token, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: tokens are positional and never reorder
        <Fragment key={`${token}-${index}`}>
          <MotionSpan
            className={cn(
              "inline-block will-change-transform",
              by === "char" && token === " " && "w-[0.25em]"
            )}
            variants={tokenVariants}
          >
            {token}
          </MotionSpan>
          {by === "word" && index < tokens.length - 1 ? " " : null}
        </Fragment>
      ))}
    </MotionSpan>
  );
}

export { TextReveal };

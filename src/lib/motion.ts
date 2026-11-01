// Motion tokens + presets for motion/react (ADR 0035). CSS is the default for
// press, hover, focus, overlays, skeletons and the rise/float keyframes (see
// globals.css). Use these presets only where CSS cannot: presence (enter/exit),
// layout (reorder, shared indicators) and gestures.
//
// Render them on `m.*` components (`motion/react-m`), never the full `motion.*`:
// the app root's <MotionProvider> is `strict` and loads the engine lazily.
// It also sets reducedMotion="user", so transforms fall back to opacity-only
// when the OS asks for it.

import type { MotionProps, Transition, Variants } from "motion/react";

/* ───────── tokens ───────── */

export const duration = {
  base: 0.2,
  fast: 0.12,
  instant: 0.08,
  lazy: 0.48, // marketing only (hero, Story Card reveal)
  moderate: 0.24, // mirrors globals.css --animate-rise
  slow: 0.32,
} as const;

export const ease = {
  in: [0.4, 0, 1, 1],
  inOut: [0.65, 0, 0.35, 1],
  out: [0.2, 0.8, 0.2, 1],
} as const satisfies Record<string, [number, number, number, number]>;

export const spring = {
  /** celebrations only (sent, star burst). Never in dashboard chrome. */
  bouncy: { damping: 16, stiffness: 520, type: "spring" },
  /** toggles, press, star, thumb — anything the finger drives */
  snappy: { damping: 28, mass: 0.8, stiffness: 420, type: "spring" },
  /** layout shifts, Drawer/Sheet, shared-layout indicators */
  soft: { damping: 30, stiffness: 260, type: "spring" },
} as const satisfies Record<string, Transition>;

export const transition = {
  base: { duration: duration.base, ease: ease.out },
  exit: { duration: duration.fast, ease: ease.in }, // exits ≈ ⅔ of enters
  fast: { duration: duration.fast, ease: ease.out },
  moderate: { duration: duration.moderate, ease: ease.out },
  swap: { duration: duration.base, ease: ease.inOut },
} as const satisfies Record<string, Transition>;

/* ───────── enter / exit ───────── */

/** "1 new Anonymous Message" pill dropping in from the top of the list. */
export const pillDrop = {
  animate: { opacity: 1, transition: spring.soft, y: 0 },
  exit: { opacity: 0, transition: transition.exit, y: -12 },
  initial: { opacity: 0, y: -12 },
} satisfies MotionProps;

/* ───────── feedback ───────── */

/** Field / InputOTP error shake. Trigger with `animate={controls}` → controls.start("shake"). */
export const shake: Variants = {
  idle: { x: 0 },
  shake: {
    transition: { duration: 0.16, ease: ease.inOut },
    x: [0, -5, 5, -3, 3, 0],
  },
};

/* ───────── shared-layout ids (one source so indicators never collide) ───────── */

export const layoutIds = {
  bottomNavPill: "bottom-nav-pill",
} as const;

// Motion tokens and presets (ADR 0035, ADR 0036). Every animation in the app
// is motion/react: components in src/components/animate/ consume these, never
// hard-coded springs. All presets are module-level constants, so rendering an
// animated component allocates nothing per render.
//
// Render on `m.*` (`motion/react-m`) only: <MotionProvider> is `strict` and
// lazy-loads the engine. reducedMotion="user" drops transforms app-wide.

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
  /** dashboard press/pop: near-critical, settles under 300 ms, no visible bounce */
  calm: { damping: 42, mass: 0.6, stiffness: 620, type: "spring" },
  /** public-page reveals: unhurried, settles without overshoot */
  gentle: { damping: 26, mass: 0.9, stiffness: 140, type: "spring" },
  /** tap squash and release: very stiff, light, a hint of overshoot */
  press: { damping: 26, mass: 0.5, stiffness: 700, type: "spring" },
  /** toggles, press, star, thumb — anything the finger drives */
  snappy: { damping: 28, mass: 0.8, stiffness: 420, type: "spring" },
  /** layout shifts, Drawer/Sheet, shared-layout indicators */
  soft: { damping: 30, stiffness: 260, type: "spring" },
  /** playful public moments (chips flying, ghost wobble) */
  wobbly: { damping: 10, mass: 0.8, stiffness: 300, type: "spring" },
} as const satisfies Record<string, Transition>;

export const transition = {
  base: { duration: duration.base, ease: ease.out },
  exit: { duration: duration.fast, ease: ease.in }, // exits ≈ ⅔ of enters
  fast: { duration: duration.fast, ease: ease.out },
  moderate: { duration: duration.moderate, ease: ease.out },
  swap: { duration: duration.base, ease: ease.inOut },
} as const satisfies Record<string, Transition>;

/** Endless loops (spinner, idle float). Linear so the seam is invisible. */
export const loop = {
  float: {
    duration: 6,
    ease: "easeInOut",
    repeat: Number.POSITIVE_INFINITY,
    repeatType: "mirror",
  },
  spin: { duration: 0.8, ease: "linear", repeat: Number.POSITIVE_INFINITY },
} as const satisfies Record<string, Transition>;

/** Which spring an interaction wrapper uses: expressive public pages vs calm dashboard. */
export type MotionTone = "calm" | "expressive";

/* ───────── enter / exit ───────── */

/** "1 new Anonymous Message" pill dropping in from the top of the list. */
export const pillDrop = {
  animate: { opacity: 1, transition: spring.soft, y: 0 },
  exit: { opacity: 0, transition: transition.exit, y: -12 },
  initial: { opacity: 0, y: -12 },
} satisfies MotionProps;

/** Scroll choreography (`Reveal`): the group staggers its `RevealItem` children.
 *  `custom` is the stagger in seconds. Hiding is instant: it only happens off-screen. */
const REVEAL_STAGGER_S = 0.08;
const REVEAL_OFFSET_PX = 20;
export const revealGroup: Variants = {
  hidden: { transition: { duration: 0 } },
  show: (stagger: number | undefined) => ({
    transition: { staggerChildren: stagger ?? REVEAL_STAGGER_S },
  }),
};
export const revealItem: Variants = {
  hidden: { opacity: 0, transition: { duration: 0 }, y: REVEAL_OFFSET_PX },
  show: { opacity: 1, transition: spring.gentle, y: 0 },
};

/** Sent / verified success mark (Delight moment). */
export const celebrate = {
  animate: { opacity: 1, rotate: 0, scale: 1, transition: spring.bouncy },
  initial: { opacity: 0, rotate: -12, scale: 0.5 },
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
  filterPill: "inbox-filter-pill",
  sidebarActive: "sidebar-active",
  storyCard: (messageId: string) => `story-card-${messageId}`,
} as const;

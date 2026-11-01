# ADR 0036: The `animate/` Tier: Visual-Only Motion Wrapper Components

## Status
**Accepted** (2026-11-01). Extends [ADR 0015](0015-four-tier-components-pages-layer-and-vendor-consolidation.md) (four tiers) with a fifth directory, and supersedes the "dashboard stays quiet" parts of [ADR 0035](0035-css-first-motion-lazymotion-and-lazy-overlays.md) (R1). ADR 0035's LazyMotion setup, `m.*`-only rule, lazy overlays, device policy (R4) and budget (R3) still apply.

---

## Context

The product owner wants `motion` used to its full extent: springs with tuned damping, modern micro-interactions on every interactive part (buttons, inputs, cards, chips, nav), error shakes, heading reveals and typing effects, and choreographed page flows. ADR 0035 put motion code in `elements/effects/` and inline in patterns and blocks, so animation logic was scattered and every call site re-implemented variants.

## Decisions

| # | Decision |
| :-- | :--- |
| A1 | **A fifth directory, `src/components/animate/`, holds every motion component.** Each one is *visual only*: it takes `children`, renders them, and animates. No data, no domain terms, no side effects. |
| A2 | **Controlled by props.** Every wrapper takes an explicit trigger or state (`trigger`, `active`, `show`, `swapKey`, `value`) plus `disabled` to switch the animation off, and tuning props (`spring`, `delay`, `stagger`, `distance`). The parent decides *when*; the wrapper decides *how*. |
| A3 | **`asChild` by default for interaction wrappers** (`Press`, `Shake`, `Pop`, `Tilt`, `Magnetic`, `Spotlight`): the motion props merge onto the single child through the motion `Slot`, so wrapping adds no DOM node and never breaks layout or a11y. Layout and sequence wrappers (`Reveal`, `Stagger`, `Presence`, `Collapse`, `Swap`) render their own element (`as` prop). |
| A4 | **Import rules.** `animate/` may import only `motion/react`, `motion/react-m`, `@/lib/motion`, `@/lib/utils` and `@/hooks/use-rich-motion`. It imports **nothing** from `elements`, `patterns`, `blocks` or `pages`. In return, **every tier (elements, patterns, blocks, pages) may import `animate/`**. Biome enforces both directions. |
| A5 | **Elements embed the universal behaviours.** Button, IconButton, Toggle/chips, Input, Textarea, InputOTP, Checkbox, Switch and Card compose the matching wrapper internally (press, focus, shake, check pop) behind one `animated` prop (default `true`). Call sites never re-wrap these. Patterns, blocks and pages wrap only for composition-level choreography (reveals, staggers, presence, morphs, typing). |
| A6 | **All motion tokens live in `src/lib/motion.ts`**: spring presets (`snappy`, `soft`, `gentle`, `bouncy`, `wobbly`), durations, easings, `layoutIds`. Wrappers never hard-code a spring. |
| A7 | **Two intensities, one system.** Public pages and Delight moments use the expressive springs (visible overshoot). Dashboard chrome uses the same wrappers with near-critical damping (overshoot under ~2%, settle ≤ 300 ms): springy, never bouncy. |
| A8 | **First paint and a11y still rule.** Nothing in the server-rendered first paint is hidden by an `initial` state; the LCP headline never fades from 0. Text effects keep the full string in the DOM (screen readers and crawlers read it at once; per-letter spans are `aria-hidden`). Everything respects `reducedMotion="user"`; decorative effects (parallax, tilt, magnetic, spotlight, aurora, bursts) are Rich motion only. |
| A9 | **`elements/effects/` is retired.** Its contents (`slot`, `auto-height`, `highlight`, `particles`, `gravity-stars`, `presence-list`, `reveal`, `parallax`, `burst`, `animated-number`, `layout-indicator`) move to `animate/`. |
| A11 | **No CSS animation where motion can do it.** Keyframes (`animate-*`), `tw-animate-css` enter/exit classes, the `press`/`hover-lift` utilities and CSS-driven loaders are replaced by animate/ wrappers. **Boundary:** hover/focus *colour* changes on design tokens stay Tailwind state styling (motion cannot interpolate CSS variables without hard-coding colours), and third-party internals (Sonner's stack, Vaul's drawer physics) are left as they ship. |
| A12 | **Performance and memory rules for every wrapper.** `m.*` under one lazy `domMax` `LazyMotion`; targets, variants and transitions are module-level constants (no per-render allocation); pointer- and scroll-driven effects use motion values (no React re-render per frame); loops pause off-screen (`useInView`); only `transform`, `opacity` and `filter` animate; `Slot` caches one motion component per element type; nothing server-rendered starts hidden: first-paint text uses `settle`, route/step transitions skip the hydration render. |
| A10 | **Each wrapper ships with** `index.ts`, a `*.stories.tsx` "Motion" story with a `play()` check and a toggle for the controlling prop, and a captured frame sequence for review (ADR 0035, R5). |

## Considered options

- **Keep motion inside elements** (one motion-enabled variant per element): no new tier, but every element re-implements the same press/shake logic and patterns still need their own choreography helpers.
- **Wrappers only at call sites** (no element embeds them): purest separation, but hundreds of `<Press>` wraps around every Button and easy to forget, so coverage drifts.
- **CSS-first** (ADR 0035, M2): cheapest bundle, but springs, presence, layout and gesture choreography are not expressible.

## Consequences

- One extra `m` core per route that renders a Button (~7 kB gzipped); within ADR 0035's R3 budget of +15 kB. The full feature set (`domMax`) is one async chunk, so it never counts toward first-load JS.
- `MotionToneProvider tone="calm"` around the dashboard makes every wrapper there use near-critical springs (A7) without per-call props.
- Story tests keep `MotionGlobalConfig.skipAnimations`; assertions on entering content use `waitFor`.
- `docs/agents/component-architecture.md` gains a fifth tier and its import row; `docs/reference/animation-catalog.md` lists every wrapper and where it is used.

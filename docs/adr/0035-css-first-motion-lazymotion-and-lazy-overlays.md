# ADR 0035: CSS-First Motion, LazyMotion for Presence and Layout, Lazy Overlays and a Motion Budget

## Status
**Proposed** (2026-11-01). Becomes **Accepted** when the user confirms the round-2 specs. Extends [ADR 0022](0022-palette-theming-and-claude-design-redesign.md) (motion tokens) and relaxes one rule of [ADR 0016](0016-storybook-msw-and-story-driven-component-testing.md) / [ADR 0023](0023-shadcn-first-elements-and-profile-settings-backend.md) (default-variant parity).

---

## Context

`motion` is installed and `src/lib/motion.ts` defines tokens and about 20 presets, but only `shake` is imported. The stock Button has no press feedback and uses `transition-all`. Lists, route changes, skeleton swaps and indicators are not animated. Overlays already animate through `tw-animate-css` classes. The full `motion.*` API is imported across elements, and nothing is lazy-loaded (no `next/dynamic`), so the motion runtime and every heavy modal ship up front.

## Decisions

| # | Decision |
| :-- | :--- |
| M1 | **Personality: restrained in the dashboard, expressive at delight moments.** Dashboard motion is 120–200 ms with no bounce (hard cap 300 ms). Springs, bursts and larger transforms only on the landing hero, the sent screen and the verified mark. Idle loops stay on the hero and first-run empty state only. |
| M2 | **CSS first.** Press, hover, focus, overlays, skeleton and rise use CSS (`active:`, `transition-[...]`, keyframes, `tw-animate-css`). `motion/react` is used only for presence (enter/exit), layout (reorder, `layoutId` indicators) and gestures. |
| M3 | **`LazyMotion` + `m`.** Motion components use `m.*` under one `LazyMotion` with `domAnimation`; `domMax` is loaded only where `layoutId` is needed. Presets in `lib/motion.ts` that nothing adopts are deleted. |
| M4 | **Default-variant parity is relaxed for interaction-only motion.** A default variant may gain press/hover/focus motion that changes only `transform`, `opacity` or transition properties, never colour, size or spacing. Any other change to a default still needs explicit approval. |
| M5 | **Dashboard route transitions use the View Transitions API** (`experimental.viewTransition`), CSS-only with an instant fallback. No `template.tsx` remount. Auth keeps its in-page `stepSlide`; the landing page has none. |
| M6 | **Motion budget.** Landing first-load JS must not grow. Dashboard may grow by at most about 5 KB gzipped. Animate only `transform` and `opacity`; no `transition-all`; no `will-change` unless measured; stagger capped at 8 items. Measured with `pnpm analyze` before and after. |
| M7 | **Lazy overlays in the pages tier.** `next/dynamic` wraps the hoisted modals (Story Card, Smart Reply, Reveal, Block, Delete account, Change username), CommandPalette and ShortcutSheet, the landing carousel, and the Particles/GravityStars effects. Chunks are prefetched on hover, focus or idle. Component `index.ts` APIs do not change. |
| M8 | **Surface order:** inbox, public-profile send flow, landing, auth, settings, profile. Elements and foundation cover every screen first. |
| M9 | **Extras in scope:** circular-reveal theme toggle, count-badge pop, a small "sent" burst, and the Story Card shared-element morph. Out of scope: swipe-to-archive, pull-to-refresh. |

## Considered options

- **All `motion/react`** (Animate UI style, as today): simplest mental model, but every Button becomes a JS-driven component and the runtime ships everywhere.
- **`template.tsx` fade for routes:** remounts the tree on every navigation and adds JS; rejected for the dashboard in favour of View Transitions.

## Consequences

- Every animated element needs a Storybook "Motion" story; story tests keep `MotionGlobalConfig.skipAnimations`.
- Lazy chunks must be preloaded in story tests (see the Storybook guide, section on lazy chunks).
- Docs to update when this lands: design-system section 5, a new `docs/guides/motion.md`, `redesign-progress.md`, the component registry (`pnpm docs:registry`).

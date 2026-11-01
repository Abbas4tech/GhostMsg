# Animation Catalog

Every motion component in `src/components/animate/` and every UI part that uses one. Decisions: [ADR 0036](../adr/0036-animate-tier-motion-wrapper-components.md) (the tier) and [ADR 0035](../adr/0035-css-first-motion-lazymotion-and-lazy-overlays.md) (LazyMotion, budget, device policy). Status: **proposed**, nothing below is built until the ADR is accepted.

Legend: **Rich** = decorative, off under reduced motion, Save-Data and low-end devices. Springs refer to `lib/motion.ts` presets: `snappy` (stiff, near-critical), `soft` (layout, indicators), `gentle` (reveals), `bouncy` (celebrations), `wobbly` (playful, public only).

## 1. Wrapper components (`src/components/animate/`)

### Interaction

| Component | Controlled by | How it animates |
| :--- | :--- | :--- |
| `Press` | `disabled`, `scale` (0.96), `hoverScale` (1.02 public, 1 dashboard) | Spring tap squash (`snappy`) and release overshoot; pointer-hover lift on hover-capable devices. `asChild`. |
| `Magnetic` | `strength` (0.3), `disabled` | Child is pulled toward the cursor within its bounds, springs back on leave (`soft`). Rich. Hero CTAs. |
| `Tilt` | `max` (8°), `glare`, `disabled` | 3D perspective tilt following the pointer, optional glare sweep; springs flat on leave. Rich. |
| `Spotlight` | `size`, `disabled` | Radial highlight follows the cursor across a card surface (motion values, no re-render). Rich, desktop. |

### Feedback

| Component | Controlled by | How it animates |
| :--- | :--- | :--- |
| `Shake` | `trigger` (key or boolean), `intensity` | Horizontal spring shake (±8 → ±4 → 0) each time `trigger` changes to an error. `asChild`. |
| `Pop` | `trigger`, `scale` (1.25) | Scale up and settle with `bouncy` whenever `trigger` changes (star, badge, check, copy). `asChild`. |
| `Pulse` | `trigger`, `color` | One-shot expanding ring behind the child (attention: new message, unread). |
| `Celebrate` | `show` | Success mark: circle springs in, check path draws (`pathLength`), then a `Burst`. |
| `Burst` | `trigger`, `count`, `radius` | Radial dots fly out and fade. Rich. |
| `Swap` | `swapKey`, `direction` (`up`/`down`/`fade`) | Crossfade + slide between keyed children (`popLayout`): button labels idle → loading → done, icon swaps. |
| `NumberTicker` | `value` | Digits roll to the new value on a spring; settled value read by screen readers. |
| `Progress` | `value` | Bar or ring fills on `soft` spring with a leading glow. |

### Text

| Component | Controlled by | How it animates |
| :--- | :--- | :--- |
| `TextReveal` | `by` (`word`/`char`), `stagger`, `trigger` (`mount`/`inView`) | Words or letters rise, de-blur and fade in one after another (`gentle`). Full text stays in the DOM for a11y/SEO. |
| `TypeWriter` | `text`, `speed`, `delay`, `cursor`, `loop`, `words` (rotating) | Types characters with a blinking caret; `words` mode types, pauses, deletes and types the next. |
| `ShimmerText` | `disabled` | Light sweep across gradient text (brand words). |
| `ScrambleText` | `text`, `trigger` | Characters cycle through glyphs before settling (reveal of a handle, Verification Code success). |

### Layout and presence

| Component | Controlled by | How it animates |
| :--- | :--- | :--- |
| `Presence` / `PresenceItem` | children keys, `index` | Items rise in with capped stagger, shrink-fade out, siblings re-flow (`layout`). |
| `Stagger` / `StaggerItem` | `trigger` (`mount`/`inView`), `stagger` | Children enter in sequence on mount or first view (server-visible; armed only if off-screen). |
| `Reveal` | `as`, `stagger` | Scroll-into-view choreography (current `Reveal`, moved). |
| `Collapse` | `open` | Height auto ↔ 0 with content fade; spring `soft`. |
| `FadeSwitch` | `switchKey`, `mode` | Crossfade (and optional blur) between states: skeleton → content, tab panels, empty ↔ list. |
| `LayoutIndicator` | `layoutId` | Sliding active pill (moved). |
| `SharedElement` | `layoutId`, `disabled` | Shared-element morph between two places (message card → Story Card). |
| `PageTransition` | `direction` | Route/step enter: slide in the direction of travel with blur fade. |
| `Parallax` | `offset` | Scroll-linked depth (moved). Rich. |
| `Float` | `amplitude`, `duration`, `disabled` | Idle bob with slight rotation, paused off-screen. Hero and empty states only. |
| `Aurora` | `colors`, `disabled` | Slowly drifting gradient mesh background, paused off-screen. Rich. Landing hero. |

## 2. UI parts and how they animate

### Elements (built in, `animated` prop, default on)

| Part | Wrapper(s) | Behaviour |
| :--- | :--- | :--- |
| Button (all variants) | `Press` | Spring tap squash 0.96, release overshoot; `brand` variant also gets a hover sheen. |
| IconButton, CopyButton, ThemeToggler | `Press` + `Swap` | Deeper squash (0.9); icon swaps slide/rotate (copy → check, sun → moon). |
| Toggle / chips / segmented | `Press` + `LayoutIndicator` | Squash; active fill glides between options. |
| Input, Textarea, InputGroup | `Shake` + focus spring | Focus ring grows in on a spring; error shakes once per new error; textarea grows smoothly. |
| InputOTP | `Shake` + `Pop` | Each digit pops in; wrong code shakes the row; complete code ripples left to right. |
| Checkbox / Radio | `Pop` | Box squashes on press, check mark draws (`pathLength`) and pops. |
| Switch | spring thumb | Thumb slides on `snappy`, stretches slightly while travelling. |
| Badge (`count`) | `NumberTicker` + `Pop` | Number rolls; badge pops when it increases. |
| Card | `Press` (if clickable) | Hover lift + shadow deepen on spring; `Spotlight` on public cards. |
| Progress | `Progress` | Spring fill with leading glow. |
| Skeleton | shimmer + `FadeSwitch` | Shimmer sweep; crossfades into content. |
| Dialog / AlertDialog | spring scale | Content springs in from 0.94 with blur clear; overlay fades. |
| Drawer (Vaul) / Sheet | — | Keep Vaul's native drag + spring (already physics-based). |
| Dropdown / Popover / Select / Tooltip / HoverCard | origin-aware spring | Scale from trigger origin with a spring-shaped easing; items stagger in (menus). |
| Tabs | `LayoutIndicator` + `FadeSwitch` | Underline/pill glides; panel crossfades with slight slide. |
| Accordion | `Collapse` | Spring height; chevron rotates on spring. |
| Sonner toasts | `Swap` icon | Keep Sonner's stack physics; status icon pops in. |
| Sidebar | `LayoutIndicator` + spring width | Active item pill glides; collapse/expand springs the width. |

### Patterns, blocks and pages

| Screen part | Wrapper(s) | Behaviour |
| :--- | :--- | :--- |
| Landing hero headline | `TextReveal` (word) | Words rise and de-blur in sequence from first paint (CSS-driven start, no hidden LCP). |
| Landing hero sub-line | `TypeWriter` (`words`) | Rotating typed phrases ("compliments", "confessions", "honest feedback"). |
| Landing hero background | `Aurora` + `Parallax` | Drifting mesh; sparkles and showcase drift on scroll. Rich. |
| Hero CTA ("Claim your link") | `Press` + `Magnetic` | Magnetic pull, squash on click, submit label `Swap`. |
| How it works carousel | `Stagger` + `Swap` | Steps stagger in; slide transitions between steps; dots glide (`LayoutIndicator`). |
| Trust / Q&A / CTA sections | `Reveal` + `TextReveal` | Section items stagger in on scroll; h2 words reveal. |
| Story Card preview | `Tilt` + `Float` | Tilts with the pointer and gently floats. Rich. |
| Auth panel (sign in / up / verify) | `PageTransition` + `Stagger` | Panel slides in by direction of travel; fields stagger; field errors `Shake`; password eye `Swap`; step bar `Progress`. |
| Verify success | `Celebrate` + `ScrambleText` | Mark draws and bursts; "@handle" scrambles into place. |
| Public profile header | `TextReveal` + `Stagger` | Name reveals; status dot `Pulse` when accepting. |
| Send form | `Shake`, `NumberTicker`, `Swap` | Counter ticks and turns warning near the limit, shakes at the limit; Send button morphs Send → Sending → Sent. |
| Suggested Messages / AMA chips | `Stagger` + `Press` + `Pop` | Chips stagger in; chosen chip pops and flies its text into the textarea. |
| Sent screen | `Celebrate` + `Stagger` | Mark springs and draws, burst, copy staggers in. |
| Inbox list | `Presence` | Cards stagger in, archive/delete shrink-fade out, siblings re-flow. |
| Message card | `Press` + `Pop` + `SharedElement` | Hover lift; star `Pop`; Story Card morph. |
| New-message pill | `Presence` + `Pulse` | Drops in with spring and pulses once. |
| Filter chips / sidebar / bottom nav | `LayoutIndicator` + `NumberTicker` | Gliding active pill; rolling counts. |
| Bulk action toolbar | `Presence` | Springs up from the bottom, count `NumberTicker`, exits down. |
| Unsaved-changes bar | `Presence` | Springs up; `Shake` if you try to leave with unsaved edits. |
| Empty states / 404 ghost | `Float` + `Stagger` | Ghost floats; copy staggers in. |
| Smart Reply drafts | `TypeWriter` + `Stagger` | Drafts type themselves in as they arrive. |
| Settings accordion and rows | `Collapse` + `Press` | Spring expand; switches spring; saved state `Pop`. |
| Profile identity edit | `Collapse` + `Swap` | Summary ↔ full card morph; Copy link label `Swap`. |
| Command palette | `LayoutIndicator` + spring scale | Highlight glides between items; palette springs in. |
| Dashboard route change | `PageTransition` | Content slides/fades in by tab direction. |

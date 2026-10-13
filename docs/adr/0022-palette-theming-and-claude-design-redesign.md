# ADR 0022: Palette Theming (3 × light/dark) and the Claude Design Redesign

## Status
**Accepted** (2026-10-12). Extends the design-token section of [Chapter 5](../05-component-architecture.md) and the contrast exception of [ADR 0016](0016-storybook-msw-and-story-driven-component-testing.md) (Q17/Q18). Keeps the four tiers of [ADR 0015](0015-four-tier-components-pages-layer-and-vendor-consolidation.md) unchanged.

---

## Context & Problem Statement

GhostMsg ran on stock shadcn `stone` tokens: a near-black primary, Poppins, no brand colour. Components filled the gap with raw Tailwind colours (`pink-500/10`, `purple-600`, `yellow-400`, `red-700`, `emerald-600`, about 70 uses), so any theme change missed them. The dashboard was a 3-column `Tabs` page and the landing page a heading plus a carousel.

A Claude Design canvas ("GhostMsg — Soft spectral redesign") proposed three brand directions with full layouts for every surface. We adopt **all three directions as switchable palettes** and the canvas's **layouts** for landing, auth, dashboard, public profile and dialogs.

---

## Decisions

| # | Topic | Decision |
| :-- | :--- | :--- |
| D1 | Two axes | **Palette** (`spectral` default, `midnight`, `paper`) on `<html data-palette>`, owned by `PaletteProvider`; **mode** (light/dark) stays with `next-themes` on `.dark`. Any palette × any mode. |
| D2 | Token sets | `globals.css`: `:root`/`.dark` = Soft spectral (Claude Design's exact values); `:root[data-palette=…]` and `:root.dark[data-palette=…]` for Midnight confessional and Playful paper (derived from the canvas sketches). Selector specificity makes palette-dark beat palette-light beat spectral-dark. |
| D3 | More than colour | A palette also sets fonts (`--app-font-sans/display/message`, all loaded with `next/font`, non-default ones `preload: false`), `--radius` and shadows (`--shadow-xs/sm/soft/lift`; Paper uses hard offset shadows). Midnight renders message bodies in serif italic through `font-message`. |
| D4 | New tokens | `success`, `warning`, `info`, `sentiment-*` (`-foreground`, `-subtle`), `star`, `destructive-foreground`, `brand-foreground`, `brand-overlay`, plus `bg-brand-gradient` / `bg-brand-mist` utilities and `animate-float/rise/pulse-ring` (always `motion-safe:`). |
| D5 | No raw palette colours | Every component uses semantic tokens. Destructive surfaces use `text-destructive-foreground` instead of `text-white`, which is AA in all six themes. `@custom-variant dark` makes `dark:` follow the `.dark` class instead of the OS setting. |
| D6 | Contrast gate | `pnpm theme:contrast` parses `globals.css`, resolves each palette × mode, and checks text pairs at 4.5:1 and UI pairs (ring, input border, star, charts) at 3:1, gradients at their worst stop. |
| D7 | No flash | `PALETTE_BOOT_SCRIPT` (pure, in `src/lib/theme/palette.ts`, unit-tested) runs inline in `<head>` before paint; `<html data-palette="spectral">` is the server default. |
| D8 | Dashboard routes | Tabs become routes: `/dashboard` (Inbox), `/dashboard/profile`, `/dashboard/settings`, under `app/(dashboard)/dashboard/layout.tsx` → `pages/dashboard/DashboardLayout` (session gate, sidebar `DashboardShell`, ⌘K `CommandPalette`). `?filter=` deep-links an inbox filter. The dashboard leaves the `(app)` group, so it has no site header. |
| D9 | Inbox triage | `useInboxKeyboardController`: `j`/`k` cursor, `x` select, `s` star, `r` reply, `/` search; ignored while typing or when a dialog is open. Quarantined messages are blurred and revealed only through `RevealMessageModal` ("Keep hidden" has focus). Blocking can also delete the message. |
| D10 | Public profile states | `GET /api/public/{username}/answers` returns `isAcceptingMessages`, so `/u/[username]` shows a calm **paused** state up front; a 404 shows **not found** with "Claim /u/name". A successful send shows a reassurance card. |
| D11 | Story Card | `StoryCardModal` draws the PNG from the live palette tokens (`readStoryCardTheme` + `drawStoryCard`), with 9:16/1:1, gradient/plain, answer and link toggles, and native share when available. |
| D12 | Not built | *(Quarantine/suggestion settings, delete account and AMA "Suggest with AI" are now built: [ADR 0023](0023-shadcn-first-elements-and-profile-settings-backend.md).)* Designed but not backed by the API, so left out: archive (`e`), undo-toast deletes, quarantine/suggestion settings toggles, delete account, AMA "Suggest with AI", resending the Verification Code. |

---

## Consequences

- **New elements**: `palette-picker`, `chip`, `kbd`, `avatar`, `dropdown-menu`, `sheet`, `input-group`. **New patterns**: `brand-mark`, `claim-link-form`, `how-it-works`, `story-card-preview`, `command-palette`, `modals/reveal-message-modal`. **New blocks**: `trust-section`, `qa-showcase`, `cta-banner`, `site-footer`. **Removed**: `patterns/messages-carousel`, `blocks/settings-section`, `content/landing-messages.json`.
- Story tests run at a 1280×900 viewport so `lg:` layouts are queryable; Storybook gains a **Palette** toolbar.
- Element defaults changed only where AA required it (D5), per ADR 0016's exception.

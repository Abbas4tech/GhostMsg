# ADR 0015: Four-Tier Component Architecture: Pages Layer, Logic Isolation & Vendor Consolidation

## Status
**Accepted**. Extends [ADR 0013](0013-elements-patterns-blocks-composable-architecture.md) and [ADR 0014](0014-architectural-deepening-pure-patterns-hoisted-overlays-and-push-adapter.md). It supersedes their rules on where controllers live and on `src/components/ui` and `src/components/animate-ui`.

---

## Context & Problem Statement

After ADR 0014, business logic still lived in four different places:

1. **Block-level controllers.** `useInboxController` and `useSendMessageController` lived inside `blocks/`, so blocks could not be reused with other data.
2. **Feature folders outside the taxonomy.** `components/auth`, `components/dashboard`, `components/home` and `global-header.tsx` mixed markup with `signIn`, router calls, mutations and session reads.
3. **Logic in route files.** `app/(app)/(dashboard)/dashboard/page.tsx` and `app/u/[username]/page.tsx` contained session checks, tabs and layout markup.
4. **Two vendor trees.** `components/ui` (shadcn) and `components/animate-ui` sat beside `elements/`. Any tier could import them, which bypassed elements. There were also two identical `Button` implementations.

---

## Decision

### 1. Four tiers under `src/components/`

```
src/components/
├── elements/   Tier 1: primitives (incl. former ui/ and animate-ui/)
├── patterns/   Tier 2: pure compositions of elements
├── blocks/     Tier 3: pure page sections composing patterns
└── pages/      Tier 4: route-level components that own all logic
```

`pages/` lives under `src/components/`, not `src/pages/`. A top-level `src/pages/` folder would turn on the Next.js Pages Router and collide with `src/app/`.

### 2. All business logic lives only in `pages/`

React Query queries, mutations, `next-auth` session and sign-in/out calls, `next/navigation` routing, toasts that follow side effects, and browser adapters (`push-notification-adapter`) may be imported **only** by `pages/**`. Each page folder colocates its controller hooks (`use-*.controller.ts`).

Elements, patterns and blocks receive data and emit callbacks. Forms receive a react-hook-form `form` instance created by a page controller. Local, purely presentational UI state is still allowed, for example password visibility or the story-card theme.

### 3. `pages/` mirrors the app route groups

| Route | `app/` file (thin) | Page component |
| :--- | :--- | :--- |
| `/` | `app/page.tsx` | `pages/home/HomePage` |
| `(app)` layout | `app/(app)/layout.tsx` | `pages/layouts/site-layout/SiteLayout` |
| `/sign-in` | `app/(app)/(auth)/sign-in/page.tsx` | `pages/auth/sign-in/SignInPage` |
| `/sign-up` | `app/(app)/(auth)/sign-up/page.tsx` | `pages/auth/sign-up/SignUpPage` |
| `/verify/[username]` | `app/(app)/(auth)/verify/[username]/page.tsx` | `pages/auth/verify/VerifyPage` |
| `/dashboard` | `app/(app)/(dashboard)/dashboard/page.tsx` | `pages/dashboard/DashboardPage` |
| `/u/[username]` | `app/u/[username]/page.tsx` | `pages/public-profile/PublicProfilePage` |
| 404 | `app/not-found.tsx` | `pages/not-found/NotFoundPage` |

`app/**` files only export metadata, await `params` and render the page component. Shared auth logic (sign-in, sign-up, username availability, Google OAuth) lives in `pages/auth/use-auth-form.controller.ts`.

There is one `DashboardPage`. Its tabs are page-level components (`inbox-tab`, `profile-tab`, `settings-tab`), each wiring its own controller into a pure block. They are rendered into the `DashboardShell` block slots and code-split with `next/dynamic`. Animate's `TabsContent` only mounts the active tab, so each tab's queries run only while that tab is open.

### 4. Block catalog

`site-header`, `hero`, `auth-panel`, `verify-panel`, `dashboard-shell` (with `DashboardSkeleton` and `DashboardAccessDenied`), `inbox`, `profile-panel`, `settings-panel`, `settings-section`, `public-profile`, `not-found-panel`.

New patterns: `auth-form` (`SignInForm`, `SignUpForm`, `PasswordField`, `AuthFormFooter`), `username-field`, `verify-code-form`, `messages-carousel`, `share-link-card`, `ama-prompt-editor`.

### 5. Vendor code is consolidated into `elements/`

- **One folder per element**, with the motion primitive colocated: `button/button.primitive.tsx`, `liquid-button/`, `icon-button/`, `copy-button/`, `theme-toggler/`, `tabs/`, `alert-dialog/`. Shared motion effects (`slot`, `auto-height`, `highlight`, `particles`, `gravity-stars`) live in `elements/effects/`.
- **Former shadcn `ui/*` files** became `elements/{carousel,dialog,form,input-otp,label,skeleton,sonner,text,textarea,tooltip}/`.
- **One Button.** The duplicate animate-ui `Button` was merged into `elements/button`. Its `accent` variant was kept, so existing visuals are unchanged.
- **Accessible names.** The theme toggler and copy button got default `aria-label`s. The username and password fields now apply `FormControl` to the `<input>`, so their labels resolve. As a side effect, invalid inputs now show the same red error border as the other fields.

### 6. Enforcement (Biome `noRestrictedImports`)

| Files | Forbidden imports |
| :--- | :--- |
| everywhere | `@/components/ui/**`, `@/components/animate-ui/**` |
| `elements/**` | patterns, blocks, pages + data/logic modules |
| `patterns/**` | blocks, pages + data/logic modules |
| `blocks/**` | pages + data/logic modules |

Data/logic modules are `@tanstack/react-query`, `@/hooks/mutations/**`, `@/queries/**`, `next-auth/react`, `next/navigation`, `@/lib/push-notification-adapter` and `@/hooks/use-live-messages`.

`components.json` now sets `"ui": "@/components/elements"`.

### 7. Adding new registry components

1. Run `npx shadcn add <name>` (installs into `elements/` via the alias) or `npx shadcn add @animate-ui/<name>`.
2. Animate items install to `src/components/animate-ui/...` by default. Move the styled file to `elements/<name>/<name>.tsx` and its primitive to `elements/<name>/<name>.primitive.tsx`, put shared effects in `elements/effects/`, and fix imports.
3. Add `index.ts` and `<name>.stories.tsx`, plus `<name>.test.tsx` if the element is interactive.
4. `pnpm check` fails until nothing imports `@/components/animate-ui` or `@/components/ui`.

---

## Consequences

### Positive
- **One place for side effects.** Every query, mutation and redirect sits in a `pages/<route>/` controller.
- **Reusable blocks.** Elements, patterns and blocks are fully data-independent and render in Storybook and Vitest from mock props alone.
- **Thin routes.** `app/` only declares routing and metadata.
- **No escape hatches.** Vendor code can't be imported around the elements tier, and the lint rules keep it that way.

### Negative & Mitigations
- **Prop surface.** Blocks such as `Inbox` take grouped props (`filters`, `selection`, `bulkActions`, `cardActions`) to keep their signatures readable.
- **Manual step for animate-ui installs.** Each new animate-ui install has to be moved into `elements/` by hand (section 7). The lint rule catches forgotten moves.

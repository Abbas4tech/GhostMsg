# Chapter 5: Component Architecture & UI Design System

This chapter details GhostMsg's React 19 component hierarchy, Tailwind CSS v4 design tokens, micro-animations with Motion, and component state management based on the **Elements ➔ Patterns ➔ Blocks** architecture ([ADR 0013](file:///d:/Projects/GhostMsg/docs/adr/0013-elements-patterns-blocks-composable-architecture.md)).

---

## 1. 3-Tier Component Hierarchy (Elements ➔ Patterns ➔ Blocks)

```
src/
├── app/
│   ├── layout.tsx                   # Global Root Layout (Providers, Sonner Toaster, Font)
│   ├── page.tsx                     # Landing / Hero Page
│   ├── docs/route.ts                # Interactive Scalar API Reference UI
│   ├── (app)/
│   │   ├── (auth)/                  # /sign-in, /sign-up, /verify
│   │   └── (dashboard)/             # Authenticated Dashboard & Inbox
│   └── u/[username]/page.tsx        # Public Profile Page (AMA Banner + Form + Q&A Feed)
├── components/
│   ├── elements/                    # Tier 1: Smallest non-domain UI primitives (CVA variants & sizes)
│   │   ├── button/                  # Button, Input, Textarea, Badge, Switch, Label, Spinner
│   │   ├── input/
│   │   └── badge/
│   ├── patterns/                    # Tier 2: Multi-variant UI combinations & cards
│   │   ├── message-card/            # MessageCard, FilterBar, SentimentBadge, PromptCard
│   │   └── filter-bar/
│   └── blocks/                      # Tier 3: High-level section & page-builder blocks (Clean names)
│       ├── inbox/                   # Inbox, SettingsSection, AmaBanner, SendMessageForm
│       ├── settings-section/
│       └── ama-banner/
```

### Strict Unidirectional Dependency Rule (DAG)
Imports follow a strict top-down dependency hierarchy:
- **Blocks** can import **Patterns**, **Elements**, or sub-blocks.
- **Patterns** can import **Elements** or other **Patterns**, but **CANNOT** import **Blocks**.
- **Elements** can only import other **Elements** (or external primitives like Radix), and **CANNOT** import **Patterns** or **Blocks**.

### Colocated Module Directory Standard
Every component module contains its implementation, headless hook controller, test, story, and mock files colocated within its folder:

```
src/components/patterns/message-card/
├── index.ts                      # Barrel export
├── message-card.tsx              # Pure presentational JSX component
├── use-message-card.controller.ts# Headless hook for state & actions
├── message-card.test.tsx         # Vitest component test
├── message-card.stories.tsx      # Storybook story specification
├── message-card.mock.ts          # Predefined test & story fixtures
└── message-card.adapter.ts       # Optional prop transformer / adapter
```

---

## 2. Design System Tokens & Tailwind CSS v4

GhostMsg uses Tailwind CSS v4 with custom CSS variable tokens defined in [`src/app/globals.css`](file:///d:/Projects/GhostMsg/src/app/globals.css):

### Color Palette & Theme Tokens
- **Background & Foreground**: Dynamic HSL tokens for light/dark mode adaptation.
- **Primary / Accent**: Purple & Ghost vibrant hues for branding.
- **Typography**: Google Font **Poppins** loaded via `next/font/google` in [`src/app/layout.tsx`](file:///d:/Projects/GhostMsg/src/app/layout.tsx#L9-L13).
- **Theme Provider**: [`next-themes`](file:///d:/Projects/GhostMsg/src/context/theme-provider.tsx) supporting system, light, and dark modes with zero flash.

---

## 3. UI Primitives & Animation Library

| Category | Component / Library | Purpose |
| :--- | :--- | :--- |
| **Primitives** | [Radix UI](https://www.radix-ui.com/) + [Shadcn UI](https://ui.shadcn.com/) | Accessible dialogs, tooltips, cards, dropdowns, labels. |
| **Story Card Canvas** | [html-to-image](https://github.com/bubkoo/html-to-image) | High-resolution 9:16 PNG export with theme gradients for social stories. |
| **Carousel** | [Embla Carousel React](https://www.embla-carousel.com/) | Smooth animated carousel for message testimonials on the landing page. |
| **OTP Input** | [Input OTP](https://input-otp.rodz.dev/) | 6-digit slotted verification code input with digit masking. |
| **Animations** | [Motion](https://motion.dev/) | Smooth entrance animations, layout transitions, and hover states. |
| **Notifications** | [Sonner](https://sonner.emilkowal.ski/) | Rich stacked toast notifications for mutation feedback and errors. |
| **Icons** | [Lucide React](https://lucide.dev/) | Crisp, consistent SVG icons across all views. |

---

## 4. State Management, Form Lifecycle & Render Boundaries

- **Component Segregation**: Heavy pages mixing independent async workflows are segregated into focused subcomponents (e.g. `SendMessageForm`, `SuggestedMessagesSection`, `PublicQAFeed`, `MessageCard`, `StoryCardModal`) to isolate render boundaries. See [API & React Query Architecture Blueprint](file:///d:/Projects/GhostMsg/docs/api-and-react-query-architecture.md#5-layer-4-component-segregation--render-boundary-isolation).
- **Form Validation**: `react-hook-form` paired with `@hookform/resolvers/zod` for zero-lag client-side validation bound directly to `mutation.isPending`.
- **Deterministic Optimistic Updates**: Standardized on TanStack Query `onMutate` cache updates with context rollback in `onError` as specified in [ADR 0006](file:///d:/Projects/GhostMsg/docs/adr/0006-standardized-api-calling-and-react-query-architecture.md).
- **Isolated Debounced Validation**: `useDebounceValue` coupled with cached `useQuery` in atomic field components (e.g. `UsernameField`) prevents whole-form re-rendering during keystrokes.
- **Client-Side Story Card Engine**: `StoryCardModal` mounts an isolated offscreen/preview canvas node with CSS theme variables to generate PNG blobs without server roundtrips.

---

## 5. Implemented Component Registry Log

- **Tier 1 Elements**:
  - `src/components/elements/button/`: Animated Button with 8 CVA variants and sizes, colocated test, stories, and mock fixtures.
  - `src/components/elements/input/`: Input primitive with `default`, `filled`, `glass` variants and `sm`/`md`/`lg` sizes.
- **Tier 2 Patterns**:
  - `src/components/patterns/sentiment-badge/`: Sentiment tag badge for `sweet`, `curious`, `spicy`, `advice`, `neutral` tones with icons and color tokens.
- **Tier 3 Blocks**:
  - `src/components/blocks/settings-section/`: Reusable page-builder settings section block with title, description, control slot, and action button slot.

---

## 6. Next Chapter
Proceed to [Chapter 6: Developer Workflow](file:///d:/Projects/GhostMsg/docs/06-dev-workflow.md).


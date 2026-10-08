# Chapter 5: Component Architecture & UI Design System

This chapter details GhostMsg's React 19 component hierarchy, Tailwind CSS v4 design tokens, micro-animations with Motion, and component state management.

---

## 1. Component Hierarchy & Layout Structure

```
src/
├── app/
│   ├── layout.tsx                   # Global Root Layout (Providers, Sonner Toaster, Font)
│   ├── page.tsx                     # Landing / Hero Page
│   ├── docs/route.ts                # Interactive Scalar API Reference UI
│   ├── (app)/
│   │   ├── (auth)/
│   │   │   ├── sign-in/page.tsx     # Sign-In View
│   │   │   ├── sign-up/page.tsx     # Sign-Up View
│   │   │   └── verify/[username]/   # Verification Code OTP View
│   │   └── (dashboard)/
│   │       └── dashboard/page.tsx   # Authenticated Dashboard & Inbox
│   └── u/[username]/page.tsx        # Public Profile Page (AMA Banner + Form + Q&A Feed)
├── components/
│   ├── profile/
│   │   ├── send-message-form.tsx    # Anonymous Message submission form with AMA Banner
│   │   ├── suggested-messages-section.tsx # Gemini prompt ideas generator
│   │   └── public-qa-feed.tsx       # Public answered Q&A showcase masonry feed
│   ├── dashboard/
│   │   ├── message-tab.tsx          # Real-time message list with live SSE & pagination
│   │   ├── message-card.tsx         # Message card with sentiment badge & action buttons
│   │   ├── message-filter-bar.tsx   # Search input & filter chips (All/Unread/Starred/Quarantined)
│   │   ├── bulk-action-toolbar.tsx  # Floating multi-select actions & export modal
│   │   ├── smart-reply-modal.tsx    # Multi-tone Gemini AI smart reply assistant
│   │   ├── story-card-modal.tsx     # 9:16 HTML-to-Image Instagram/Snapchat card designer
│   │   ├── profile-tab.tsx          # Shareable link & AMA Banner settings
│   │   └── settings-tab.tsx         # Message acceptance & notification preferences
│   └── ui/                          # Radix / Shadcn primitives & custom design components
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

## 5. Next Chapter
Proceed to [Chapter 6: Developer Workflow](file:///d:/Projects/GhostMsg/docs/06-dev-workflow.md).


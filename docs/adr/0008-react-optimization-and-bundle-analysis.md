# ADR 0008: React Optimization & Dynamic Bundle Analysis Architecture

## Status
**Accepted**

---

## Context & Problem Statement

As GhostMsg scaled its UI features (interactive animated cards, real-time message mutations, dialog modals, embla carousels, and multi-tab dashboards), several frontend performance and rendering optimizations were needed:

1. **Dashboard Message Grid Render Waste**:
   Mutating or refreshing message collections previously caused all `MessageCard` instances in the grid to re-render, even if only one card changed or when parent state updated.
2. **Landing Page Client Payload Bloat**:
   The landing page (`src/app/page.tsx`) was marked `"use client"` solely because of the interactive auto-playing Embla carousel. As a result, static hero copy, typography, and page layout elements were being shipped and evaluated as client-side JavaScript.
3. **Bundle Size Visibility & Diagnostics**:
   There was no automated toolchain to inspect client vs. server chunk footprints, detect duplicate dependencies, or measure tree-shaking efficacy during production builds.

---

## Decision Drivers

1. **Deterministic Re-rendering Prevention**: Ensure lists and cards only re-evaluate when their unique entity state changes.
2. **Maximum Server-Side Rendering (SSR)**: Keep top-level routes as React Server Components (RSC) and isolate client interactivity strictly to leaf "islands".
3. **Actionable Bundle Diagnostics**: Provide a standard, cross-platform build command to inspect Webpack/Next.js chunk allocations.

---

## The Decision

### 1. Fine-Grained Component & Hook Memoization
- Wrapped [`MessageCard`](file:///d:/Projects/GhostMsg/src/components/dashboard/message-card.tsx) with `React.memo` and explicit `displayName`.
- Memoized mutation triggers (`deleteMessage`) and extracted arrays (`messages`) inside [`useDashboard`](file:///d:/Projects/GhostMsg/src/hooks/use-dashboard.tsx) using `useCallback` and `useMemo`.

### 2. Server Component Extraction for Landing Page
- Extracted Embla carousel interactivity to [`MessagesCarousel`](file:///d:/Projects/GhostMsg/src/components/home/messages-carousel.tsx) (`"use client"`).
- Converted [`src/app/page.tsx`](file:///d:/Projects/GhostMsg/src/app/page.tsx) into a pure React Server Component, removing `"use client"` from the page root and eliminating static hero text from the client JS bundle.

### 3. Code Splitting Secondary Dashboard Tabs
- Maintained on-demand dynamic imports (`next/dynamic`) for secondary tabs (`ProfileTab`, `SettingsTab`) to keep initial dashboard execution fast.

### 4. Automated Bundle Analysis Toolchain
- Installed `@next/bundle-analyzer` and `cross-env` under `devDependencies`.
- Wrapped Next.js config in [`next.config.ts`](file:///d:/Projects/GhostMsg/next.config.ts) with `withBundleAnalyzer({ enabled: process.env.ANALYZE === "true" })`.
- Added `"analyze": "cross-env ANALYZE=true next build"` to [`package.json`](file:///d:/Projects/GhostMsg/package.json).

---

## Consequences

### Positive
- **Zero-Waste Re-renders**: Deleting or refreshing a single message in the dashboard avoids re-rendering unaffected message cards.
- **Lighter Landing Page JS**: Static DOM elements are streamed directly as HTML without client React hydration overhead.
- **Cross-Platform Diagnostic Scripts**: Developers on Windows, Linux, and macOS can run `pnpm run analyze` without environment variable syntax discrepancies.

### Negative & Mitigations
- Bundle analyzer HTML reports are generated locally in `.next/analyze/` and should remain git-ignored (standard in `.gitignore`).

---

## References & Code Pointers
- Server Page: [`src/app/page.tsx`](file:///d:/Projects/GhostMsg/src/app/page.tsx)
- Client Carousel: [`src/components/home/messages-carousel.tsx`](file:///d:/Projects/GhostMsg/src/components/home/messages-carousel.tsx)
- Memoized Card: [`src/components/dashboard/message-card.tsx`](file:///d:/Projects/GhostMsg/src/components/dashboard/message-card.tsx)
- Memoized Hook: [`src/hooks/use-dashboard.tsx`](file:///d:/Projects/GhostMsg/src/hooks/use-dashboard.tsx)
- Next Config: [`next.config.ts`](file:///d:/Projects/GhostMsg/next.config.ts)
- Documentation Index: [`docs/README.md`](file:///d:/Projects/GhostMsg/docs/README.md)

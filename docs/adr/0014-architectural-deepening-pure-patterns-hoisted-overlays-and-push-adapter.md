# ADR 0014: Architectural Deepening: Pure Patterns, Hoisted Overlays, Web Push Adapter, and Elements Consolidation

## Status
**Accepted**

> **Update (2026-10-12):** **Extended by [ADR 0015](0015-four-tier-components-pages-layer-and-vendor-consolidation.md).** Controllers such as `useInboxController` moved from `blocks/` to `src/components/pages/dashboard/`. Hoisted modals are rendered by the page-level `inbox-tab.tsx`.

---

## Context & Problem Statement

Following the initial component taxonomy defined in [ADR 0013](0013-elements-patterns-blocks-composable-architecture.md), an architectural review identified critical structural friction across several core subsystems in GhostMsg:

1. **Leaky Inbox Seams & DOM Duplication**:
   - `MessageCard` (`src/components/dashboard/message-card.tsx`) acted as a monolithic module combining presentation, 4 independent mutation hooks (`useBlockSenderMutation`, `useUnblockSenderMutation`, `useDeleteMessageMutation`, `useUpdateMessageMutation`), and inline `AlertDialog` overlays.
   - Mounting 50 messages produced 100 duplicate modal overlays in the React DOM and mounted dozens of mutation listeners simultaneously.
   - Parent `MessageTab` simultaneously handled message selection, filter states, and external modals (`SmartReplyModal`, `StoryCardModal`), fracturing state management across multiple layers.

2. **Monolithic Settings & Browser API Leakage**:
   - `SettingsTab` (`src/components/dashboard/settings-tab.tsx`) mingled browser Web Push service worker registration, VAPID key buffer parsing, message acceptance queries/mutations, and sender hash blocklist tables within 350+ lines of raw inline JSX `<Card>` markup.
   - Low leverage: `blocks/settings-section/` existed as a reusable block but was bypassed by raw JSX.
   - Low testability: Browser globals (`navigator.serviceWorker`, `PushManager`, `Notification`) leaked directly into the React component body without an adapter seam.

3. **Scattered Public Profile State & Duplicated Domain Badges**:
   - `SendMessageForm` and `SuggestedMessagesSection` on `/u/[username]` coordinated through indirect string prop passing via parent state.
   - `PublicQAFeed` and `MessageCard` maintained duplicated `SENTIMENT_BADGES` lookup dictionaries instead of reusing the Tier-2 `SentimentBadge` pattern.

4. **Split Seams across Dual UI Primitives**:
   - Parallel existence of `src/components/ui/` and `src/components/elements/` created ambiguity, duplicated wrapper implementations, and conflicting TypeScript interface extensions (e.g. `SettingsSectionProps` conflicting with `HTMLAttributes.title`, and `ButtonProps` `asChild` union conflicts in Storybook stories).

---

## Decision Drivers

1. **SOLID & Single Responsibility**: Presentational components must be 100% pure functions accepting props and emitting callbacks; state, mutations, and browser APIs must reside in dedicated controllers and adapters.
2. **High Locality & Leverage**: Hide complex implementation details behind small, high-leverage interfaces. Fix bugs in one place, test once through the interface.
3. **Strict DOM Efficiency**: Centralize and hoist modal overlays to the container block level; guarantee 0 duplicate modal instances rendered inside loops.
4. **Ports & Adapters Architecture**: Isolate external browser infrastructure (Web Push, ServiceWorker) behind a testable adapter seam.
5. **Zero Type Errors & Standardized Design Tokens**: Consolidate atomic primitives into `src/components/elements/` with Class Variance Authority (CVA) variant typings.

---

## The Decisions

### 1. Hoisted Dialog Overlays & Pure `MessageCard` Pattern (Candidate 1)

- **Pure Presentational Pattern (`src/components/patterns/message-card/`)**:
  - `MessageCard` is refactored into a pure component with zero React Query mutation hooks and zero inline modal dialogs.
  - Receives `message`, selection state, and action callbacks (`onToggleSelect`, `onStar`, `onReply`, `onStoryCard`, `onBlock`, `onDelete`).
- **Centralized Modal Overlays (`src/components/patterns/modals/`)**:
  - Extracted reusable modal patterns: `BlockSenderModal`, `DeleteMessageModal`, `SmartReplyModal`, `StoryCardModal`.
- **Headless `useInboxController` (`src/components/blocks/inbox/`)**:
  - Encapsulates message list query fetching, real-time SSE listener (`useLiveMessages`), filter states (`all`, `unread`, `starred`, `quarantined`, `answered`), bulk actions, and active modal state (`activeModal: 'block' | 'delete' | 'reply' | 'story' | null`, `activeMessage: Message | null`).
  - Single hoisted modal container rendered at the Inbox block level (1 instance in DOM regardless of message count).

```
┌───────────────────────────────────────────────────────────┐
│ Inbox Block (Deep Module)                                 │
│ ┌───────────────────────────────────────────────────────┐ │
│ │ useInboxController (Headless State & Mutation Seam)   │ │
│ └───────────────────────────────────────────────────────┘ │
│   │                                                       │
│   ├──▶ Single Hoisted Modals (Block, Delete, Reply, Story) │
│   │                                                       │
│   └──▶ MessageList ──▶ Pure MessageCard Pattern (× N)     │
└───────────────────────────────────────────────────────────┘
```

---

### 2. Dedicated Web Push Notification Adapter & Settings Composition (Candidate 2)

- **Push Notification Adapter (`src/lib/push-notification-adapter.ts`)**:
  - Encapsulates `PushManager` subscription lifecycle, service worker registration (`/sw.js`), VAPID key conversion (`urlBase64ToUint8Array`), and permission queries behind a clean interface:
    ```typescript
    export interface PushNotificationAdapter {
      isSupported: boolean;
      permission: NotificationPermission | "unsupported";
      subscribe: () => Promise<PushSubscription | null>;
      unsubscribe: () => Promise<void>;
    }
    ```
- **Composable Settings View (`src/components/dashboard/settings-tab.tsx`)**:
  - Composes rows using `SettingsSection` blocks (`blocks/settings-section/`) with clean variant slots for Message Acceptance, Web Push Notifications, and Blocked Senders.

---

### 3. Unified Public Profile Interaction Module (Candidate 3)

- **Public Profile Interaction Block (`src/components/blocks/public-profile/`)**:
  - Unifies prompt suggestions and message submission under a cohesive module powered by `useSendMessageController`.
  - Selecting a suggested message prompt updates form state directly within the controller, eliminating string callback prop-drilling through the page.
- **Shared `SentimentBadge` Pattern Reuse**:
  - Standardize sentiment tag rendering in `PublicQAFeed` and `MessageCard` using `src/components/patterns/sentiment-badge/`.

---

### 4. Consolidated Tier-1 Elements & TypeScript Fixes (Candidate 4)

- **Elements Directory (`src/components/elements/`)**:
  - Consolidate atomic primitives (`Button`, `Input`, `Badge`, `Switch`, `Card`, `Label`, `Dialog`, `Tooltip`, `Textarea`, `Skeleton`) into `src/components/elements/`.
  - Fix `SettingsSectionProps` by properly omitting conflicting DOM attributes (`Omit<HTMLAttributes<HTMLDivElement>, "title">`).
  - Fix `ButtonProps` typing to cleanly support `asChild` and polymorphic children in Storybook stories.
  - Phase out redundant legacy wrappers in `src/components/ui/`.

---

### 5. Bottom-Up Phased Refactoring Execution Order

Refactoring proceeds strictly in bottom-up dependency order:
1. **Phase 1**: Tier 1 Elements & Primitive Consolidation (Type safety, CVA tokens, Storybook stories).
2. **Phase 2**: Tier 2 Patterns (`MessageCard`, `SentimentBadge`, `Modals`, `FilterBar`).
3. **Phase 3**: Tier 3 Blocks & Adapters (`PushNotificationAdapter`, `InboxBlock`, `SettingsSection`, `PublicProfileFeed`).
4. **Phase 4**: Verification & Regression Testing (`pnpm tsc --noEmit` and `pnpm test:run`).

---

## Consequences

### Positive
- **0 Redundant DOM Nodes**: Hoisting modal overlays eliminates up to 200 unused DOM nodes per 100 messages.
- **Locality for Mutations**: Message mutations, deletions, and blocks concentrate in `useInboxController`.
- **Infrastructure Isolation**: Browser service worker and push notification APIs are isolated behind an adapter seam, making them mockable in tests without browser dependencies.
- **Single Source of Truth for Design Tokens**: `src/components/elements/` provides unified, CVA-typed primitives for the entire application.
- **Pure Component Testability**: Presentational cards and blocks can be unit tested purely via mock props in Vitest and rendered reliably in Storybook.

### Negative & Mitigations
- **Refactoring Scope**: Multi-file restructuring across components and dashboard tabs.
  - *Mitigation*: Executed in phased bottom-up order with continuous TypeScript compiler (`pnpm tsc`) and Vitest verification gates.

---

## Implementation Notes (2026-10-11): UI Parity Restoration

The first pass of this refactor changed visuals along with structure. The follow-up pass restored the pre-refactor UI exactly while keeping the new architecture:

- **Elements parity**: `elements/card`, `elements/switch` and `elements/input` defaults now match the original shadcn classes (border/shadow tokens, no forced `text-sm`, `CardAction`, original `CardFooter`, dark-mode switch thumb). `ui/card`, `ui/input` and `ui/switch` were deleted and all callers migrated.
- **Inbox**: restored the single-card layout ("Your Messages" + total count, 2-column grid, tooltip view toggle, `LiquidButton` Refresh with toast, filter bar only when messages exist, original empty states). `MessageCard` is back on `Card`/`CardHeader`/`CardContent` with the original badges and footer.
- **Purity completed**: `SmartReplyModal` (now driven by `useSmartReplyController`) and `BulkActionToolbar` (moved from `dashboard/` to `patterns/`, mutation lifted into `useInboxController`) no longer run mutations themselves. Modal openers are stable callbacks, so memoized cards stay memoized. `activeMessage` is retained on close so dialogs animate out with their content.
- **Settings**: back to header cards with the bordered "Accept Messages" / "Web Push Notifications" rows, composed with the new `SettingsSection` `row` variant. All data/mutations live in `useSettingsController`.
- **Public profile (Candidate 3 delivered)**: `blocks/public-profile/` composes the pure `AmaBanner`, `SendMessageForm`, `SuggestedMessages` and `PublicQaFeed` patterns. `useSendMessageController` owns the form, so picking a suggestion calls `form.setValue` directly. `SentimentBadge` is the single source for sentiment styling (original colors, icons and the "Note" label).
- **Legacy removal**: deleted `dashboard/{message-card,message-filter-bar,smart-reply-modal,story-card-modal,bulk-action-toolbar}.tsx`, `components/profile/*`, the unused tier-level barrels (`elements/index.ts`, `patterns/index.ts`, `blocks/index.ts`), and ported their tests to colocated files.

---

## References & Code Pointers
- Architectural Review Report: `file:///C:/Users/Abbas/AppData/Local/Temp/architecture-review-20261010-005400.html`
- Component Architecture Guide: [`docs/05-component-architecture.md`](../05-component-architecture.md)
- Foundational Taxonomy: [`docs/adr/0013-elements-patterns-blocks-composable-architecture.md`](0013-elements-patterns-blocks-composable-architecture.md)
- Codebase Design Principles: [`.agents/skills/codebase-design/SKILL.md`](../../.agents/skills/codebase-design/SKILL.md)

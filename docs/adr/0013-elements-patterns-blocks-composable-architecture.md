# ADR 0013: Elements-Patterns-Blocks Composable Component Architecture & Colocated Tooling

## Status
**Accepted**

---

## Context & Problem Statement
As GhostMsg grew, the `src/components/` directory suffered from three major architectural bottlenecks:

1. **Cluttered Organization**: Components were grouped by top-level page tabs (`dashboard/`, `profile/`) rather than composable domain boundaries or structural scale.
2. **Monolithic Responsibility & Inline DOM Overlays**: Cards like `MessageCard` combined card layout, sentiment badges, action buttons, and nested `<Dialog>` overlays for blocking and deleting. Mounting 50 cards in an inbox resulted in 100 duplicate dialog overlays rendered in the React DOM.
3. **Scattered Test & Mock Artifacts**: Test files (`__tests__/`) and mock data were separated from component implementation code, making future Storybook onboarding and component-driven development cumbersome.

---

## Decision Drivers
1. **Composable Hierarchy**: Clear 3-tier categorization separating domain-agnostic primitives, multi-variant design patterns, and high-level page/section blocks.
2. **Single Responsibility & Headless State**: Business logic (React Query mutations, dialog triggers, form validation) separated from presentational JSX via custom headless controller hooks (`use...Controller`).
3. **Colocated Component Modules**: Colocate tests (`.test.tsx`), Storybook stories (`.stories.tsx`), mock data (`.mock.ts`), and optional prop transformers (`.adapter.ts`) within each component's directory.
4. **DOM Efficiency**: Centralize dialog overlays at the container/page block level instead of rendering duplicates inside array iterations.

---

## The Decisions

### 1. 3-Tier Architecture Taxonomy: Elements ➔ Patterns ➔ Blocks

```
src/components/
├── elements/                 # Tier 1: Smallest non-domain UI primitives
│   ├── button/               # (Button, Input, Badge, Switch, Label, Spinner)
│   └── input/
├── patterns/                 # Tier 2: Multi-variant UI combinations & cards
│   ├── message-card/         # (MessageCard, FilterBar, SentimentBadge, Toolbar)
│   └── filter-bar/
└── blocks/                   # Tier 3: High-level section & page-builder blocks
    ├── inbox-block/          # (SettingsSectionBlock, InboxListBlock, AmaBannerBlock)
    ├── settings-block/
    └── profile-block/
```

- **Elements (`src/components/elements/`)**: Atomic, domain-agnostic UI primitives (Buttons, Inputs, Badges, Switches, Tooltips, Slotted OTP Inputs).
- **Patterns (`src/components/patterns/`)**: Composable combinations of elements with multi-variant layouts (e.g. `MessageCard`, `MessageFilterBar`, `BulkActionToolbar`, `SentimentTagBadge`).
- **Blocks (`src/components/blocks/`)**: High-level composable section blocks with defined slots for titles, descriptions, controls, and action triggers (e.g., `SettingsSectionBlock`, `InboxBlock`, `AmaBannerBlock`, `PublicQaBlock`).

---

### 2. Colocated Component Directory Layout

Every component module resides in its own folder containing its implementation, test, mock, adapter, and story files:

```
src/components/patterns/message-card/
├── index.ts                      # Barrel export
├── message-card.tsx              # Pure presentational component
├── use-message-card.controller.ts# Headless hook for state & actions
├── message-card.test.tsx         # Vitest component test
├── message-card.stories.tsx      # Storybook story specification
├── message-card.mock.ts          # Predefined test & story fixtures
└── message-card.adapter.ts       # Optional prop transformer / adapter
```

---

### 3. Headless Controller Hook Pattern

Presentational components remain pure functions focused on layout and props. All side effects, mutations, and local state are extracted into headless hooks:

```tsx
// Example: src/components/patterns/message-card/message-card.tsx
export const MessageCard = ({ message, onReply, onSelect, isSelected }: MessageCardProps) => {
  return (
    <Card className="...">
      <CardHeader>...</CardHeader>
      <CardContent>{message.content}</CardContent>
      <CardActions onReply={() => onReply(message)} />
    </Card>
  );
};
```

---

### 4. Centralized Dialog Overlay Management

Overlays (e.g. `BlockSenderModal`, `DeleteMessageModal`, `SmartReplyModal`, `StoryCardModal`) are unmounted from list item iterations and centralized at the container / block level:

```tsx
// Container block level (src/components/blocks/inbox-block/inbox-block.tsx)
const { activeMessage, activeModal, closeModal } = useInboxModalController();

return (
  <>
    <MessageList messages={messages} onBlockMessage={openBlockModal} />
    {activeModal === 'block' && (
      <BlockSenderModal message={activeMessage} onClose={closeModal} />
    )}
  </>
);
```

---

## Consequences

### Positive
- **High Reuse & Scalability**: Clear taxonomy prevents duplicated UI code and standardizes design tokens across all views.
- **Future-Proof Storybook Integration**: Colocated `.stories.tsx` and `.mock.ts` files make onboarding Storybook seamless.
- **Sub-Millisecond DOM Rendering**: Eliminates dozens of hidden modal DOM nodes inside message list loops.
- **Single Responsibility**: Visual design changes never risk breaking mutation logic, and vice versa.

### Negative & Mitigations
- **Refactoring Scope**: Requires organizing existing files in `src/components/dashboard` and `src/components/profile` into the new taxonomy. Mitigated by executing refactoring phase by phase with automated regression testing (`pnpm test`).

---

## References & Code Pointers
- Engineering Docs: [`docs/05-component-architecture.md`](file:///d:/Projects/GhostMsg/docs/05-component-architecture.md)
- Testing Strategy: [`docs/07-testing-strategy.md`](file:///d:/Projects/GhostMsg/docs/07-testing-strategy.md)

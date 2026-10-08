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
│   ├── input/
│   └── card/
├── patterns/                 # Tier 2: Multi-variant UI combinations & cards
│   ├── message-card/         # (MessageCard, FilterBar, SentimentBadge, PromptCard)
│   ├── filter-bar/
│   └── modals/               # (BlockSenderModal, SmartReplyModal, StoryCardModal)
└── blocks/                   # Tier 3: High-level section & page-builder blocks
    ├── inbox/                # (Inbox, SettingsSection, AmaBanner, SendMessageForm)
    ├── settings-section/
    └── ama-banner/
```

- **Elements (`src/components/elements/`)**: Atomic, domain-agnostic UI primitives with `cva` variant and size props (`variant: 'default' | 'primary' | 'secondary' | 'ghost' | 'glass'`, `size: 'sm' | 'md' | 'lg'`).
- **Patterns (`src/components/patterns/`)**: Composable combinations of elements with multi-variant layouts (e.g., `MessageCard`, `MessageFilterBar`, `BulkActionToolbar`, `SentimentBadge`, `PromptCard`, `QaCard`). Decoupled from hardcoded data/actions.
- **Blocks (`src/components/blocks/`)**: High-level page-builder section blocks with title, description, control slot, and custom action button compositions (e.g., `Inbox`, `SettingsSection`, `AmaBanner`, `SendMessageForm`, `PublicQaFeed`). Component names are clean and domain-focused (no `-block` suffix).

---

### 2. Decoupled Presentational Contracts & Multi-Variant Composability

To ensure maximum reusability across different pages and future Storybook cataloging:
1. **Zero Hardcoded Data / Side-Effects**: Components in `elements`, `patterns`, and `blocks` MUST NOT directly invoke network calls, global data stores, or fixed hooks. They accept generic data payloads and action callbacks (`data`, `actions`, `slots`, `onAction`).
2. **Class Variance Authority (CVA) Variants & Sizes**: Components support multi-variant styles (`primary`, `secondary`, `glass`, `ghost`) and sizes (`sm`, `md`, `lg`) so they can adapt to multiple UI contexts seamlessly.

---

### 3. Strict Unidirectional Dependency Rule (DAG)

To maintain strict modular decoupling, component imports **MUST** follow a strict downward hierarchy:

```
Blocks  ──(can import)──▶  Patterns  ──(can import)──▶  Elements
  │                                                        ▲
  └─────────────────────(can import)───────────────────────┘
```

1. **Blocks** can import **Patterns**, **Elements**, or lower-level sub-blocks.
2. **Patterns** can import **Elements** or other **Patterns**, but **CANNOT** import from **Blocks**.
3. **Elements** can only import from other **Elements** (or external UI primitives like Radix), and **CANNOT** import from **Patterns** or **Blocks**.

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

## Implemented Component Registry Log

The following component modules have been migrated and implemented with colocated test, story, mock, and adapter files adhering to the DAG dependency hierarchy:

### Tier 1: Elements (`src/components/elements/`)
- **`elements/button/`**:
  - `button.tsx`: Animated Button primitive supporting `cva` variants (`default`, `primary`, `secondary`, `destructive`, `outline`, `ghost`, `glass`, `link`) and sizes (`sm`, `md`, `lg`, `icon`, `icon-sm`, `icon-lg`).
  - `button.test.tsx`: Vitest component tests verifying rendering, click handlers, and variant class application.
  - `button.stories.tsx`: Storybook stories for all 8 button variants.
  - `button.mock.ts`: Mock fixture configurations (`defaultButtonMockProps`, `primaryButtonMockProps`, `glassButtonMockProps`).
  - `index.ts`: Barrel export for `Button`, `buttonVariants`, and types.

- **`elements/input/`**:
  - `input.tsx`: Form input primitive supporting `cva` variants (`default`, `filled`, `glass`) and size variants (`sm`, `md`, `lg`).
  - `input.test.tsx`: Vitest component tests verifying placeholder rendering and keystroke event triggers.
  - `input.stories.tsx`: Storybook stories for Default and Glass input variants.
  - `input.mock.ts`: Mock fixture configurations (`defaultInputMockProps`, `glassInputMockProps`).
  - `index.ts`: Barrel export for `Input`, `inputVariants`, and types.

### Tier 2: Patterns (`src/components/patterns/`)
- **`patterns/sentiment-badge/`**:
  - `sentiment-badge.tsx`: Domain sentiment tag badge supporting `cva` sentiment variants (`sweet`, `curious`, `spicy`, `advice`, `neutral`) and sizes (`sm`, `md`).
  - `sentiment-badge.test.tsx`: Vitest tests for sentiment label text and dynamic color classes.
  - `sentiment-badge.stories.tsx`: Storybook stories for Sweet, Spicy, and Advice sentiment badges.
  - `sentiment-badge.mock.ts`: Predefined mock fixtures (`sweetBadgeMockProps`, `spicyBadgeMockProps`).
  - `index.ts`: Barrel export for `SentimentBadge` and types.

### Tier 3: Blocks (`src/components/blocks/`)
- **`blocks/settings-section/`**:
  - `settings-section.tsx`: Page-builder settings row section block supporting variants (`card`, `grouped`, `minimal`) and sizes (`sm`, `md`, `lg`). Decoupled presentational slots: `title`, `description`, `icon`, `controlSlot`, `actionButtonSlot`.
  - `settings-section.test.tsx`: Vitest component tests for presentational slot composition.
  - `settings-section.mock.ts`: Mock fixtures (`defaultSettingsSectionMockProps`).
  - `index.ts`: Barrel export for `SettingsSection` and types.

---

## References & Code Pointers
- Engineering Docs: [`docs/05-component-architecture.md`](file:///d:/Projects/GhostMsg/docs/05-component-architecture.md)
- Testing Strategy: [`docs/07-testing-strategy.md`](file:///d:/Projects/GhostMsg/docs/07-testing-strategy.md)

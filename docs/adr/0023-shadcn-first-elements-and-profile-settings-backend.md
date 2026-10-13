# ADR 0023: shadcn-First Elements and the Profile & Settings Backend

## Status
**Accepted** (2026-10-14). Builds on [ADR 0022](0022-palette-theming-and-claude-design-redesign.md) and replaces its D12 "Not built" list for quarantine and suggestion settings, delete account and AMA "Suggest with AI". Keeps the four tiers of [ADR 0015](0015-four-tier-components-pages-layer-and-vendor-consolidation.md) and the story-test gate of [ADR 0016](0016-storybook-msw-and-story-driven-component-testing.md).

---

## Context & Problem Statement

The updated Claude Design canvas adds design tokens, CVA component specs, motion and trust & safety rules, and redesigned **Profile** and **Settings** pages. Its annotations name shadcn components ("Card · Switch", "ToggleGroup", "Sidebar"…).

ADR 0022 built several of these by hand: a custom sidebar, chips, a command list, empty states and segmented buttons. Those copies drift from shadcn's accessibility and behaviour. Many Profile and Settings controls also had no API behind them.

---

## Decisions

| # | Topic | Decision |
| :-- | :--- | :--- |
| D1 | shadcn first | Structure comes from shadcn (Radix base) components, used app-wide. The design is applied through **opt-in CVA variants inside the element**. `className` is for layout only. Hand-built equivalents are deleted. |
| D2 | Installed | `sidebar`, `toggle`, `toggle-group`, `command`, `empty`, `field`, `breadcrumb`, `table`, `select`, `radio-group`, `separator`, `spinner`, `item`, `kbd`, `avatar`, `input-group`, `sheet`, `dropdown-menu`, `alert`, `scroll-area` and `checkbox`, each moved to `elements/<name>/<name>.tsx` + `index.ts`. `useIsMobile` lives in `src/hooks/use-mobile.ts`. The custom `chip` element is removed. |
| D3 | Install recipe | `pnpm dlx shadcn@latest add <name> --path <scratch>`, then move into `elements/<name>/`, rewrite imports to `@/lib/utils`, `@/components/elements/*` and `@/hooks/*`, and run `pnpm remove cn` (the CLI adds a bogus `cn` dependency). |
| D4 | Design variants | `Button` is stock v4 plus `primary`/`accent`/`glass`/`brand` and sizes `md`/`xl`. `Badge` gains `glass`/`success`/`warning`/`neutral`/`count`/`attention`. `Toggle`/`ToggleGroup` gain `chip`/`segment` and size `touch`. `InputGroup` gains `size`/`shape`/`tone`, `Avatar` gains `xl`/`2xl` and `AvatarFallback variant="brand"`. `Checkbox` and `SelectTrigger` gain `lg`, `Card` gains `elevated`, and `SidebarMenuButton` gains size `nav`. |
| D5 | Element fixes | **Sidebar:** the desktop container is an `<aside>` (complementary landmark), and the `sidebar_state` cookie write is removed because nothing read it and project rules forbid `document.cookie`. **CommandDialog** forwards `label` (cmdk names the input by it) and `filter`; the palette filters by substring, so typing narrows the list without reordering it. **ScrollArea:** the viewport is focusable (`scrollable-region-focusable`). Biome overrides cover only upstream ARIA role patterns in `breadcrumb`, `field`, `input-group` and `item`. |
| D6 | Dashboard shell | `DashboardShell` is `SidebarProvider` + `Sidebar` (offcanvas) + `SidebarInset` (the only `<main>`). On phones, the avatar opens the sidebar sheet and a bottom tab bar handles navigation. The unread count is in the Inbox link's accessible name; the visual badge is `aria-hidden`. |
| D7 | Profile | `/dashboard/profile` has an Identity card (photo, display name, username with a Change dialog), a Share link card, an AMA Prompt card (ideas, "Suggest with AI", banner switch) and a sticky live `VisitorPreview`. Edits stay a local draft until **Save changes** in the `UnsavedChangesBar`. |
| D8 | Settings | `/dashboard/settings` has Messages, Safety & blocking (quarantine, sensitivity, blur Spicy, blocked senders table), Notifications (email frequency, push, hide text, quiet hours), Appearance (mode + palette), Data and Danger zone, with a scroll-spy `SectionNav`. |
| D9 | Profile API | `GET/PATCH /api/user/profile` (displayName ≤ 40, avatar as a ≤ 350 kB data URL resized in the browser, `showAmaBanner`). `PATCH /api/user/username` returns `409` when taken, and the NextAuth `jwt` callback applies `trigger === "update"`. `POST /api/ai/ama-suggestions`. |
| D10 | Preferences API | `GET/PATCH /api/user/preferences` → `messages { offerSuggestions, publishByDefault }`, `safety { quarantineEnabled, sensitivity: relaxed/balanced/strict, blurSpicy }`, saved with dot-path `$set`. `send-message` applies `shouldQuarantine(toxicity, safety)` (`server/ai/quarantine-policy.ts`). |
| D11 | Notifications | `hideMessageText` and `quietHours { enabled, start, end, timeZone }` are added. `server/notifications/delivery-policy.ts` skips push and email alerts inside quiet hours and sends a generic preview when text is hidden. |
| D12 | Destructive actions | `DELETE /api/messages` deletes every message. The client waits 10 s with an Undo toast first, and commits immediately if the page unmounts. `DELETE /api/user` requires `confirmUsername`, then signs out. |
| D13 | Public profile | `GET /api/public/{username}/answers` also returns `displayName`, `avatarUrl`, `showAmaBanner` and `offerSuggestions`. Suggestions load only once the profile says they are offered. |

---

> D9–D13 are detailed in their own records: data model and settings API ([ADR 0024](0024-profile-preferences-data-model-and-settings-api.md)), graded toxicity and quarantine ([ADR 0025](0025-graded-toxicity-and-recipient-controlled-quarantine.md)), notification delivery ([ADR 0026](0026-notification-delivery-policy-quiet-hours-and-hidden-previews.md)), destructive actions ([ADR 0027](0027-destructive-account-actions-undo-window-and-typed-confirmation.md)).

## Consequences

- **New patterns**: `page-heading`, `identity-card`, `visitor-preview`, `unsaved-changes-bar`, `section-nav`, and the modals `change-username-modal`, `delete-all-messages-modal` and `delete-account-modal`. **Rewritten**: `share-link-card`, `ama-prompt-editor`, `command-palette` (cmdk), `filter-bar` (ToggleGroup), and the `profile-panel` and `settings-panel` blocks.
- **API changes**:
  - `CommandPalette` exports `CommandGroupDefinition`/`CommandItemDefinition`. The old `CommandGroup`/`CommandItem` type aliases are removed because they clashed with the shadcn components.
  - `AmaPromptEditorProps` is now `{ value, aiIdeas, isSuggesting, onChange, onSuggest, showBanner, onShowBannerChange }`.
  - `Badge` no longer has `size`.
- **Tests**: ToggleGroup items are `role="radio"`, so stories query filters and layout switches as radios. A pending button's name includes the Spinner's "Loading". New controller tests cover change-username, danger-zone and appearance. Every new element and pattern has a story.
- **Known gaps**: no "Unblock all" button (the design has none, though the controller keeps the action). Avatar photos are stored as data URLs in MongoDB, not in object storage.

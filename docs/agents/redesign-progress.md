# Redesign & Mobile-Responsiveness Progress (handoff for agents)

**Read this before touching typography, spacing, motion, mobile layout, Toaster, Command Palette, Sidebar, Settings, Inbox or Profile.** It tracks the effort to align the app with the Claude Design handoff at `ghostmsg-handoff/ghostmsg-handoff/` (gitignored, local-only; ask the user for a fresh copy if it's missing). That folder's `HANDOFF.md` is the source brief; `screenshots/` are the visual targets; `reference/boards/*.dc.html` + `ghostmsg.css` hold exact CSS values. Read those for **measurements**, never copy their markup.

Canonical docs this work feeds: [Chapter 13](../13-design-system-and-theming.md) (tokens, variants, cheatsheet), [Chapter 14](../14-ui-screens-and-user-flows.md) (screens, flows, responsive table), [Chapter 12](../12-product-guide-and-features.md) (features), [ADR 0034](../adr/0034-confirmed-message-deletes-undo-for-delete-all-and-phone-dashboard-chrome.md) (confirmed deletes, Delete all Undo, `notify`, phone chrome), [Chapter 11](../11-component-registry.md) (regenerate with `pnpm docs:registry`).

---

## 1. Why this exists

The handoff's build order: **1** foundations (tokens), **2** base shadcn parts + cva variants, **3** compositions, **4** screens mobile-first then desktop, **5** motion pass, **6** trust & safety/UX details. Steps 1–3 were mostly done in earlier sessions (ADR 0022/0023). This effort covers step 4 and the parts of 5–6 the screens need.

The user's framing: *"Make sure all components and mobile designs completely align with our implementation"*, then *"continue remaining part and make sure everything aligns with design-handoff and all implementations are done with proper documentation"*.

## 2. Status at a glance (2026-10-31)

| Area | Status | Where |
| :--- | :--- | :--- |
| Foundations (type/spacing/motion tokens, `lib/motion.ts`, `MotionConfig`) | Done | `globals.css`, `src/lib/motion.ts`, `app/layout.tsx` |
| `cn()` type-scale merge fix | Done | `src/lib/utils.ts` (see §3.1) |
| Toaster restyle + Undo toast | Done | `elements/sonner`, `patterns/undo-toast` |
| Delete flows (single = confirm, bulk = confirm, Delete all = confirm + Undo) | Done (revised 2026-10-31) | `DeleteMessageModal`, `DeleteSelectedModal`, `use-danger-zone.controller.ts` |
| `notify` toasts (per-type durations, assertive errors) | Done | `elements/sonner/notify.ts` |
| Archive (`e`, Archived chip) | Done | `use-archive-message-mutation.ts`, `filter-bar`, `inbox-query.ts` |
| Quarantine reason tags | Done | `quarantineReason`, `lib/messages/quarantine-reason.ts` |
| Keyboard (`e ⇧B # esc ⇧J/⇧K`, `g i/p/s`, `⇧C`, `?` sheet, tooltip keys) | Done | `use-inbox-keyboard`, `use-global-shortcuts`, `patterns/shortcut-sheet` |
| New-message pill, auto read (600 ms), skeleton delay (150 ms), four empty states, "last checked" | Done | `blocks/inbox`, `patterns/message-card` |
| Smart Reply: three drafts from one request; phone "Reply" drawer | Done | `smart-reply.queries.ts`, `smart-reply-modal.tsx` |
| Story Card phone drawer (MobDrawerStory) | Done | `story-card-modal.tsx` |
| Verify: resend + cooldown, tries left, lock, success screen | Done | `/api/verify-code/resend`, `use-verify`, `blocks/verify-success` |
| Auth phones (no site header, Back + progress, pinned actions, Show/Hide) | Done | `SiteLayout hideHeaderOnPhones`, `AuthPanel`, `auth-form` |
| Landing phones (MobLanding) | Done | `hero`, `claim-link-form`, `how-it-works`, `trust-section`, `qa-showcase`, `cta-banner`, `site-footer` |
| Public profile sent / paused / not found (MobPublic*) | Done | `blocks/public-profile` |
| Settings polish (mode cards without radio circles, table overline head) | Done | `appearance-settings.tsx`, `elements/table` |
| Phone shell (top bar slots, pill tab bar) | Done | `blocks/dashboard-shell`, `patterns/mobile-header-actions` |
| Tablet icon-rail default | Done | `dashboard-shell.tsx` `useTabletRail` |
| Settings phone grouped list + accordion | Done | `blocks/settings-panel` |
| Inbox phone (search collapse, selection mode, bulk bar, More actions sheet) | Done | `blocks/inbox`, `patterns/message-card`, `patterns/bulk-action-toolbar` |
| Quarantined view | Done (as a view of the filter, not a route) | `blocks/inbox` |
| Profile phone (identity summary, compact link card, header action) | Done | `blocks/profile-panel`, `patterns/identity-card`, `patterns/share-link-card` |
| Public profile phone polish | Done | `blocks/public-profile`, `patterns/send-message-form` |
| Landing + auth phone fixes | Done (earlier session; verified still present) | `site-header`, `trust-section`, `how-it-works`, `verify-code-form` |
| Command palette icons | Done (icons only, by decision) | `use-dashboard-shell.controller.ts` |
| Not done | See §5 | — |

## 3. What was done, and why it's built this way

### 3.1 Foundations and the `cn()` fix
- `globals.css`: responsive type scale (`text-display/h1/h2/h3/title/body-lg/body/sm/xs/overline`, each with weight/leading/tracking) and spacing scale (`px-gutter/py-section/p-card/gap-stack`), palette-independent, placed **after** the palette blocks (`scripts/check-theme-contrast.ts` reads the *first* `:root {`; a block placed earlier breaks the `spectral` contrast gate). Added `animate-countdown` (Undo bar).
- **`src/lib/utils.ts` (important):** plain tailwind-merge didn't know `text-h2`/`text-title`/… and treated them as **colours**, so `cn("text-h2", "text-destructive")` silently dropped the size (the desktop Danger zone title had lost `text-h2`; every element with a colour variant + semantic size was affected). Now a `text-scale` class group: it conflicts with font-size, weight, leading and tracking, so a later `text-title` also replaces `FieldLabel`'s `font-medium text-sm leading-snug`. Add new scale steps to that list.
- Biome `nursery.noTailwindRawColors`: its parser crashes on compound bracket selectors like `[[data-slot=x]_&]:` or `has-[[data-x]>*]:`. Five elements are excluded by override. Prefer state/props over such selectors in new code (the shell's leading slot uses a registration count for this reason).

### 3.2 Toaster and Undo
- `elements/sonner/sonner.tsx`: every toast is `unstyled` + `classNames` (Sonner's CSS is unlayered and beats Tailwind utilities). Surface from `ghostmsg.css .toast`: `min-h-[52px]`, `py-3 pr-3 pl-4`, `gap-3`, 14px/600, `rounded-2xl`, `shadow-lift`, `bg-popover`, coloured lucide icon, one primary ghost action (36px; 44px below `md`). `richColors` off. Phones: 12px sides, 80px above the bottom. Verified by measurement at 1280/390px, light + dark.
- `patterns/undo-toast`: `showUndoToast({ durationMs, icon, message, onCommit, onUndo })` = a normal Sonner toast whose `action` is `UndoToastAction` (button + 3px bar). Exactly one of `onUndo`/`onCommit` runs; `onCommit` fires on `onAutoClose`/`onDismiss`. **Don't use `toast.custom()`**: in Sonner 2.0.8 custom JSX renders inside `[data-title]`.
- Bug fixed: Delete all used its own `setTimeout`; hovering the toast (which pauses Sonner) let the delete run while Undo was still visible.

### 3.3 Delete flows ([ADR 0034](../adr/0034-confirmed-message-deletes-undo-for-delete-all-and-phone-dashboard-chrome.md))
- **Revised 2026-10-31 by the user:** "Delete single or bulk or all delete from danger zone should show dialog confirmation and undo option should only occur for all delete from danger zone."
- Single delete: `DeleteMessageModal` ("Delete this message? … This can't be undone.") → `handleDeleteConfirm` closes first and deletes optimistically. `use-undo-delete.controller.ts` was removed.
- Bulk delete: `handleBulkAction("delete")` opens `DeleteSelectedModal` ("Delete N messages?", counts public answers, "This can't be undone.") → `POST /api/messages/bulk`, optimistic with rollback. Bulk success toasts read "Deleted 2 messages" / "Marked 2 messages read" / "Starred 2 messages".
- Quarantined view: "Delete all quarantined" = the same bulk dialog for every loaded message in that view.
- Delete all (Danger zone): confirm → `showUndoToast` 10 s → commit on close.

### 3.4 Phone shell
- `patterns/mobile-header-actions`: `MobileHeaderActions` (right slot), `MobileHeaderLeading` (left slot; registering hides the brand tile), `MobileHeaderAction` (44px icon button). The shell renders both slots; pages portal into them. Inbox: Search + Select; Profile: View as visitor; Quarantined: back arrow; Settings: none.
- Top bar: 52px, brand tile (`BrandMark size="header"`, 32px), no page title (each page has its h1), no avatar/sheet. Tab bar: `.bnav` values (pill 56×30 behind the active icon, 12px/600 labels, translucent card + blur). Content top padding `pt-1` on phones.
- Tablet (768–1023px): sidebar starts on the icon rail; only range crossings toggle it. In rail mode the link card, Message Acceptance and account details hide (they overflowed before).

### 3.5 Settings (phones)
`SettingsLayoutProvider layout="list"` switches every `SettingsSection` to an `AccordionItem` row (icon tile, title, live summary, chevron). Panel: account card (avatar, name, email + Message Acceptance switch) → PREFERENCES `Accordion type="multiple"` → DATA & ACCOUNT (Export row expands to CSV/JSON; Sign out row) → DANGER ZONE (red rows). Blocked senders render as rows; Sensitivity segment goes full width. The design drills into sub-pages; **the user chose an accordion instead**. Desktop unchanged. One tree mounted at a time (no duplicate `useId`s).

### 3.6 Inbox and message card (phones)
- Search collapses behind the top-bar icon (stays open while a query is set); view toggle and Refresh hidden (live updates + polling exist); grid only; chips scroll sideways (the chip variant's `data-[variant=chip]:flex-wrap` beat the old `flex-nowrap`).
- Selection mode: Select icon → checkboxes; fixed "N selected · Select all" header over the top bar; `BulkActionToolbar layout="bar"` over the tab bar; cards hide star + action row; chips disabled. `onSelectAll` = every loaded id in the view.
- Card: tonal Reply (44px), Share, **More actions** sheet = `MessageActionsMenu` with a message preview header: Reply, Star, Share as Story Card, Archive / Move to Inbox, Mark as unread/read (`onToggleRead` → `updateMessage({ isRead })`), Block sender…, Delete. Quarantined: Reveal + Block sender (or Delete). Desktop keeps the board's inline Share/Archive/Block/Delete icons with key tooltips. "Answered" is a ✓, and "✓ Answered" once the card is 24rem wide (`@container/card`).
- **Quarantined view** (`activeStatus === "quarantined"`, all viewports): title "Quarantined", "N held back · never in your main inbox", reassurance notice, Delete all quarantined; phones hide the chips and show a back arrow.

### 3.7 Profile and public profile (phones)
- Profile: h1 only, View as visitor in the top bar, `IdentitySummary` (60px avatar, name, @handle, Edit) → Edit unfolds the full `IdentityCard` with Done; `ShareLinkCard layout="compact"` (overline, link as h3, Copy + Share… grid); AMA chips scroll sideways; banner switch label at title weight.
- Public profile: no palette/theme toggles (palettes live in Settings only); status "@handle · ● Accepting" / "@handle · ‖ Paused"; message form inside a card with a title-weight label; "Public Q&A" at `text-h3`; the sent state is a full screen (MobPublicSent) and paused has one brand CTA.

### 3.8 Earlier-session work (still valid)
Base parts installed (button-group, popover, hover-card, progress, drawer, **accordion** this session: written from the registry JSON because the CLI hung at "Installing dependencies"; `radix-ui` was already a dependency). `ResponsiveDialog` (Dialog ≥768 / Drawer below) for Smart Reply, Story Card, Block Sender. Landing: decluttered header, "Safe by default" h2, How it works carousel. Auth: sign-up description, verify-code error state (red slots + shake + Alert). Command palette icons (shortcut hints now that chords exist).

## 4. Decisions the user made (don't re-ask)

- Settings on phones: **accordion**, not sub-routes.
- Toaster: real Undo where an action can be held (the user pointed out Delete all already had one).
- Command palette: **icons only**, no shortcut hints.
- Block Sender: **keep the confirm dialog** (with "also delete").
- Deletes (2026-10-31): single and bulk confirm with no Undo; only Delete all keeps confirm + 10 s Undo. Undo length is 10 s everywhere.
- Archive: hidden from All / Unread / Starred; the Archived chip shows once the count is above 0; archiving is instant with a plain toast, no Undo.
- Quarantine reasons: Hurtful language, Spam, Threat; older messages say "Quarantined".
- Keyboard: all of `e`, `#`, `⇧B`, `esc`, arrows, `⇧J`/`⇧K`, `g i`/`g p`/`g s` (with palette hints), the `?` sheet and key hints in tooltips. (Supersedes "icons only, no shortcut hints" for the palette.)
- Verify: success screen with "Sign in to open your inbox" (no auth change) + resend endpoint, cooldown timer and attempt counter.
- Forgot password: leave the link out.
- Footer: keep Safety + API docs, restyled (underlined, right-aligned).
- Palettes only in Settings → Appearance; headers keep at most a theme toggle; the sidebar account row has theme + log out.
- Smart Reply: three drafts, one per tone, generated on open in one request, listed as the board shows (no tone tags).
- Labels: `FieldLabel` / `Label` default weight 600 (approved deviation from shadcn). Button default 600 followed by analogy (design `.btn`).
- "Align everything with the handoff" covers the previously-undiscussed findings (Profile summary card, Quarantined view, Inbox search collapse), which are now built.

## 5. Not done (and why)

| Item | Why / what it needs |
| :--- | :--- |
| Verify email address in the copy | The design says "we sent to maya@example.com"; /verify only knows the username (putting the email in the URL would leak it), so it says "the email you used for @handle". |
| "See a live profile" | Needs a real public profile: set `NEXT_PUBLIC_LIVE_PROFILE_USERNAME`; hidden otherwise. |
| Reply counter "/ 500" | The design shows 500; the API allows 1000 (`messageReplySchema`). Kept 1000 until the product decides. |
| Idle decorations on the sent screen | The board floats a ghost and sparkles; the motion rule allows idle loops only on the landing hero and the first-run empty state, so they're left out. |
| Separate `/dashboard/quarantined` route | Deliberately a view of the filter (ADR 0034). |
| `py-section`/`p-card`/`gap-stack` sweep | Defined; adopt when touching that spacing, no blind rename pass. |
| Doc screenshots | Run `pnpm build-storybook && pnpm docs:screenshots` and review the PNGs; the phone screens changed a lot. |

## 6. Working notes for whoever picks this up

- **Merging `develop` can silently revert design work.** The lint-fix commit on `develop` rewrote files from their pre-redesign versions; the merge dropped the message-card actions menu, the verify shake, `text.tsx` tokens, the sidebar `nav` and AMA banner tokens and `text-body` on the send form (all restored 2026-10-25). After any merge, `git diff <last redesign commit> HEAD -- src | grep '^-.*text-(h1|h2|h3|title|body)'` to spot losses.
- **Lint is clean now** (`npx biome check src` → 0 errors; the old ~194 baseline was fixed on `develop`). Keep it that way; `noExcessiveCognitiveComplexity` (max 20) and `noJsxPropsBind` are the usual trips: extract sub-components, pass stable callbacks.
- **A formatter hook runs after every Edit/Write** and strips unused imports; add the usage before the import. Biome also re-sorts interface members, so text anchors in scripted edits go stale.
- **Story tests:** run scoped batches (`npx vitest run --project storybook <folders>`); the full suite times out on this machine. Unit tests: `pnpm test` (292 passing).
- **Screenshots:** a Node script driving Playwright against Storybook `iframe.html?id=<story-id>&viewMode=story&globals=theme:dark` at 375×1000 @2x matches the handoff's phone screenshots 1:1. Wait for `[data-slot=…]` before capturing (a spinner frame means Storybook was rebuilding). `fullPage` captures paste the fixed tab bar mid-page: artifact, not a bug. Stop Storybook by the PID on port 6006 rather than killing every `node.exe`.
- Exact values live in `reference/boards/ghostmsg.css` (`.toast`, `.item-group`, `.item`, `.bnav`, `.act`, `.hscroll`, `.btn[data-s]`, `.is-mobile …`); grep before guessing.

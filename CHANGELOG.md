# ghostmsg

## 2.4.0

### Minor Changes

- Design-system foundations and the building blocks for a phone-first UI.
  - **Tokens:** a responsive type scale (`text-display`, `text-h1`, `text-h2`, `text-h3`, `text-title`, `text-body-lg`, `text-body`, `text-sm`, `text-xs`, `text-overline`) and a spacing scale (`px-gutter`, `py-section`, `p-card`, `gap-stack`). `cn()` knows the scale, so a text colour no longer drops the size (a Danger zone title had lost `text-h2`).
  - **Motion:** `src/lib/motion.ts` presets and a root `MotionConfig reducedMotion="user"`. The pulse ring now runs twice, like the design.
  - **Elements:** button-group, popover, hover-card, progress, drawer and accordion (shadcn); `Button` `dashed` variant; `Alert` success, warning and info variants (this fixed an AA contrast bug in the warning variant); `Table` header uses the design's overline caps; labels and buttons use weight 600 (a documented deviation from stock shadcn, Chapter 13 §6).
  - **Compositions:** `ResponsiveDialog` (Dialog at 768px and up, Drawer below) now powers Smart Reply, Story Card, Block sender and the shortcut sheet; `MessageActionsMenu` (DropdownMenu or Drawer) replaces the card's inline icon cluster.
  - **Lint:** a Biome `noTailwindRawColors` rule keeps raw colours out of components.
  - **Docs:** Chapter 13 variant catalog, `docs/agents/redesign-progress.md`.

- Archive, a full keyboard map, and a calmer live inbox. Pages now load 12 messages instead of 30.
  - **Archive:** `e` (or the card's Archive icon, or the phone sheet) moves a message out of All, Unread and Starred. An **Archived** chip appears once anything is archived, and the same action there reads "Move to Inbox". It is instant with a plain toast and no Undo.
    - **API:** `PATCH /api/messages/{id}` accepts `isArchived`; `GET /api/get-messages?status=archived`; `GET /api/messages/counts` returns `archived`; messages carry `isArchived` (indexed). The inbox filter rules live in `lib/messages/inbox-filter.ts`, `server/messages/inbox-query.ts` and the MSW handler, kept equal by a contract test.
  - **Keyboard:** `j` `k` `↑` `↓` move, `⇧J` `⇧K` extend the selection, `x` select, `s` star, `r` reply, `e` archive, `#` delete (opens the confirm), `⇧B` block, `/` search, `esc` clear. Anywhere in the dashboard: `g i`, `g p`, `g s`, `⇧C` copy my link and `?` for a shortcut sheet. Shortcuts show in tooltips and in the command palette. The sheet has a Done button, so the scrolling phone drawer has focusable content (it failed an axe check without one).
  - **Live feel:**
    - A card that stays on screen 600 ms is marked read.
    - A "1 new Anonymous Message" pill appears instead of the list jumping.
    - Skeletons show only after 150 ms.
    - The subtitle reads "N unread · last checked a moment ago".
    - Four empty states: first run, an empty filter, nothing held back, and no search matches.
  - **Page size:** `GET /api/get-messages` defaults to 12 per page (it was 30); the maximum is still 100. Load more adds 12.
  - **Docs:** Chapter 23 (Inbox Triage), Chapter 25 (Accessibility & Feedback), ADR 0030 note.

- The landing page, public profile and Story Card now match the phone designs.
  - **Landing on phones:** a full-width "Get my link", a How it works carousel (a heading, a "1 / 4" counter, 272px step cards and pill dots), "Safe by default" as icon rows, the Story Card shown on its own, a split call to action, and a stacked footer with 44px links. All of it is CSS-only, so the server-rendered page doesn't shift after hydration. "See a live profile" appears only when `NEXT_PUBLIC_LIVE_PROFILE_USERNAME` names a real profile.
  - **Footer:** keeps Safety and API docs, underlined and right-aligned on desktop.
  - **Public profile:**
    - Sent is a whole screen: the message under "You sent", Send another, Get your own link, and a back link.
    - Paused is a calm dashed card with one "Make your own link".
    - Not found has full-width actions.
    - The status line reads "@handle · Accepting" or "@handle · Paused".
  - **Story Card on phones:** a drawer with the preview, Format, "Include my answer", and Save and Share side by side.
  - **Inbox cards:** "✓ Answered" shows its text once a card is 24rem wide.
  - **Settings:** mode cards drop the radio circles (the radio stays for keyboard and screen readers). The profile visitor preview reads "Accepting Anonymous Messages".
  - **Docs:** Chapter 26 (Responsive Design) with a screen-by-screen phone versus desktop table, Chapter 14.

- A phone-first dashboard, one toast API, and every message delete now asks first.
  - **Deletes:**
    - Deleting one message and deleting a selection both open a confirm dialog ("Delete this message?", "Delete N messages?", which counts public answers that go too), then delete at once. They have no Undo.
    - **Delete all** in the Danger zone keeps its confirm and its 10-second Undo; the commit follows the toast's lifecycle (time runs out, swipe, dismiss or leaving the page).
    - Failures put the cards back with an error toast (ADR 0034).
  - **Toasts:** app code uses `notify` (success 3 s, info and warning 5 s, errors 6 s or until dismissed when they carry an action). Errors are also read out at once through an assertive live region. The Toaster is restyled to the design's one-line surface with an Undo bar.
  - **Phone shell:** a 52px top bar that pages fill through `MobileHeaderActions` and `MobileHeaderLeading` portals, a pill tab bar, and an icon-rail sidebar on tablets.
  - **Inbox on phones:** search behind a top-bar icon, a selection mode (header, "Select all", bottom action bar), a More actions sheet on each card, and a Quarantined view with a back arrow.
  - **Profile and Settings on phones:** a compact identity row with Edit, a compact link card, and Settings as a grouped list with accordion rows. Message Acceptance and Sign out live in Settings.
  - **Palettes** are chosen only in Settings, Appearance. Headers and the sidebar keep, at most, a theme toggle.
  - **Docs:** ADR 0034, Chapters 13, 14, 20, 25 and 26.

- Quarantined Messages say why they were held.
  - **Tags:** a held card shows **Hurtful language**, **Spam** or **Threat**; the blur note and the Reveal dialog use the same reason ("Hidden. Flagged as spam.", "It was flagged as a threat."). Messages held before this change keep the generic "Quarantined".
  - **Moderation:** the AI returns a `category` (`none`, `hurtful`, `spam`, `threat`) next to the toxicity level. `toQuarantineReason` stores it as `quarantineReason` when a message is held (an uncategorised hold reads as hurtful). The reason only labels the message; whether it is held is still decided by the Recipient's sensitivity setting.
  - **API:** `GET /api/get-messages` and the live `new_message` event include `quarantineReason` for quarantined messages.
  - **Docs:** Chapters 15, 16, 17 and 24.

- Smart Reply offers three ideas at once, one per tone, from a single AI request.
  - **Breaking (API):** `POST /api/ai/smart-reply` no longer takes `tone` and no longer returns `reply`. Send `{ content }`; the response is `{ success, drafts: [{ tone, text }] }` with `thoughtful`, `witty` and `wholesome`, in that order, each at most 180 characters. Any client that sent a tone must switch to picking a draft.
  - **One call:** a single Gemini structured-output request returns all three drafts. Without an AI key or on an error you get three stock drafts (still 200).
  - **Client:** a query (`smartReplyQueries.drafts`) replaces the mutation. The drafts load when Reply opens, are cached per message for the session, and are never refetched on focus or retried (each retry would be another AI call). Picking an idea fills the answer; you can edit it before saving.
  - **UI:** three skeleton rows while loading, "Couldn't load ideas. Try again" on failure. On phones the modal is a "Reply" drawer with the ideas in a sideways scroller and Save and Story Card side by side.
  - **Docs:** Chapter 24 (AI Features), Chapter 16 §8.

- One form architecture for every input flow: react-hook-form in the page controller, shadcn Form primitives in the pattern.
  - **Controllers own the form:** each form uses `useForm({ resolver: zodResolver(schema), mode: "onChange" })` in its `pages/*` controller. Sign in, sign up, Verification Code, the send-message form, Change username and Profile all follow it (ADR 0033).
  - **Patterns stay pure:** forms receive `form` plus callbacks and render `Form`, `FormField`, `FormItem`, `FormLabel`, `FormControl` and `FormMessage`. The control gets its `id`, `aria-describedby` and `aria-invalid` from `FormControl`, so errors are announced and linked to their field.
  - **Validation errors** now show in one place (`FormMessage`) instead of ad-hoc text under each input.
  - **Docs:** ADR 0033, the form recipe in the component architecture guide.

- A safer, clearer Verification Code flow with resend, tries, and a "You're in" screen.
  - **Tries:** three wrong guesses lock a code. A wrong code answers 200 with `success: false`, `reason: "wrong"` and `attemptsLeft`; a locked code answers 429 (`reason: "locked"`); an expired one 400 (`reason: "expired"`).
  - **Resend:** new `POST /api/verify-code/resend` emails a fresh code and resets the tries. It waits 60 seconds after the last code (429 with `retryAfterSeconds`) and allows 5 per username every 10 minutes.
  - **Codes:** generated with `crypto.randomInt` (not `Math.random`) through one helper, `issueVerificationCode`. New user fields `verifyAttempts` and `verifyCodeSentAt`.
  - **Screen:**
    - A countdown ("Resend in 0:42") that becomes Resend code.
    - The error reads "That code isn't right. 2 tries left. Check for the newest email."
    - Red slots shake once.
    - Locked and expired states disable the slots.
  - **Verified:** the page shows "You're in. Your link is live." with the new link, Copy and Share, and "Sign in to open your inbox". Verifying does not sign the person in.
  - **Phones:** auth screens drop the site header and card, get their own Back arrow ("1 / 2", "2 / 2" progress on sign-up and verify), and pin the main button to the bottom. Passwords use a "Show" / "Hide" text toggle, and the sign-in copy now reads "Your inbox missed you."
  - **Docs:** Chapter 22 (Authentication & Verification), Chapters 15 and 16.

### Patch Changes

- Six new documentation chapters and refreshed references.
  - **New chapters:** 22 Authentication & Verification, 23 Inbox Triage, 24 AI Features, 25 Accessibility & Feedback, 26 Responsive Design, 27 Developer Troubleshooting, and 28 Supply-Chain Security. Each has diagrams, request and response examples, and code; all are linked from the docs index, the root README, `AGENTS.md` and the agent guides.
  - **Updated:** Chapters 2, 4, 5, 7, 8, 9, 12 to 17, 19 and 20, the glossary (adds "Archived Message"), ADR 0034, ADR 0030 and the redesign progress tracker.
  - **Recipes:** feature recipes K to N (keyboard shortcut, AI feature, phone variation, feedback) in `docs/agents/feature-recipes.md`.
  - **Generated:** the component registry and the doc screenshots were regenerated.
  - **Tests and stories:** every component folder has its mock and story; new unit tests cover the shortcut guard, `cn`, quarantine reasons, the verification rules, the resend cooldown and the global shortcuts.

- Sign in now validates the "username or email" field before it reaches the server.
  - **Fix:** the identifier used to be an unvalidated string, so an empty or malformed value only failed after a round trip. It is now required, checked as an email when it contains `@` ("Invalid email address"), and otherwise needs at least 2 characters ("Username must be at least 2 characters").
  - **Sign up:** the email is trimmed before it is validated.
  - **Forms:** the shared username field, password field, claim-link, send-message and verify forms got matching label and error wiring.

- Discarding Profile edits really discards them.
  - **Fix:** Discard, saving with no real change, and confirming "leave without saving" called a bare `reset()`. Because the form syncs with the server (`values` plus `keepDirtyValues`), that kept the draft the person was throwing away and left the page dirty. They now reset explicitly to the saved values.
  - **Tests:** three Profile controller tests that were failing now pass.

- Fix the typing of the Radix switch and related primitives in the dashboard shell.
  - **Fix:** type errors around the Message Acceptance `Switch` in the sidebar, and in the `Tooltip`, `Label` and `Form` elements it relies on, are resolved. The sidebar switch builds and behaves as before.
  - **No visual change.**

- Remove an obfuscated download-and-run payload from the repository and add a guard against it.
  - **Removed:** the payload hidden in `postcss.config.mjs` (it ran whenever the config loaded: dev, build, Storybook, Vercel builds) and a copy disguised as `public/fonts/fa-solid-600.eot`.
  - **Guard:** `pnpm security:check` (`scripts/check-suspicious-code.ts`) reads every tracked file and fails on known payload markers, code hidden in fonts and images, obfuscated scripts, folder-open editor tasks and install-time scripts. It runs from the Husky pre-commit hook and is step 5b of the pre-push rule. It reads only and never executes what it scans.
  - **Editor:** removed `task.allowAutomaticTasks` and a folder-open task from `.vscode/settings.json`.
  - **Action needed:** anyone who ran this project while the payload was present should treat that machine and the secrets on it as exposed. See Chapter 28 for the response steps and the list of secrets to rotate.
  - **Docs:** Chapter 28 (Supply-Chain Security).

## 2.3.0

### Minor Changes

- 9ea5e71: Claude Design redesign, shadcn-first UI, a Profile & Settings backend, daily digests and agent-first docs.
  - **Design:** three palettes (Soft spectral, Midnight confessional, Playful paper) × light/dark, chosen per device with no flash on load. Every screen is rebuilt from shadcn (Radix) elements, with the look applied through opt-in CVA variants (ADR 0022, ADR 0023).
  - **Profile:** display name, a photo resized in the browser, the AMA Prompt with AI ideas and a banner switch, username change (the old link stops working), and a live "what visitors see" preview behind an unsaved-changes bar (ADR 0023, ADR 0024).
  - **Settings:**
    - Messages, Safety, Notifications, Appearance, Data and a Danger zone, saved per control.
    - Graded toxicity with a Recipient-controlled quarantine sensitivity (ADR 0025).
    - Quiet hours and hidden previews for email, push and the live toast (ADR 0026).
    - Delete all with a 10-second undo, and delete account with a typed confirmation (ADR 0027).
  - **API:**
    - New: `GET/PATCH /api/user/profile`, `PATCH /api/user/username`, `GET/PATCH /api/user/preferences`, `DELETE /api/messages`, `DELETE /api/user`, `POST /api/ai/ama-suggestions` and `GET /api/cron/daily-digest`.
    - Extended: the notification and block-sender endpoints, and the public answers endpoint.
  - **Fixes:** exports are allow-listed (no Sender Hashes); the live toast is silent for quarantined messages and hides text by default; daily digests are actually sent (Vercel Cron + `CRON_SECRET`); hidden-text alert emails no longer quote a placeholder (ADR 0029).
  - **Docs:** chapters 12–19, agent guides and rules, ADRs 0022–0029, and screenshots generated from stories (ADR 0028).

- a7cdcd5: A shared harness for testing page controllers, and every controller now has a test.
  - **Harness:** `renderHookWithProviders(hook, { session?, queryClient? })` wraps a controller hook in `SessionProvider` and a fresh React Query client. Default session is signed out, so there's no `/api/auth/session` fetch and no live-message SSE stream during tests.
  - **Call assertions:** `recordRequests()` records every MSW request as `"METHOD /path"`, used for "called"/"not called" assertions instead of stubbing mutation hooks.
  - **Minimal mocking:** only four true edges are ever mocked (`next/navigation`, `sonner` toasts, `next-auth/react`'s `signIn`, and browser download side effects). `@/data/**` always runs for real against the same MSW handlers and scenarios Storybook uses.
  - **Coverage:** all 11 page controllers now have a `*.controller.test.ts`, covering the happy path, server-error scenarios and guard clauses. Render-only tests that only checked copy were removed; stories already cover that.
  - **Docs:** ADR 0019.

- aba4b18: Four-tier component architecture, Storybook 10 story-driven testing and generated docs.
  - **Components:** `src/components` is split into `elements → patterns → blocks → pages`. Business logic lives only in page controllers, and Biome `noRestrictedImports` enforces the boundaries. Vendor shadcn `ui/` and Animate UI were moved into `elements/`, and the duplicate Button was merged (ADR 0015).
  - **UI parity:** pre-refactor visuals were restored. Accessibility fixes found by the new a11y gate:
    - the sign-in/sign-up link was nested inside a button
    - carousel buttons had no names
    - the tabs highlight had an invalid `aria-selected`
    - the send-message textarea had no label
    - the public Q&A heading skipped a level
    - the destructive badge used an undefined text token
    - contrast was raised to WCAG AA: one shade darker on sentiment badges and red status text, and a darker light-mode `--muted-foreground` (ADR 0016 Q17/Q18)
  - **Testing:** Storybook 10 (`@storybook/nextjs-vite`) stories are now the component tests. They run in a Vitest browser project (Chromium, `play()`, axe). Page stories use MSW. Unit tests are network-isolated with `msw/node`. Shared fixtures live in `src/mock/fixtures` and typed handlers in `src/mock/handlers` (ADR 0016).
  - **Tooling:**
    - pnpm only (`packageManager` pinned, `package-lock.json` removed)
    - new scripts: `storybook`, `build-storybook`, `test:stories`, `test:all`, `docs:registry`, `docs:registry:check`
  - **Docs:**
    - generated Component Registry (Chapter 11, ADR 0017)
    - agent guide `docs/agents/component-architecture.md`
    - updated chapters 2 and 4–11
    - dated update notes on historical ADRs

- a7cdcd5: Inbox delete and bulk actions are now actually optimistic, with one shared helper instead of a one-off per mutation.
  - **Fix:** the delete confirm dialog used to await the server before closing, so the optimistic cache update happening behind it was invisible; the card stayed hidden behind a spinner for the whole round trip.
  - **Close first:** confirm handlers now close the dialog and update local selection state before awaiting the mutation. Bulk actions clear the selection before the request too. A failure rolls back and toasts.
  - **Shared cache helper:** `src/data/messages/messages-cache.ts` (`updateCachedMessages` / `restoreCachedMessages` / `invalidateCachedMessages`) patches every cached inbox list at once, not just the one matching the current filter, so no list goes stale behind the scenes. Used by single delete and every bulk action (delete, read, star).
  - **Docs:** ADR 0021.

- a7cdcd5: Source structure: a real boundary between server, client data and pure logic, with colocated tests everywhere.
  - **Runtime split:** `src/server/` holds server-only code (each file guarded by `import "server-only"`); `src/lib/` holds pure, framework-agnostic helpers only; client infrastructure (API client, query keys, hooks, mutations) moved into `src/data/<domain>/`.
  - **Enforcement:** Biome `noRestrictedImports` bans `@/server/**` from components, data, hooks, lib and Storybook; bans `@/data/**` below `pages/`; keeps `src/lib/**` free of React, Next, NextAuth and TanStack imports (ADR 0018).
  - **Renamed/moved:** `src/context/` → `src/providers/`; `src/helpers/` absorbed into `src/server/email/`; `src/queries/` and `src/hooks/mutations/` removed in favor of `src/data/`; real landing-page content moved to `src/content/`; client DTOs now come from the generated OpenAPI schema (`src/types/api.ts`) instead of Mongoose model types.
  - **Tests:** always colocated (no `__tests__/`); every `*.utils.ts`, every `src/lib`/`src/server` module with logic, and every page controller now has its own test.
  - **Docs:** ADR 0018, agent guide `docs/agents/source-structure.md`.

- 9ea5e71: State-management review: server-side inbox paging, one optimistic-mutation factory, URL view state and server-rendered sessions and profiles.
  - **Inbox (ADR 0030):**
    - Filters, search and keyset paging run on the server, with **Load more**; the shared filter/cursor contract in `src/lib/messages` is executed by the server, the MSW mocks and the live cache.
    - `GET /api/messages/counts` feeds the badges, the unread count and "Delete all N".
    - Export all pages through every message.
    - Interacting marks a message read.
    - A selection belongs to the current filter + search.
    - Star, read and reply are optimistic.
    - Push is per device.
  - **Breaking API change:** `GET /api/get-messages` returns one page of one filter (`status`, `q`, `cursor`, `limit`; `nextCursor`) instead of every message. `isAcceptingMessage` is no longer in the session token.
  - **Consistency (ADR 0031):**
    - Settings-like saves use `useOptimisticResourceMutation`: queued per resource and silent on success.
    - Live messages are inserted into the cache, with polling while the stream is down and a refetch on focus.
    - Suggested Messages are a cached query.
    - The AMA Prompt is saved with the profile in one `PATCH`.
  - **Structure (ADR 0031):**
    - The inbox is split into filter and data controllers, with `?filter=&q=` in the URL and a remembered layout.
    - Dialogs are resolved by message id.
    - There are no state-copying effects.
    - The Profile page uses react-hook-form with a leave guard (`DiscardChangesModal`).
    - The dashboard session is rendered on the server, and so is the public profile (`getPublicProfile`, real metadata).
    - The palette syncs across tabs.
  - **Docs:** Chapter 20 (State Management), ADRs 0030–0031, a new inbox-filter recipe, and an audit that aligned chapters 03–19, the agent guides, the rules and the OpenAPI descriptions with the code.

- a7cdcd5: The Vercel project and the MongoDB Atlas cluster are now managed as code with Terraform instead of by hand in each dashboard.
  - **Terraform:** new `terraform/` directory (state in HCP Terraform, CLI-driven) manages the Vercel project's settings and build command, every synced environment variable, and the Atlas project/cluster/database users/network access list (ADR 0032).
  - **Per-environment env vars:** `app_env_vars` sets independent Production/Preview values per key (or omits either); `MONGODB_URI` is built automatically per environment from dedicated, database-scoped Atlas users instead of being typed in by hand.
  - **Isolation:** one free M0 Atlas cluster now hosts two database users, each scoped `readWrite` to only its own database, so Preview can never read or write Production data.
  - **Deliberately out of scope:** the Vercel Cron schedule stays in `vercel.json` (the Vercel Terraform provider has no cron resource); OIDC tokens and deployment protection settings are explicitly excluded from management.
  - **Fix:** a shared Production/Preview `NEXTAUTH_URL` value briefly broke Google sign-in on Preview deployments and after a local `vercel env pull`; `terraform/README.md` §7 documents this and the write-only behavior of Vercel's sensitive environment variables.
  - **Docs:** ADR 0032, `terraform/README.md`, updates to Chapters 2 and 9.

- a7cdcd5: Browser push notifications actually work now, per device, and heal themselves when a subscription expires.
  - **Fix:** push was previously non-functional end to end: no real VAPID keypair (the client fell back to a demo key the server never had the private half of), and subscriptions were silently discarded by Mongoose strict mode before anything could ever be sent.
  - **Delivery:** new `src/server/push/web-push.ts` sends to every one of a recipient's devices in parallel when a new message arrives, fire-and-forget (never blocks the send response), and prunes subscriptions the push service reports as gone (404/410).
  - **API:** new `DELETE /api/user/push-subscription`; `POST` now validates the payload and dedupes by endpoint so a resubscribed device never duplicates.
  - **Env:** `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, optional `VAPID_SUBJECT`. Without them the app runs fine; Settings reports push as unconfigured and the server just skips sending.
  - **UX:** actionable error messages (blocked, HTTPS required, stale subscription, push service refused) instead of raw `DOMException` text. Push is tracked and toggled per device, not per account.
  - **Docs:** ADR 0020, Chapter 9 production checklist.

## 2.2.1

### Patch Changes

- Update lock file after moving changeset to dev deps

## 2.2.0

### Minor Changes

- Added changeset config

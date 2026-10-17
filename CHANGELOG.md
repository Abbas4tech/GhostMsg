# ghostmsg

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

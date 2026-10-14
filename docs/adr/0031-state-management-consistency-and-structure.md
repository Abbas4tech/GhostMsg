# ADR 0031: State Management Consistency and Structure (Review Phases 2–3)

## Status
**Accepted** (2026-10-14). Completes the state-management review in [Chapter 20](../20-state-management.md) after Phase 1 ([ADR 0030](0030-server-side-inbox-filtering-paging-and-counts.md)). Builds on [ADR 0021](0021-optimistic-inbox-mutations-close-first-and-shared-cache-helpers.md) and [ADR 0015](0015-four-tier-components-pages-layer-and-vendor-consolidation.md).

---

## Context

Phase 1 fixed wrong data. The review's remaining items were about **consistency** (each settings mutation optimistic in its own way, racing toggles, over-broad refetches, a GET handled as a mutation, stale inbox on serverless) and **structure** (one 300-line inbox controller, dialogs holding stale message copies, view state lost on refresh, effects copying state, a hand-rolled Profile draft, a session fetched on the client, duplicated Message Acceptance, a blank-then-fetch public profile, palette not syncing across tabs).

## Decisions

### Consistency (Phase 2)

| # | Decision |
| :-- | :--- |
| D1 | **One optimistic-resource factory**: `useOptimisticResourceMutation({ queryKey, scopeId, mutationFn, merge, errorMessage, successMessage?, alsoInvalidate? })` in `src/data/optimistic-resource-mutation.ts`. Acceptance, notifications, preferences and profile use it. Switches are **silent on success**; errors toast; Profile says "Profile saved". |
| D2 | **Serialised per resource**: TanStack v5 `scope: { id }` runs one resource's requests in order while every change shows at once. Roll back only when no later change of the same resource is pending; refetch only when the **last** one settles (`isMutating({ mutationKey }) <= 1`). |
| D3 | **Narrow invalidation.** The AMA Prompt moved into `PATCH /api/user/profile` (one atomic save); the separate client mutation that refetched every `user.*` query is gone (the `/api/user/ama-prompt` endpoint remains for compatibility). |
| D4 | **Live messages update the cache directly**: the SSE payload is inserted into every cached inbox list it belongs to (not searches) and into the counts, then one debounced (1.5 s) refetch reconciles Sender Hash and reply (`insertLiveMessage`, `addToInboxCounts`). |
| D5 | **Fallbacks when live updates can't be trusted**: inbox and counts refetch on window focus, and poll every 30 s while the stream is disconnected (`useLiveMessages` returns `isConnected`). |
| D6 | **Suggested Messages are a query** (`publicQueries.suggestions()`, no retries, failure toasted once, 5-minute cache); "New ideas" is `refetch`. The auto-fetch effect and ref are gone. |

### Structure (Phase 3)

| # | Decision |
| :-- | :--- |
| D7 | **Inbox split**: `use-inbox-filters.controller` (filter + search, URL), `use-inbox-data.controller` (paged query, counts, live, polling), and `use-inbox.controller` composing them with selection, dialogs and actions. Pure helpers (`buildInboxHref`, `toggleScopedSelection`, `visibleSelection`, `resolveModalMessage`) live in `inbox.utils.ts`. |
| D8 | **View state in the URL**: filter and search are written with `window.history.replaceState` (`?filter=&q=`), with no navigation or server round trip. The route passes them back on load; a new `?filter=` from the route (⌘K, back/forward) is adopted during render. The grid/list layout is remembered per device (`localStorage`). |
| D9 | **Dialogs by message id**: the open dialog stores `{ kind, messageId, snapshot }`; the message shown is the live cached copy, falling back to the snapshot only if it is gone (exit animation after delete). |
| D10 | **No effects that copy state.** Smart Reply seeds its draft during render once per opening (keyed by message id), so refetches and late preferences can't overwrite typing. Username availability is derived from the query and blocks submit; it is no longer written into form errors. |
| D11 | **Profile on react-hook-form**: `useForm({ values: serverValues, resetOptions: { keepDirtyValues: true } })`; dirty fields become one `PATCH` (`buildProfilePatch`); a successful save resets the baseline. A **leave guard** (`src/hooks/use-leave-guard.ts`) shows the browser prompt on close/reload and holds in-app link clicks for `DiscardChangesModal` ("Keep editing" focused first). |
| D12 | **Session from the server for the dashboard**: the dashboard route layout reads `getServerSession` and passes it to `SessionProvider`, so the dashboard renders signed-in without a skeleton flash. The root layout stays session-free (static pages stay static). |
| D13 | **One source for Message Acceptance**: removed from the JWT/session (it was set at sign-in and never updated); clients read `user.acceptance`. |
| D14 | **Public profile rendered on the server**: `getPublicProfile` (`src/server/users/public-profile.ts`, React `cache`) backs the API route, the page (`initialData`, no loading state) and `generateMetadata` (display name and AMA Prompt in titles and previews). |
| D15 | **Palette follows other tabs** through the `storage` event. |

## Considered options

- **A global store (Zustand/Redux) for inbox UI state.** Rejected: the state is page-local; React Query + URL + controller state covers it without a second cache.
- **`router.replace` for URL state.** Rejected: it re-runs the server page on every filter click and doesn't update in Storybook's mocked router; `history.replaceState` is instant and Next.js keeps `useSearchParams` in sync.
- **HydrationBoundary for the public profile.** Equivalent result; `initialData` keeps the route thin and avoids exposing query keys to route files.
- **Session in the root layout.** Rejected: reading cookies there would make every page dynamic.

## Consequences

- New tests: `use-inbox-filters.controller.test.ts`, `use-inbox-data.controller.test.ts`, `use-leave-guard.test.ts`, `palette-provider.test.tsx`, live-insert helpers, profile patch builder, Discard dialog stories; profile, sign-up availability and send-message tests updated.
- Removed: `use-ama-prompt-mutation.ts`, `use-suggest-messages-mutation.ts`, the unused `messages.detail` key, `isAcceptingMessage` in the token.
- Settings switches no longer toast on success (the switch is the confirmation).

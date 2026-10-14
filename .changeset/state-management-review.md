---
"ghostmsg": minor
---

State-management review: server-side inbox paging, one optimistic-mutation factory, URL view state and server-rendered sessions and profiles.

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

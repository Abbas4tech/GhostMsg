# ADR 0030: Server-Side Inbox Filtering, Keyset Paging and Counts

## Status
**Accepted** (2026-10-14). Phase 1 of the state-management review ([Chapter 20](../20-state-management.md)). Changes how the inbox reads data; keeps the optimistic mutation stance of [ADR 0021](0021-optimistic-inbox-mutations-close-first-and-shared-cache-helpers.md).

---

## Context

The dashboard loaded **one** list (`GET /api/get-messages` with no parameters) and filtered, searched and counted it in the browser. The review found that this showed users wrong state:

- The server's default status excludes quarantined messages, so the **Quarantined tab and its count were always empty** in production. Stories passed because the MSW mock ignored `status` and returned everything.
- The list stopped at **50 messages** (server default). Badges, the sidebar unread count, "Export all" and "Delete all N" were computed from that first page.
- **Selection** survived filter changes, so a bulk action could hit messages the recipient could no longer see.
- Nothing marked a message **read** except the bulk action.
- The **push switch** mirrored the account flag, and turning push off on one device switched it off for all devices.
- Star/read and reply were **not optimistic**, although the docs said they were.

## Decisions

| # | Decision |
| :-- | :--- |
| D1 | **The server filters and searches.** `GET /api/get-messages?status&q&limit&cursor` serves one filter at a time. Statuses: `all` (not quarantined, default), `unread`, `starred`, `quarantined`, `answered`, and API-only `any` (exports). Search matches the message **or its answer**, case-insensitive, with user input **regex-escaped**. |
| D2 | **Keyset paging, newest first.** Sort `{ createdAt: -1, _id: -1 }`; `nextCursor = "<ISO createdAt>_<id>"` of the last item (`null` on the last page); default page 12 (was 30 until 2026-10-31), max 100. `total` counts everything matching the filter. Malformed cursors answer 400. |
| D3 | **Counts come from the server**: `GET /api/messages/counts` → `{ all, unread, starred, answered, quarantined, total }` in one aggregation. Filter badges, the sidebar unread badge and "Delete all N" use it. |
| D4 | **One contract, three implementations.** The rules live in `src/lib/messages/inbox-filter.ts` and `inbox-cursor.ts` (pure, tested). The server translates them to MongoDB in `src/server/messages/inbox-query.ts`. The MSW mock **executes the same functions**, so stories and controller tests now see what production sees. |
| D5 | **Client:** `messagesQueries.inbox({ status, q })` is a `useInfiniteQuery` (keyed by filter + debounced search, `keepPreviousData`); `messagesQueries.counts()` is shared by the inbox and the shell. "Load more" fetches the next page. "Export all" pages through the server (`fetchAllMessages("any")`). |
| D6 | **Selection is scoped and derived.** Selected ids belong to one filter + search and only count while loaded; changing either clears them, without effects. The keyboard focus is derived the same way. |
| D7 | **Interacting marks read**: opening Reply or the Story Card, revealing, and starring send `isRead: true` (optimistic, silent). Saving an answer marks it read on the server too. |
| D8 | **Star/read and reply are optimistic** with snapshot rollback, sharing `patchCachedMessage` in `messages-cache.ts`, which now understands paged cache data. |
| D9 | **Push is per device.** The Settings switch is on only when this browser holds a subscription and the account flag is on. Turning it off removes only this device; the server clears `webPushEnabled` once **no** subscription remains (`disablePushWhenNoDevices`), also after pruning gone endpoints. |

## Considered options

- **Keep client-side filtering but load everything.** Rejected: unbounded downloads for large inboxes, and counts would still depend on what was fetched.
- **Offset paging (`skip`).** Rejected: new messages arriving live shift offsets and duplicate or skip items; keyset paging is stable and index-friendly.
- **Counts inside every page response.** Rejected: counts are needed where no list is loaded (sidebar), and one aggregation per filter change is wasted work.

## Consequences

- Switching filters or searching is a network request (debounced 250 ms, previous list kept on screen while loading).
- Messages that leave a filter after a change (e.g. marked read under Unread) disappear on the next refetch, not instantly.
- Tests: `inbox-filter.test.ts`, `inbox-cursor.test.ts`, `inbox-query.test.ts`, the rewritten `use-inbox.controller.test.ts` (server filters, search, paging, scoped selection, mark-read, optimistic star), `use-settings.controller.test.ts` (per-device push), `web-push.test.ts`.

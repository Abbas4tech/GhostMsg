---
"ghostmsg": minor
---

Inbox delete and bulk actions are now actually optimistic, with one shared helper instead of a one-off per mutation.

- **Fix:** the delete confirm dialog used to await the server before closing, so the optimistic cache update happening behind it was invisible; the card stayed hidden behind a spinner for the whole round trip.
- **Close first:** confirm handlers now close the dialog and update local selection state before awaiting the mutation. Bulk actions clear the selection before the request too. A failure rolls back and toasts.
- **Shared cache helper:** `src/data/messages/messages-cache.ts` (`updateCachedMessages` / `restoreCachedMessages` / `invalidateCachedMessages`) patches every cached inbox list at once, not just the one matching the current filter, so no list goes stale behind the scenes. Used by single delete and every bulk action (delete, read, star).
- **Docs:** ADR 0021.

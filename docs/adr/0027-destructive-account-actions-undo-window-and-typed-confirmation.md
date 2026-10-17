# ADR 0027: Destructive Account Actions: Undo Window, Typed Confirmation and Username Changes

## Status
**Accepted** (2026-10-14). Applies the close-first, optimistic stance of [ADR 0021](0021-optimistic-inbox-mutations-close-first-and-shared-cache-helpers.md) to account-level actions.

---

## Context

The Settings danger zone adds **Delete all messages** and **Delete account and link**, and the Profile page adds **Change username**. All three are irreversible on the server (hard deletes; a renamed link can't be recovered). The canvas specifies "You get 10 seconds to undo" for Delete all and "You'll type your username to confirm" for account deletion.

## Decisions

| # | Decision |
| :-- | :--- |
| D1 | **Delete all = confirm dialog + 10-second client-side undo.** The request (`DELETE /api/messages`) is sent only after the timer (`DELETE_ALL_UNDO_MS = 10_000`) in `use-danger-zone.controller.ts`. Undo clears the timer ("Nothing was deleted"). |
| D2 | **Leaving the page commits a pending delete immediately** (the effect cleanup flushes the timer). A confirmed intent is never silently lost by navigation. |
| D3 | **Delete account requires typing the exact username**; the button stays disabled until it matches, and the server re-checks `confirmUsername` (400 otherwise). It deletes all messages, then the user, then the client signs out to `/`. |
| D4 | **Hard deletes**, no soft-delete flags or retention window. |
| D5 | **Username changes take effect immediately with no redirect** from the old link. The dialog warns "The old link stops working". The session token is refreshed (`useSession().update`) and the router refreshed. |

## Considered options

- **Server-side soft delete with a restore endpoint** (for undo). Rejected for now: every inbox query would need a `deletedAt` filter and a purge job. A client timer gives the same undo for the realistic case (an accidental click), with no schema change.
- **Email confirmation for account deletion.** Rejected: friction without much benefit, since the user is already authenticated and must type their username.
- **Redirect old usernames** (alias table). Rejected: it would keep pointing visitors at a person who chose to rename (often precisely to break an old link), and it would block that name from being claimed by others.

## Consequences

- If the tab crashes during the undo window, nothing is deleted (the timer dies with it). This is the safe failure.
- Tests cover the three paths (undo, timer, unmount) and the typed confirmation (`use-danger-zone.controller.test.ts`, `DeleteAccountModal` stories).
- Freed usernames become available immediately to anyone.

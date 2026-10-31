# ADR 0034: Confirmed Message Deletes, Undo Only for Delete All, Toast Lifecycle Commits and Phone Dashboard Chrome

## Status
**Accepted** (2026-10-25, revised 2026-10-31). Extends [ADR 0027](0027-destructive-account-actions-undo-window-and-typed-confirmation.md) (undo window) and [ADR 0021](0021-optimistic-inbox-mutations-close-first-and-shared-cache-helpers.md) (optimistic inbox mutations), and records how phone screens diverge from desktop.

The first version of this ADR made single deletes undo-first (no dialog, a 10 s Undo toast) and gave bulk deletes a confirm plus Undo, as the design handoff shows. The product owner reversed that on 2026-10-31: **every message delete asks first, and only Delete all in Danger zone keeps an Undo.** D1 and D2 below are the revised decisions.

---

## Context

The Claude Design handoff (v2) specifies:

- **Single delete has no dialog** ("Delete · Undo for 10s" in the More actions sheet, a "Message deleted · Undo" toast on the Feedback board).
- **Bulk delete asks first, then still offers Undo** ("Delete 2 messages? … You'll have 10 seconds to undo.", MobAlertDelete).
- **Toasts** are one line on the popover surface with a coloured icon and at most one action; Undo toasts carry a 3px bar showing the time left. Per-type durations (success 3 s, info/warning 5 s, errors until dismissed or retried) and assertive announcements for errors only.
- **Phones** get their own chrome: a 52px top bar with the brand tile plus page-specific actions (Inbox: Search + Select; Profile: View as visitor; Quarantined: a back arrow instead of the brand), a pill tab bar, a selection header + bottom action bar, Settings as a grouped list, Profile as a compact identity row.

The product owner prefers an explicit confirmation for every delete. An Undo hold on single and bulk deletes also kept "deleted" messages in the counts until the toast closed, and a tab closed during the window silently kept the message.

## Decisions

| # | Decision |
| :-- | :--- |
| D1 | **Single delete = confirm dialog, then delete. No Undo.** `DeleteMessageModal` ("Delete this message? … This can't be undone.") opens from the trash icon, the phone sheet or `#`. Confirming closes the dialog first and deletes optimistically (ADR 0021); a failure restores the card with an error toast. |
| D2 | **Bulk delete = confirm (`DeleteSelectedModal`), then delete. No Undo.** The dialog counts public answers that go too ("One has a public answer on your profile, so that answer goes too. This can't be undone."). "Delete all quarantined" uses the same dialog for every loaded message in that view. The request is `POST /api/messages/bulk` with `action: "delete"`, optimistic with rollback. |
| D3 | **Delete all (Danger zone) keeps confirm + a 10 s Undo, and the commit follows the toast's lifecycle.** `showUndoToast` (`patterns/undo-toast`) runs exactly one of `onUndo` / `onCommit`; `onCommit` fires from Sonner's `onAutoClose` or `onDismiss`. The bar pauses with Sonner's timer (`in-data-[expanded=true]`), so what the user sees is what happens. |
| D4 | **Leaving the page still commits** (ADR 0027 D2): unmount dismisses the pending toast, which commits it. |
| D5 | **Undo toasts are normal Sonner toasts with a custom `action`** (`UndoToastAction`: the Undo button + the absolutely positioned bar). Not `toast.custom()`: in Sonner 2.0.8 custom JSX renders inside `[data-title]`, which breaks the one-line layout. All toasts are `unstyled` and take the design surface from the `Toaster`'s `classNames`, because Sonner's own CSS is unlayered and beats Tailwind utilities. `richColors` is off. |
| D6 | **App code toasts through `notify`** (`elements/sonner/notify.ts`), not Sonner directly. It applies the design durations (`TOAST_DURATION_MS`: success 3 s, info/warning 5 s, error 6 s, or until dismissed when the error carries an action) and repeats errors in an assertive live region the `Toaster` renders; success/info stay in Sonner's polite region. |
| D7 | **Phones mount different chrome, not hidden duplicates.** Below 768 px (`useIsMobile`) blocks render the phone branch (Settings list, Profile summary, Inbox selection mode) as a JS conditional, so `useId` form-control ids never repeat. Pages place top-bar controls through `MobileHeaderActions` / `MobileHeaderLeading` portals (`patterns/mobile-header-actions`), provided by the shell. Message Acceptance and Sign out live in Settings on phones (the top bar has no avatar/sheet). |
| D8 | **Tablet widths (768-1023 px) start on the icon rail**; crossing into `lg` opens the full sidebar. Only crossings toggle it, so a manual collapse on desktop sticks. |

## Considered options

- **Undo-first single delete and confirm + Undo bulk delete (the design).** Shipped in the first version of this ADR, then rejected by the product owner: one consistent "ask first" rule for message deletes, counts that are right straight away, and nothing held in a tab that might close.
- **Server-side soft delete for undo.** Still rejected for the reasons in ADR 0027 (a `deletedAt` filter on every query plus a purge job).
- **Separate `/dashboard/quarantined` route.** Rejected for now: the Quarantined filter already scopes data, counts and selection server-side (ADR 0030), so the view is a presentation of that filter (title, notice, back arrow on phones) instead of a second data path.
- **CSS-only responsive variants (`hidden sm:block` both trees).** Rejected for form-heavy screens: duplicated `id`s and doubled event handlers. Landing sections, which have no form ids to repeat, do use CSS-only variants so the server-rendered page doesn't change after hydration.

## Consequences

- Single and bulk deletes are immediate once confirmed; the dialog copy says "This can't be undone."
- The reversible-action rule ("Undo toast for reversible actions, AlertDialog only for irreversible or bulk ones") now reads, for messages: **deletes are irreversible and always confirm**; archive, star, read and block toggles stay one tap (archive and block show a plain toast).
- Delete all keeps ADR 0027's behaviour: if the tab dies during the window, nothing is deleted (the safe failure).
- Quarantined Messages show their reason ("Hurtful language", "Spam", "Threat") from the stored `quarantineReason`; messages held before that field existed show "Quarantined".

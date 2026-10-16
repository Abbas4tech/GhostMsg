# ADR 0029: Daily Digest Scheduling and Alert Privacy Fixes

## Status
**Accepted** (2026-10-14). Implements the "daily" email frequency that [ADR 0026](0026-notification-delivery-policy-quiet-hours-and-hidden-previews.md) D6 left unbuilt, and closes the alert and export leaks recorded as K1–K3 in [Chapter 17](../17-trust-safety-and-privacy.md).

---

## Context

Writing the documentation surfaced three places where code broke the product's own promises:

- **K1:** "Export all (JSON)" serialised whole message DTOs, including `senderHash`, while the Settings copy says Sender Hashes are not included.
- **K2:** The live in-app toast showed the first 40 characters of every new message, including quarantined ones, and ignored "Hide message text".
- **K3:** "Daily digest" could be selected but nothing ever sent it.

A fourth issue appeared while fixing them: with hidden text (the default), the instant alert email put the placeholder "New Anonymous Message" inside the quote box, as if a sender had written it, and still showed the tone. Its button also linked to a hard-coded `ghostmsg.app` domain.

## Decisions

| # | Decision |
| :-- | :--- |
| D1 | **Exports are an allow-list.** `toMessageExportRecord` (`src/lib/messages/export.ts`) writes `id, content, sentimentTag, createdAt, isRead, isPinned, isQuarantined, reply`. Any new DTO field stays out until it's added on purpose. |
| D2 | **The live toast follows the alert rules.** `buildLiveMessageToast` (`src/data/messages/use-live-messages.utils.ts`) returns nothing for quarantined messages and a text-free title when `hideMessageText` is on. The inbox controller passes the recipient's setting to `useLiveMessages`. |
| D3 | **Hidden-text emails say so instead of quoting a placeholder.** `sendMessageAlertEmail` takes `preview: string \| null`; `null` renders a neutral sentence with no quote box and no tone. Email links use `APP_URL` (from `NEXTAUTH_URL`). |
| D4 | **The digest runs from a scheduler-only route**, `GET /api/cron/daily-digest`, triggered by **Vercel Cron** (`vercel.json`, daily at 17:00 UTC) and authorised with `Authorization: Bearer ${CRON_SECRET}`, checked in constant time (`isBearerTokenValid`). Without `CRON_SECRET` the route answers 503. |
| D5 | **A digest covers "since the last digest"**, stored as `User.lastDigestSentAt`. A first digest covers 24 hours; a window never reaches back more than 7 days. Only non-quarantined messages count. |
| D6 | **Quiet hours and failures roll over.** A recipient inside quiet hours at run time is skipped without moving their window, so those messages join the next digest. A failed send also keeps the window, so the next run retries. Empty windows send nothing. |
| D7 | **Hidden text applies to digests.** With `hideMessageText` on (default) the digest shows only the count; otherwise up to three previews (80 characters) with their Sentiment Tags. |
| D8 | **Logic is pure and injected.** `runDailyDigest(deps, now)` (`src/server/notifications/daily-digest.ts`) takes `loadRecipients / loadNewMessages / sendDigest / markSent`; `createMongoDigestDeps()` wires MongoDB and SMTP. The policy is unit-tested with fakes. |

## Considered options

- **Send digests at each recipient's local evening.** Needs an hourly cron (paid plans) and a stored zone for every recipient; quiet-hours zones are only stored by people who set quiet hours. Deferred: one fixed UTC run is predictable and free-tier compatible.
- **A job queue (BullMQ, Inngest, QStash).** Rejected for now: new infrastructure for one daily batch. The injected-deps design lets the batch move to a queue later.
- **Mark the window on every run even when nothing is sent.** Rejected: moving the window during quiet hours or after a failed send would silently drop messages from the digest.

## Consequences

- New env var `CRON_SECRET` (set it in Vercel; Vercel Cron sends it automatically). Without it digests are off, safely.
- New field `User.lastDigestSentAt` (default `null`, server-only, never returned by the API).
- The run is sequential per recipient; at large scale, page through recipients or move to a queue (the deps boundary is the seam).
- Tests: `daily-digest.test.ts`, `send-daily-digest-email.test.ts`, `send-message-alert-email.test.ts`, `use-live-messages.utils.test.ts`, `export.test.ts`, `security.test.ts` (`isBearerTokenValid`).

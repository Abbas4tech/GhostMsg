# ADR 0026: Notification Delivery Policy: Quiet Hours and Hidden Previews

## Status
**Accepted** (2026-10-14). Extends [ADR 0020](0020-web-push-delivery-vapid-and-subscription-lifecycle.md) (Web Push) and the email alerts of [ADR 0011](0011-openapi-sdk-smtp-mailer-and-sender-unblocking.md).

---

## Context

Alerts showed the first 80 characters of every message on lock screens and in email previews, at any hour. Anonymous messages can be personal or unkind, and phones are seen by others. The redesign asked for **Hide message text in notifications** and **Quiet hours**.

## Decisions

| # | Decision |
| :-- | :--- |
| D1 | A pure **delivery policy** module (`src/server/notifications/delivery-policy.ts`): `isWithinQuietHours(date, quietHours)` and `buildAlertPreview(content, hideText)`. `send-message` asks it before every email and push. |
| D2 | **Hidden text is the default** (`hideMessageText: true`, also for existing users through read-side defaults). Hidden alerts say "New Anonymous Message". |
| D3 | **Quiet hours are wall-clock times in an IANA zone** stored with the window (`{ enabled, start, end, timeZone }`). The browser's zone is saved whenever the Recipient edits quiet hours. Windows may cross midnight; `start == end` means off; an invalid zone falls back to UTC. |
| D4 | **Suppress, don't queue.** Messages inside quiet hours are stored and appear in the inbox (and the live feed), but no email or push is sent for them later. |
| D5 | **Quarantined messages never alert**, regardless of settings. |
| D6 | *(Superseded by [ADR 0029](0029-daily-digest-scheduling-and-alert-privacy-fixes.md): the daily digest now runs from Vercel Cron.)* `daily` email frequency stayed a stored preference without a sender until a scheduler existed. |

## Considered options

- **Store quiet hours in UTC.** Rejected: daylight-saving changes would shift the window twice a year.
- **Queue suppressed alerts and send a summary when quiet hours end.** Deferred: needs the same scheduler as the daily digest; the two should be built together.
- **Default to showing text (opt-in privacy).** Rejected: the safer default matches the product promise of calm, private notifications.

## Consequences

- Existing users' alerts become text-free after this release until they opt in (called out in [Chapter 19](../19-redesign-change-summary.md)).
- The live in-app toast now follows the same rules (no toast for quarantined messages, no text when hidden); fixed in [ADR 0029](0029-daily-digest-scheduling-and-alert-privacy-fixes.md).
- A Recipient who travels keeps quiet hours in the zone where they last saved them.

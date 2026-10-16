---
"ghostmsg": minor
---

Browser push notifications actually work now, per device, and heal themselves when a subscription expires.

- **Fix:** push was previously non-functional end to end: no real VAPID keypair (the client fell back to a demo key the server never had the private half of), and subscriptions were silently discarded by Mongoose strict mode before anything could ever be sent.
- **Delivery:** new `src/server/push/web-push.ts` sends to every one of a recipient's devices in parallel when a new message arrives, fire-and-forget (never blocks the send response), and prunes subscriptions the push service reports as gone (404/410).
- **API:** new `DELETE /api/user/push-subscription`; `POST` now validates the payload and dedupes by endpoint so a resubscribed device never duplicates.
- **Env:** `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, optional `VAPID_SUBJECT`. Without them the app runs fine; Settings reports push as unconfigured and the server just skips sending.
- **UX:** actionable error messages (blocked, HTTPS required, stale subscription, push service refused) instead of raw `DOMException` text. Push is tracked and toggled per device, not per account.
- **Docs:** ADR 0020, Chapter 9 production checklist.

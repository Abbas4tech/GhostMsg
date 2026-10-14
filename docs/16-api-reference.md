# Chapter 16: API Reference

Every HTTP endpoint: purpose, auth, request, response, errors and side effects, plus the client hook that calls it. The machine-readable contract is the OpenAPI 3.1 document built from Zod in [`src/server/openapi/openapi.ts`](../src/server/openapi/openapi.ts), served at `/api/openapi.json` and browsable at **`/docs`** (Scalar). This chapter adds the behaviour the schema can't express.

How the contract is produced and consumed is covered in [Chapter 4](04-api-and-type-safety.md) and [agents/api-patterns.md](agents/api-patterns.md).

---

## 1. Conventions

| Topic | Rule |
| :--- | :--- |
| **Base** | Same-origin Next.js route handlers under `src/app/api/**/route.ts`. Node runtime except `/api/suggest-messages` (Edge). |
| **Auth** | NextAuth JWT session cookie. Protected routes call `getServerSession(authOptions)` and answer **401** `{ success: false, message: "Not authenticated" }` when there is no `session.user._id`. Only `/dashboard/*` pages are guarded by middleware; API routes guard themselves. |
| **Envelope** | Every JSON response has `success: boolean`. Errors add `message: string`. Successful responses add the resource (`profile`, `preferences`, `messages`, …) and sometimes a `message`. |
| **Validation** | Bodies are parsed with Zod `safeParse`. Failure → **400** with the first issue's message (or a fixed "Invalid …" string). |
| **Status codes** | 200 OK · 201 Created (sign-up) · 400 invalid input or confirmation mismatch · 401 no session (or wrong cron secret) · 404 unknown user/message, or recipient not accepting (send-message) · 409 username taken (change username) · 429 rate limited · 500 unexpected (logged with `console.error`) · 503 cron not configured. |
| **Ownership** | Message routes always filter by `recipientId: session.user._id`; a message you don't own is a 404, never a 403 (no existence leak). |
| **Client** | Only through the typed SDK: `clientFetch(api.GET("/api/…"))` from `@/data/api-client` inside `src/data/**` hooks. Never `fetch()` or `axios` ([AGENTS.md](../AGENTS.md)). `clientFetch` throws `ApiError` (with the server `message` and HTTP `status`) for non-2xx responses. |
| **Types** | `pnpm typegen` writes `src/generated/api-schema.d.ts`; client aliases live in `src/types/api.ts` (`MessageDto`, `UserProfileDto`, `UserPreferencesDto`, `QuietHoursDto`, `BlockedSenderDto`, `QuarantineSensitivity`, …). |

## 2. Endpoint index

| Tag | Method & path | Auth | Summary |
| :--- | :--- | :---: | :--- |
| Auth & verification | `GET /api/check-username-unique?username=` | — | Username format + availability |
| | `POST /api/sign-up` | — | Create account, email Verification Code |
| | `POST /api/verify-code` | — | Verify the 6-digit code |
| | `GET/POST /api/auth/*` | — | NextAuth (credentials + Google) |
| Anonymous messaging | `POST /api/send-message` | — | Submit an Anonymous Message (rate limited, moderated) |
| | `GET /api/suggest-messages` | — | AI Suggested Messages (Edge) |
| Public Q&A | `GET /api/public/{username}/answers` | — | Public profile + published answers |
| | `POST /api/messages/{messageId}/reply` | ✓ | Save / publish an answer |
| Inbox | `GET /api/get-messages?status=&q=&limit=&cursor=` | ✓ | One page of one filter (server-side filter, search, keyset paging) |
| | `GET /api/messages/counts` | ✓ | **New.** Count per filter + total |
| | `PATCH /api/messages/{messageId}` | ✓ | Star / read |
| | `POST /api/messages/bulk` | ✓ | Bulk read / star / delete |
| | `DELETE /api/delete-message/{messageId}` | ✓ | Delete one message |
| | `GET /api/messages/stream` | ✓ | SSE live feed |
| | `GET/POST /api/accept-message` | ✓ | Message Acceptance |
| Abuse prevention | `GET/POST/DELETE /api/block-sender` | ✓ | Blocklist |
| AI assistant | `POST /api/ai/smart-reply` | ✓ | Draft an answer in a tone |
| | `POST /api/ai/ama-suggestions` | ✓ | **New.** AMA Prompt ideas |
| Profile & settings | `GET/PATCH /api/user/profile` | ✓ | **New.** Display name, photo, AMA banner switch |
| | `PATCH /api/user/username` | ✓ | **New.** Change username |
| | `PATCH /api/user/ama-prompt` | ✓ | AMA Prompt text (legacy; the app saves it via `PATCH /api/user/profile`) |
| | `GET/PATCH /api/user/preferences` | ✓ | **New.** Messages + Safety settings |
| | `GET/PATCH /api/user/notifications` | ✓ | Email, push, **hidden text, quiet hours** |
| | `POST/DELETE /api/user/push-subscription` | ✓ | Web Push device subscription |
| | `DELETE /api/messages` | ✓ | **New.** Delete every message |
| | `DELETE /api/user` | ✓ | **New.** Delete account |
| Operations | `GET /api/cron/daily-digest` | Bearer `CRON_SECRET` | **New.** Send the daily digest emails (scheduler only) |
| Docs | `GET /api/openapi.json`, `GET /docs` | — | Contract and Scalar UI |

## 3. Auth & verification

### `GET /api/check-username-unique?username=maya_writes`
Validates with `usernameValidation` (2–20 chars, `[a-zA-Z0-9_]`). **200** `{ success: true, message: "Username is unique" }`; **400** for format errors or "Username is already taken". Client: `authQueries.checkUsername` (debounced via `lib/users/username-availability.ts`), used by sign-up **and** Change username.

### `POST /api/sign-up`
Body `{ username, email, password (≥6) }`. Creates or refreshes an unverified user, hashes the password (bcrypt, 10 rounds), sets a 6-digit code valid for **1 hour**, and emails it over SMTP. **201** on success; **400** if the username is taken by a verified user or the email is registered.

### `POST /api/verify-code`
Body `{ username, code }` (6 digits). **200** when correct and unexpired (`isVerified = true`); **400** incorrect or expired; **404** unknown user.

## 4. Anonymous messaging

### `POST /api/send-message`

```json
{ "username": "maya_writes", "content": "What's the bravest thing you've done this year?" }
```

| Outcome | Status | Body |
| :--- | :--- | :--- |
| Delivered (or silently dropped because the sender is blocked) | 200 | `{ "success": true, "message": "Message sent successfully!" }` |
| Content not 10–300 chars | 400 | "Message content must be between 10 and 300 characters" |
| Unknown username | 404 | "Recipient not found" |
| Recipient paused | 404 | "Recipient is not accepting messages at this time" |
| More than 5 sends per IP per 10 minutes | 429 | "Too many messages sent…" |

Side effects, in order: rate limit → Sender Hash → blocklist check (silent 200) → moderation (`toxicity`, `sentimentTag`) → `shouldQuarantine` → create Message → publish SSE event → email (instant, if allowed) → Web Push (if allowed). Alerts are skipped for quarantined messages and inside quiet hours. With `hideMessageText` (default) push says "New Anonymous Message" and the email shows a neutral sentence without text or tone. Full diagram: [Chapter 17 §3](17-trust-safety-and-privacy.md#3-the-send-pipeline). Client: `useSendMessageMutation`.

### `GET /api/suggest-messages` (Edge)
**200** `{ success: true, messages: "q1||q2||q3" }`, a single string split by `||` on the client. Falls back to a fixed set without an AI key or on error (still 200). Client: `publicQueries.suggestions()` (a cached query, no retries, failure toasted once; "New ideas" refetches); only enabled when the profile's `offerSuggestions` is true.

## 5. Public Q&A

### `GET /api/public/{username}/answers`

```json
{
  "success": true,
  "username": "maya_writes",
  "amaPrompt": "Ask me anything about moving countries for work.",
  "displayName": "Maya",
  "avatarUrl": null,
  "showAmaBanner": true,
  "offerSuggestions": true,
  "isAcceptingMessages": true,
  "answers": [
    { "_id": "…", "content": "…", "sentimentTag": "curious",
      "reply": { "text": "…", "publishedAt": "2026-10-01T09:00:00.000Z" },
      "createdAt": "2026-09-30T18:00:00.000Z" }
  ]
}
```

Up to 50 published answers, newest published first. **404** "User not found" (the page renders its not-found state and does not retry). `displayName` is omitted when empty. Client: `messagesQueries.publicAnswers(username)`.

### `POST /api/messages/{messageId}/reply`
Body `{ text (1–1000), isPublished }`. Sets `reply` (and `publishedAt` when published) and marks the message **read**. **404** if not yours. Client: `useReplyMessageMutation` (optimistic with rollback; Smart Reply save).

## 6. Inbox

### `GET /api/get-messages`
One page of one inbox filter, filtered and searched on the server ([ADR 0030](adr/0030-server-side-inbox-filtering-paging-and-counts.md)).

| Param | Values |
| :--- | :--- |
| `status` | `all` (default: not quarantined) · `unread` · `starred` · `quarantined` · `answered` · `any` (every message, for exports) |
| `q` | Case-insensitive literal match on the message **or its answer** (regex characters are escaped) |
| `limit` | 1–100, default 30 |
| `cursor` | `nextCursor` from the previous page (`"<ISO createdAt>_<id>"`) |

**200** `{ success, messages: MessageDto[], total, nextCursor }`: newest first (`createdAt`, then `_id`); `total` counts everything matching the filter + search; `nextCursor` is `null` on the last page. **400** for an unknown status or a malformed cursor. Each `MessageDto` includes `senderHash` (for blocking) and `reply`. Client: `messagesQueries.inbox({ status, q })` (`useInfiniteQuery`), `fetchAllMessages(status)` (exports).

### `GET /api/messages/counts` *(new)*
**200** `{ success, counts: { all, unread, starred, answered, quarantined, total } }` from one aggregation (`total` includes quarantined). Client: `messagesQueries.counts()` (inbox badges, sidebar unread badge, "Delete all N").

### `PATCH /api/messages/{messageId}`
Body `{ isPinned?, isRead? }`. **200** with the updated message. Client: `useUpdateMessageMutation` (optimistic with rollback, silent on success). The inbox sends `isRead: true` when the recipient replies, opens the Story Card, reveals or stars an unread message.

### `POST /api/messages/bulk`
Body `{ action: "read" | "star" | "delete", ids: string[] (≥1) }`. Invalid ObjectIds are dropped; updates are scoped to the Recipient. Client: `useBulkActionMutation` (optimistic, shared cache helpers in `messages-cache.ts`).

### `DELETE /api/delete-message/{messageId}`
**200** or **404**. Client: `useDeleteMessageMutation` (close-first dialog + optimistic removal, [ADR 0021](adr/0021-optimistic-inbox-mutations-close-first-and-shared-cache-helpers.md)).

### `GET /api/messages/stream` (SSE)
`text/event-stream`. Events: `ping` on connect and every 30 s; `new_message` with `{ _id, content, sentimentTag, isQuarantined, isPinned, isRead, createdAt }` for each new message to this Recipient. **401** plain text without a session. Client: `useLiveMessages()` (EventSource → toast + invalidate the `messages` queries; reconnects 5 s after an error). See [Chapter 18](18-notifications-and-realtime.md).

### `GET /api/accept-message` · `POST /api/accept-message`
GET → `{ success, isAcceptingMessage }`. POST body `{ acceptMessages: boolean }`. Client: `userQueries.acceptance()`, `useAcceptMessageMutation` (sidebar, Settings, ⌘K).

## 7. Abuse prevention: `/api/block-sender`

| Method | Body | Effect | Response |
| :--- | :--- | :--- | :--- |
| `GET` | — | — | `{ success, blockedSenderHashes: string[], blockedSenders: { hash, blockedAt? }[] }` |
| `POST` | `{ senderHash }` | `$addToSet` hash; `$push { hash, blockedAt }` only if not already recorded (keeps the first date) | `{ success, message }` |
| `DELETE` | `{ senderHash }` or `{ senderHash: "ALL" }` | `$pull` from both arrays, or clear both | `{ success, message }` |

Client: `userQueries.blockedSenders()`, `useBlockSenderMutation`, `useUnblockSenderMutation`.

## 8. AI assistant

### `POST /api/ai/smart-reply`
Body `{ content, tone: "witty" | "wholesome" | "thoughtful" (default wholesome) }` → `{ success, reply }`. Client: `useSmartReplyMutation`.

### `POST /api/ai/ama-suggestions` *(new)*
Body `{ currentPrompt? (≤120) }` → `{ success, suggestions: string[3] }`. Gemini 2.5 Flash Lite riffs on the current prompt; without `GOOGLE_AI_STUDIO_SECRET` or on error it returns three fixed ideas (still 200). Client: `useAmaSuggestionsMutation` ("Suggest with AI" on the Profile page).

## 9. Profile & settings *(new in this release unless noted)*

### `GET /api/user/profile` · `PATCH /api/user/profile`

```json
// PATCH body: every field optional
{ "displayName": "Maya", "avatarUrl": "data:image/webp;base64,UklGR…",
  "amaPrompt": "Ask me about design", "showAmaBanner": false }
```

```json
// 200 (GET and PATCH)
{ "success": true, "message": "Profile updated",
  "profile": { "username": "maya_writes", "email": "maya@example.com", "displayName": "Maya",
               "avatarUrl": "data:image/webp;base64,…", "amaPrompt": "…", "showAmaBanner": false } }
```

`avatarUrl: null` removes the photo. `amaPrompt` (1–120 after trim) is saved in the same request. Validation: `displayName` ≤ 40 after trim; `avatarUrl` must match `data:image/(png|jpeg|webp);base64,…` and be ≤ 350,000 chars ("Photo is too large"). GET **404** if the user document is gone. Client: `userQueries.profile()`, `useUpdateProfileMutation` (optimistic).

### `PATCH /api/user/username`
Body `{ username }` (sign-up rules). **409** "Username is already taken" (another user); **200** `{ success, message, username }`. The old `/u/<old>` link stops resolving immediately. The client then calls `useSession().update({ username })` (the NextAuth `jwt` callback copies it into the token on `trigger === "update"`) and `router.refresh()`. Client: `useChangeUsernameMutation`.

### `PATCH /api/user/ama-prompt` *(legacy)*
Body `{ amaPrompt }` (≤120) → `{ success, message: "AMA prompt updated successfully!", amaPrompt }`. Kept for compatibility; the Profile page sends `amaPrompt` inside `PATCH /api/user/profile` so Save is one atomic request ([ADR 0031](adr/0031-state-management-consistency-and-structure.md)).

### `GET /api/user/preferences` · `PATCH /api/user/preferences`

```json
// PATCH body: any subset
{ "safety": { "sensitivity": "strict" } }
```

```json
// 200
{ "success": true, "message": "Preferences updated",
  "preferences": {
    "messages": { "offerSuggestions": true, "publishByDefault": false },
    "safety": { "quarantineEnabled": true, "sensitivity": "strict", "blurSpicy": false } } }
```

Writes dot paths (`safetySettings.sensitivity`) so siblings are never reset. Client: `userQueries.preferences()`, `useUpdatePreferencesMutation` (optimistic). Consumers: Settings, `use-inbox` (`blurSpicy` → `concealSpicy`, `publishByDefault`), public profile (`offerSuggestions` via the answers endpoint).

### `GET /api/user/notifications` · `PATCH /api/user/notifications` *(extended)*

```json
// PATCH body: any subset
{ "hideMessageText": true,
  "quietHours": { "enabled": true, "start": "22:00", "end": "08:00", "timeZone": "Europe/London" } }
```

GET → `{ success, notificationSettings: { emailAlerts, webPushEnabled, hideMessageText, quietHours }, isAcceptingMessage }`. Times are `HH:MM` 24-hour; `timeZone` is an IANA name (1–64 chars). Client: `userQueries.notifications()`, `useNotificationSettingsMutation` (optimistic).

### `POST /api/user/push-subscription` · `DELETE /api/user/push-subscription`
POST body = the browser's `PushSubscription` JSON `{ endpoint (URL), keys: { p256dh, auth } }`; replaces any record with the same endpoint and sets `webPushEnabled: true`. DELETE body `{ endpoint }` removes that device only; the server sets `webPushEnabled: false` once **no** device remains (`disablePushWhenNoDevices`, also after pruning gone endpoints). The Settings switch reflects this browser's subscription ([ADR 0020](adr/0020-web-push-delivery-vapid-and-subscription-lifecycle.md), [ADR 0030](adr/0030-server-side-inbox-filtering-paging-and-counts.md)).

### `DELETE /api/messages`
No body. Deletes every message of the Recipient (public answers included). **200** `{ success, message: "All messages deleted", deletedCount }`. The client delays this call by 10 s behind an Undo toast. Client: `useDeleteAllMessagesMutation`.

### `DELETE /api/user`
Body `{ confirmUsername }`; must equal the account's username exactly, else **400** "Type your username exactly to confirm". Deletes all the user's messages, then the user. **200** → the client calls `signOut({ callbackUrl: "/" })`. Client: `useDeleteAccountMutation`.

## 10. Operations: `GET /api/cron/daily-digest` *(new)*

Scheduler-only route, called daily by Vercel Cron (`vercel.json`, `0 17 * * *`). Not used by the client and not in the data layer.

| Request | Outcome |
| :--- | :--- |
| `CRON_SECRET` unset on the server | **503** "Daily digest is not configured" |
| Missing or wrong `Authorization: Bearer <CRON_SECRET>` (constant-time check) | **401** |
| Authorised | **200** `{ success: true, considered, sent, empty, skippedQuietHours, failed }` |
| Unexpected error | **500** |

Side effects: one digest email per recipient with `emailAlerts = "daily"` and new non-quarantined messages since their last digest; sets `lastDigestSentAt` after each accepted email. Recipients inside quiet hours are skipped and their messages roll over. Details: [Chapter 18 §3.1](18-notifications-and-realtime.md#31-daily-digest-adr-0029), [ADR 0029](adr/0029-daily-digest-scheduling-and-alert-privacy-fixes.md).

## 11. Client data-layer map

Settings-like mutations (acceptance, notifications, preferences, profile) are built with `useOptimisticResourceMutation` (`src/data/optimistic-resource-mutation.ts`): optimistic, serialised per resource, silent on success, rollback + toast on error ([ADR 0031](adr/0031-state-management-consistency-and-structure.md)). Pages never call endpoints directly; controllers use these hooks ([ADR 0006](adr/0006-standardized-api-calling-and-react-query-architecture.md), [ADR 0018](adr/0018-source-structure-server-data-lib-utils-controllers-tests.md)).

| Query key | `queryOptions` / hook | Endpoint | Optimistic | Used by controllers |
| :--- | :--- | :--- | :---: | :--- |
| `["messages","list",{status,q}]` | `messagesQueries.inbox({ status, q })` (infinite) | `GET /api/get-messages` | — | inbox |
| `["messages","counts"]` | `messagesQueries.counts()` | `GET /api/messages/counts` | — | inbox (badges), dashboard-shell (unread), settings ("Delete all N") |
| — | `fetchAllMessages(status)` (not cached) | `GET /api/get-messages` pages | — | settings ("Export all") |
| `["public","answers",u]` | `messagesQueries.publicAnswers(u)` | `GET /api/public/{u}/answers` | — | public-answers |
| `["user","acceptance"]` | `userQueries.acceptance()` / `useAcceptMessageMutation` | `/api/accept-message` | ✓ | dashboard-shell, settings, profile |
| `["user","notifications"]` | `userQueries.notifications()` / `useNotificationSettingsMutation` | `/api/user/notifications` | ✓ | settings |
| `["user","blocked-senders"]` | `userQueries.blockedSenders()` / block + unblock mutations | `/api/block-sender` | — | settings, inbox |
| `["user","profile"]` | `userQueries.profile()` / `useUpdateProfileMutation` | `/api/user/profile` | ✓ (factory) | profile, dashboard-shell (avatar), settings (email) |
| `["user","preferences"]` | `userQueries.preferences()` / `useUpdatePreferencesMutation` | `/api/user/preferences` | ✓ | settings, inbox |
| `["auth","check-username",u]` | `authQueries.checkUsername(u)` | `/api/check-username-unique` | — | sign-up, change-username |
| — | `useChangeUsernameMutation` | `PATCH /api/user/username` | — | change-username |
| — | `useAmaSuggestionsMutation` | `/api/ai/ama-suggestions` | — | profile |
| — | `useDeleteAllMessagesMutation`, `useDeleteAccountMutation` | `DELETE /api/messages`, `DELETE /api/user` | — | danger-zone |
| — | `useReplyMessageMutation`, `useSmartReplyMutation` | reply, smart-reply | ✓ (reply) | smart-reply |
| — | `useUpdateMessageMutation`, `useBulkActionMutation`, `useDeleteMessageMutation` | message routes | ✓ | inbox |
| `["public","suggestions"]` | `publicQueries.suggestions()` | `GET /api/suggest-messages` | — | send-message |
| — | `useSendMessageMutation` | `POST /api/send-message` | — | send-message |
| — | `usePushSubscriptionMutation`, `useRemovePushSubscriptionMutation` (via `usePushNotification`) | push-subscription | — | settings |
| — | `useLiveMessages()` | SSE stream | — | inbox |

## 12. Mocks for every endpoint

Each endpoint has an MSW handler in `src/mock/handlers/*.handlers.ts`, typed by OpenAPI paths and fed by fixtures in `src/mock/fixtures/*`. Named **scenarios** switch behaviour in stories and controller tests: `scenarios.session.authenticated | unauthenticated | loading`, `scenarios.inbox.mixed | empty | allQuarantined | longContent | loading | error`, `scenarios.answers.some | none | paused | loading | error`, `scenarios.ai.default | none | loading | error`, `scenarios.settings.defaults | closedWithBlocks | usernameTaken`, `scenarios.username.available | taken`. Adding an endpoint without a handler fails tests (`onUnhandledRequest: "error"`).

## 13. Adding an endpoint (checklist)

1. **Schema:** Zod request/response in `src/schemas/<domain>-schema.ts` with `.openapi("Name")` and examples, plus a unit test for non-trivial rules.
2. **Contract:** `registry.registerPath({...})` in `src/server/openapi/openapi.ts` with a tag, summary, every status code; then `pnpm typegen`.
3. **Route:** `src/app/api/<path>/route.ts`: session check → `safeParse` → server modules (`src/server/**`) → envelope. Put logic worth testing in a server module with a colocated test.
4. **Data hook:** `src/data/<domain>/` query in `<domain>.queries.ts` (key in `query-keys.ts`) or `use-<verb>-mutation.ts`; toast on error; optimistic when it backs a switch.
5. **Mock:** MSW handler + fixture + scenario; controller test with `renderHookWithProviders` and `recordRequests()`.
6. **Docs:** a row in §2, a section here, and [Chapter 4](04-api-and-type-safety.md)'s operations matrix.

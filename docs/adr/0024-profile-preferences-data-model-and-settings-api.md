# ADR 0024: Profile & Preferences Data Model and the Settings API

## Status
**Accepted** (2026-10-14). Details the data side of [ADR 0023](0023-shadcn-first-elements-and-profile-settings-backend.md) (D9–D10). Builds on the embedded-settings pattern already used by `notificationSettings` and `pushSubscriptions` ([ADR 0020](0020-web-push-delivery-vapid-and-subscription-lifecycle.md)).

---

## Context

The redesigned Profile and Settings pages added about a dozen per-Recipient settings: display name, photo, banner switch, suggestion and publish defaults, quarantine controls, blur Spicy, hidden previews, quiet hours, and dated blocks. Every control had to work against a real API ("Build UI + backend"). Existing users had none of these fields.

## Decisions

| # | Decision | Why |
| :-- | :--- | :--- |
| D1 | **Embed settings in the `User` document** as small subdocuments: `messagePreferences`, `safetySettings`, `notificationSettings` (extended), and top-level `displayName`, `avatarUrl`, `showAmaBanner`. | They are always read with the user (`send-message` loads the user anyway), are tiny, and have no independent lifecycle. A separate `settings` collection would add a join to the hottest path. |
| D2 | **One endpoint per page section**: `/api/user/profile` (identity), `/api/user/preferences` (Messages + Safety), `/api/user/notifications` (existing, extended). | Each maps to one query key and one optimistic mutation, so a switch only invalidates its own section. |
| D3 | **Partial PATCH bodies written with dot-path `$set`** (`safetySettings.sensitivity`). | Writing a whole subdocument resets siblings, which is the bug a single-switch save would hit. Zod `.partial()` bodies keep requests tiny. |
| D4 | **Defaults twice: schema default + read-side DTO mapper** (`src/server/users/user-dto.ts`). | Old documents lack the subdocuments, and schema defaults are not a reliable read guarantee (`.lean()` reads, raw driver results, partial projections). The mappers make "the client never sees `undefined` sections" explicit and unit-tested, so no migration is needed. |
| D5 | **Avatar stored as a base64 data URL on the user** (PNG/JPEG/WebP, ≤ 350,000 chars), **resized in the browser** to 256px WebP (`lib/browser/resize-image.ts`). | Zero new infrastructure (no bucket, signed URLs, or CDN config) for a ≈15–40 KB image. The public answers endpoint already loads the user. |
| D6 | **`blockedSenders[{hash, blockedAt}]` added next to `blockedSenderHashes`**, which stays the lookup source. | The Settings table needs dates; `send-message` keeps its simple `includes(hash)` check. Re-blocking keeps the first date (`$push` guarded by `$ne`). |
| D7 | **Username change is a plain field update + session refresh** (`jwt` callback handles `trigger === "update"`). | The JWT carries `username`; without the refresh the sidebar and link would show the old name until re-login. |

## Considered options

- **Separate `UserSettings` collection:** rejected (D1). Adds a lookup on every send, and a second write path for deletion.
- **Object storage for avatars (S3/R2/Vercel Blob):** deferred. The right move if avatars grow (originals, multiple sizes) or the users collection's working set suffers. The swap is local: `avatarUrl` stays a URL string, only its scheme changes.
- **Server-side image processing (sharp):** rejected for now. The browser already has the file and a canvas; server processing would need a binary dependency on serverless.
- **A single `PATCH /api/user/settings` for everything:** rejected (D2). It couples unrelated optimistic caches and makes validation errors vague.

## Consequences

- The `users` document grows by up to ~350 KB when a photo is set. Projections (`.select(...)`) in the settings routes keep reads lean; avoid loading `avatarUrl` where it isn't shown.
- Every new setting must follow the checklist in [Chapter 15 §7](../15-data-model-and-database.md#7-changing-the-model-checklist): schema default, Zod partial, dot-path write, DTO default, fixture, MSW handler.
- Clients consume `UserProfileDto`, `UserPreferencesDto`, `QuietHoursDto`, `BlockedSenderDto` from `src/types/api.ts`.

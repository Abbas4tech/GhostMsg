# ADR 0011: Mandatory Type-Safe OpenAPI SDK, Nodemailer SMTP Mailer & Reversible Abuse Prevention

## Status
**Accepted**

---

## Context & Problem Statement
As GhostMsg evolved with complex real-time messaging, Web Push notifications, AI suggestions, and public Q&A capabilities, three architectural friction points emerged:

1. **API Type Safety & Drift**: Handcrafted `fetch()` calls across components bypassed TypeScript validation, leading to type drift, missing request bodies, and inconsistent error handling.
2. **Email Infrastructure Cost**: Dependency on the paid Resend SDK created deployment friction and vendor lock-in.
3. **Irreversible Sender Blocking**: Initial sender hash blocking (`POST /api/block-sender`) lacked an unblock mechanism or management UI. When a recipient (or self-tester) blocked a sender fingerprint, messages were shadowbanned forever without any way to view or reverse the block.

---

## Decision Drivers
1. **End-to-End Type Safety**: Guarantee that every client HTTP request matches the server Zod validation contract via automated OpenAPI 3.1 code generation.
2. **Zero-Cost Email Delivery**: Replace paid SaaS dependencies with standard, free SMTP providers (Gmail App Passwords, Brevo, Ethereal).
3. **Recipient Control & Autonomy**: Provide recipients complete visibility and control over blocked senders with reversible unblocking options.
4. **Resilient Browser Push**: Ensure Web Push subscriptions handle VAPID key conversion (`BufferSource`) and service worker readiness gracefully across browsers.

---

## The Decisions

### 1. Mandatory 4-Step OpenAPI 3.1 SDK Architecture
All client-side API requests **MUST** strictly follow the OpenAPI 4-step workflow. Native `fetch()` and `axios` are strictly banned codebase-wide.

```
Step 1: Zod Schemas (.openapi(...)) ──▶ Step 2: OpenAPIRegistry (src/lib/openapi.ts)
                                                      │
Step 4: Consumer (React Query + api.*) ◀── Step 3: pnpm typegen (api-schema.d.ts)
```

- **Execution**: Every endpoint is registered in `src/lib/openapi.ts`. Client code consumes APIs exclusively via `clientFetch(api.GET/POST/PATCH/DELETE(...))` wrapped inside React Query `queryOptions` or `useMutation` hooks.

### 2. Nodemailer SMTP Transporter & React Email
- Removed `resend` package completely from `package.json`.
- Created [`src/lib/mailer.ts`](file:///d:/Projects/GhostMsg/src/lib/mailer.ts) using Nodemailer configured via standard environment variables (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`).
- Render HTML email bodies using `@react-email/render` in [`send-verification-email.ts`](file:///d:/Projects/GhostMsg/src/helpers/send-verification-email.ts) and [`send-message-alert-email.ts`](file:///d:/Projects/GhostMsg/src/helpers/send-message-alert-email.ts).

### 3. Reversible Sender Unblocking & Blocklist Management
- **API Endpoints**:
  - `GET /api/block-sender`: Returns `{ success: true, blockedSenderHashes: string[] }`.
  - `POST /api/block-sender`: Adds a cryptographic sender hash (`$addToSet`).
  - `DELETE /api/block-sender`: Removes a `senderHash` (`$pull`), or clears all senders when `{ senderHash: "ALL" }` is passed (`$set: { blockedSenderHashes: [] }`).
- **UI Components**:
  - **Message Card**: Queries `userQueries.blockedSenders()`. Displays a **🚫 Blocked Sender** badge on blocked messages and replaces the block button with an **Unblock Sender** modal toggle.
  - **Settings Tab**: Includes a **Blocked Senders Management Card** displaying blocked fingerprints (`hash...1234`), individual unblock buttons, and an **Unblock All Senders** action.

### 4. Web Push Notification Fixes
- Implemented `urlBase64ToUint8Array` helper in [`src/components/dashboard/settings-tab.tsx`](file:///d:/Projects/GhostMsg/src/components/dashboard/settings-tab.tsx) to convert base64 VAPID public keys to `BufferSource` (`Uint8Array`) as required by the W3C Push API.
- Added `await navigator.serviceWorker.ready` before `pushManager.subscribe()` and implemented error toast notifications.

---

## Consequences

### Positive
- **Zero API Type Drift**: Any contract change in Zod schemas immediately fails TypeScript compilation on the frontend.
- **Zero-Cost Email Stack**: Flexible SMTP support with zero recurring SaaS costs.
- **Complete Recipient Safety Control**: Recipients can audit blocked senders and unblock them at any time.
- **Seamless Push Experience**: Device push notifications register reliably without silent browser exceptions.

### Negative & Mitigations
- **SMTP Setup Required**: Developers must set standard SMTP environment variables (`SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`) in `.env.local` (detailed in `docs/02-getting-started.md`).

---

## References & Code Pointers
- OpenAPI Registry: [`src/lib/openapi.ts`](file:///d:/Projects/GhostMsg/src/lib/openapi.ts)
- API Patterns Guide: [`docs/agents/api-patterns.md`](file:///d:/Projects/GhostMsg/docs/agents/api-patterns.md)
- Mailer Transporter: [`src/lib/mailer.ts`](file:///d:/Projects/GhostMsg/src/lib/mailer.ts)
- Block Sender Route: [`src/app/api/block-sender/route.ts`](file:///d:/Projects/GhostMsg/src/app/api/block-sender/route.ts)
- Settings Tab: [`src/components/dashboard/settings-tab.tsx`](file:///d:/Projects/GhostMsg/src/components/dashboard/settings-tab.tsx)

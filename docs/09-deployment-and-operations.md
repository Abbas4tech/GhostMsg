# Chapter 9: Deployment & Operations

This chapter covers deployment architecture on Vercel, MongoDB Atlas production clustering, SMTP email provider setup, and operational monitoring.

---

## 1. Production Deployment on Vercel

GhostMsg is optimized for deployment on the **Vercel Edge & Serverless Platform**:

### Runtime Distribution
- **Edge Functions**: [`/api/suggest-messages`](../src/app/api/suggest-messages/route.ts) runs on Vercel Edge Runtime for global low-latency AI responses ([ADR 0003](adr/0003-edge-runtime-for-ai-suggestions.md)).
- **Serverless Functions**: Database-backed API endpoints run on Node.js Serverless Functions with cached MongoDB connection pooling.

### Build Command
Vercel executes the production build:
```bash
pnpm build
# Runs: pnpm typegen && next build
```

Vercel detects pnpm from `packageManager` (`pnpm@10.29.1`) and `pnpm-lock.yaml`, the only lockfile. Storybook isn't part of the app deployment. `pnpm build-storybook` produces a separate static site in `storybook-static/` that can be hosted anywhere if needed.

---

## 2. Production Environment Variables Checklist

Ensure these variables are added in your Vercel Project Settings:

| Variable | Description |
| :--- | :--- |
| `MONGODB_URI` | Production MongoDB Atlas connection string with replica set. |
| `NEXT_AUTH_SECRET` | 32-byte secure base64 secret (`openssl rand -base64 32`). |
| `NEXTAUTH_URL` | Production public domain (e.g. `https://ghost-msg.vercel.app`). |
| `SMTP_HOST` | Production SMTP host server. |
| `SMTP_PORT` | Production SMTP port (e.g. 587 or 465). |
| `SMTP_USER` | Production SMTP authentication username. |
| `SMTP_PASS` | Production SMTP authentication password. |
| `GOOGLE_AI_STUDIO_SECRET` | Google AI Studio Gemini API key. |
| `GOOGLE_OAUTH_CLIENT_ID` | Google Cloud OAuth client ID (authorized redirect URI set to production domain). |
| `GOOGLE_OAUTH_CLIENT_SECRET` | Google Cloud OAuth client secret. |
| `GOOGLE_OAUTH_CALLBACK_URL` | `https://ghost-msg.vercel.app/api/auth/callback/google` |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | Web Push VAPID public key (`npx web-push generate-vapid-keys`). Exposed to the browser ([ADR 0020](adr/0020-web-push-delivery-vapid-and-subscription-lifecycle.md)). |
| `VAPID_PRIVATE_KEY` | Web Push VAPID private key. Server only; rotating it invalidates existing device subscriptions. |
| `VAPID_SUBJECT` | Optional `mailto:`/`https:` contact for push services (default `mailto:support@ghostmsg.app`). |
| `CRON_SECRET` | Bearer secret for the daily digest cron (`vercel.json` schedules `GET /api/cron/daily-digest` at 17:00 UTC). Vercel Cron sends it automatically; unset = digests off ([ADR 0029](adr/0029-daily-digest-scheduling-and-alert-privacy-fixes.md)). |
| `SENDER_PEPPER_SECRET` | HMAC pepper for Sender Hashes ([Chapter 17 §2](17-trust-safety-and-privacy.md#2-anonymity-model)). Set a dedicated random value; rotating it makes existing blocks stop matching. |

---

## 3. Database Operations & Connection Management

[`src/server/db/db-connect.ts`](../src/server/db/db-connect.ts) keeps a module-level connection flag so warm invocations reuse the Mongoose connection:

```typescript
const connection: { isConnected?: number } = {};

async function dbConnect(): Promise<void> {
  if (connection.isConnected) return;            // reuse on warm invocations
  const db = await mongoose.connect(process.env.MONGODB_URI || "");
  connection.isConnected = db.connections[0].readyState;
}
```

Indexes are declared on the Mongoose schemas ([Chapter 15 §3.1](15-data-model-and-database.md#31-indexes-and-the-queries-they-serve)); Mongoose builds missing ones on first connection. For large production collections, build new indexes ahead of a deploy in Atlas.

---

## 4. Process-local state (scaling note)

Two subsystems keep state **in the Node process**, not in a shared store:

| Subsystem | File | Effect with several instances (serverless) |
| :--- | :--- | :--- |
| Send rate limiter (5 per IP per 10 min) | `src/server/security/security.ts` | Each instance counts separately, so the effective limit is higher. |
| Live-message event bus (SSE) | `src/server/realtime/event-bus.ts` | A message stored on instance A reaches only SSE clients connected to A; others see it on the next refetch. |

Both sit behind small function signatures (`checkRateLimit`, `publishNewMessage`/`subscribeToMessages`) and can be swapped for a shared store such as Redis without touching callers ([Chapter 18 §5](18-notifications-and-realtime.md#5-live-feed-server-sent-events)). Email and Web Push are unaffected.

---

## 5. Scheduled jobs

| Job | Schedule (`vercel.json`) | Route | Auth |
| :--- | :--- | :--- | :--- |
| Daily digest email | `0 17 * * *` (17:00 UTC) | `GET /api/cron/daily-digest` | `Authorization: Bearer ${CRON_SECRET}` |

Run it by hand to test: `curl -H "Authorization: Bearer $CRON_SECRET" https://<host>/api/cron/daily-digest`. The response counts `considered, sent, empty, skippedQuietHours, failed`. Logs show per-recipient failures; a failed send retries on the next run.

---

## 6. Documentation assets

`storybook-static/` is a build artefact (git-ignored). Documentation screenshots are regenerated from it with `pnpm docs:screenshots` and committed under `docs/assets/screenshots/` ([ADR 0028](adr/0028-agent-first-documentation-system-and-generated-screenshots.md)).

---

## 7. Next Chapter
Proceed to [Chapter 10: Storybook & UI Catalog](10-storybook-and-ui-catalog.md).

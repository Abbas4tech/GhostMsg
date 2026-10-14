# Chapter 2: Getting Started & Local Setup

This chapter guides you through setting up GhostMsg on your local development machine.

---

## 1. Prerequisites

Ensure you have the following installed and configured:
- **Node.js**: `22.19+` recommended (Storybook 10 requires Node 20.16+ / 22.19+; the project is developed on Node 22)
- **Package Manager**: **pnpm 10** only (pinned via `packageManager`; `pnpm-lock.yaml` is the single lockfile)
- **MongoDB Database**: Local MongoDB instance or free cloud cluster at [MongoDB Atlas](https://www.mongodb.com/atlas)
- **SMTP Email Credentials**: Standard SMTP provider credentials (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`) for sending OTP verification & alert emails via Nodemailer
- **Google AI Studio Key**: API key from [Google AI Studio](https://aistudio.google.com/) for Gemini message prompt generation
- **Google Cloud Console OAuth Credentials** *(optional)*: For Google OAuth 2.0 sign-in

---

## 2. Environment Variables Configuration

Copy the template and fill it in:

```bash
cp .env.example .env.local
```

[`.env.example`](../.env.example) lists every variable the code reads, with what it does, its default and what happens without it. Optional lines are commented out: leave them commented rather than empty, because an empty value overrides the default (`SMTP_PORT=` means port 0).

### 2.1 Every variable the code reads

This is the complete list, checked against every `process.env`, `import.meta.env` and `env.X` access in the repository. When you add a variable, update this table, [`.env.example`](../.env.example) and the [Chapter 9](09-deployment-and-operations.md#2-production-environment-variables-checklist) checklist together.

| Variable | Required | Read in | Default / if unset |
| :--- | :--- | :--- | :--- |
| `MONGODB_URI` | **Yes** | [`db-connect.ts`](../src/server/db/db-connect.ts) | Every API call fails |
| `NEXT_AUTH_SECRET` | **Yes** | [`options.ts`](../src/app/api/auth/[...nextauth]/options.ts), [`middleware.ts`](../src/middleware.ts), [`security.ts`](../src/server/security/security.ts) (Sender Hash fallback) | Sessions break; NextAuth refuses to run in production without it |
| `NEXTAUTH_URL` | **Yes** (prod) | NextAuth itself, [`mailer.ts`](../src/server/email/mailer.ts) (email links) | Email links fall back to `https://ghost-msg.vercel.app` |
| `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS` | For email sign-up | [`mailer.ts`](../src/server/email/mailer.ts) | Verification codes, alerts and digests can't be sent; Google sign-in still works |
| `SMTP_PORT` | No | [`mailer.ts`](../src/server/email/mailer.ts) | `587` (STARTTLS); `465` switches to TLS |
| `SMTP_FROM` | No | [`mailer.ts`](../src/server/email/mailer.ts) | `GhostMsg 👻 <SMTP_USER>` |
| `GOOGLE_OAUTH_CLIENT_ID`, `GOOGLE_OAUTH_CLIENT_SECRET` | No | [`options.ts`](../src/app/api/auth/[...nextauth]/options.ts) | Only email sign-up |
| `GOOGLE_AI_STUDIO_SECRET` | No | [`moderation.ts`](../src/server/ai/moderation.ts), [`smart-reply.ts`](../src/server/ai/smart-reply.ts), [`ama-suggestions.ts`](../src/server/ai/ama-suggestions.ts), [`suggest-messages/route.ts`](../src/app/api/suggest-messages/route.ts) | Every message is delivered as clean (nothing quarantined); AI features use fixed fallbacks |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | No | [`use-push-notification.ts`](../src/data/user/use-push-notification.ts) (browser), [`web-push.ts`](../src/server/push/web-push.ts) | Push reported as not configured. Built into the browser bundle: rebuild after changing it |
| `VAPID_PRIVATE_KEY` | No | [`web-push.ts`](../src/server/push/web-push.ts) | No pushes are sent |
| `VAPID_SUBJECT` | No | [`web-push.ts`](../src/server/push/web-push.ts) | `mailto:support@ghostmsg.app` |
| `SENDER_PEPPER_SECRET` | Recommended (prod) | [`security.ts`](../src/server/security/security.ts) | Falls back to `NEXT_AUTH_SECRET` |
| `CRON_SECRET` | No | [`daily-digest/route.ts`](../src/app/api/cron/daily-digest/route.ts) | Digest route answers 503; no digests |
| `ANALYZE` | No | [`next.config.ts`](../next.config.ts) | Set by `pnpm analyze` |

Google sign-in needs no callback variable: register `<NEXTAUTH_URL>/api/auth/callback/google` as the redirect URI in Google Cloud.

### 2.2 Set automatically, or not used

| Name | Status |
| :--- | :--- |
| `NODE_ENV` | Set by Next.js; read by [`event-bus.ts`](../src/server/realtime/event-bus.ts) to keep the bus across hot reloads in development |
| `MODE` | Set by Vite; read by [`.storybook/preview.tsx`](../.storybook/preview.tsx) to turn animations off in story tests |
| `VERCEL_*` (e.g. `VERCEL_OIDC_TOKEN`) | Set by Vercel or written by `vercel env pull`; the code doesn't read them |
| `RESEND_API_KEY` | **Not read.** Email moved to SMTP ([ADR 0011](adr/0011-openapi-sdk-smtp-mailer-and-sender-unblocking.md)); delete it |
| `GOOGLE_OAUTH_CALLBACK_URL` | **Not read.** NextAuth derives the callback from `NEXTAUTH_URL`; delete it |
| `GOOGLE_GENERATIVE_AI_API_KEY` | **Not read.** The AI SDK's default; GhostMsg passes `GOOGLE_AI_STUDIO_SECRET` explicitly |

Names such as `CI`, `VITEST` or `STRIPE_KEY` appear only in example code under `.agents/skills/` and are not GhostMsg settings.

### 2.3 Tests

Tests never need a real `.env.local`: the network is mocked with MSW. Tests that cover a missing or present key set it themselves: `vi.stubEnv(...)` + `vi.unstubAllEnvs()` for the VAPID keys (`web-push.test.ts`, `use-settings.controller.test.ts`), and save/delete/restore of `GOOGLE_AI_STUDIO_SECRET` for the AI fallbacks (`moderation.test.ts`, `smart-reply.test.ts`, `ama-suggestions.test.ts`).

> Without the VAPID keys the app still runs. Settings then reports that push isn't configured, and the server skips sending pushes. Without `GOOGLE_AI_STUDIO_SECRET`, moderation delivers every message as clean and AI features use fixed fallbacks ([Chapter 17 §4](17-trust-safety-and-privacy.md#4-moderation-and-the-quarantine-policy)).

---

## 3. Installation & First Run

```bash
# 1. Clone the repository
git clone https://github.com/Abbas4tech/GhostMsg.git
cd GhostMsg

# 2. Install dependencies (pnpm only)
pnpm install

# 2b. One-time: browser for Storybook story tests
pnpm exec playwright install chromium

# 3. Generate TypeScript API types from OpenAPI spec
pnpm typegen

# 4. Start development server with Turbopack
pnpm dev

# 5. (Optional) Component catalog
pnpm storybook        # http://localhost:6006
```

> **First test run:** `pnpm test:stories` can fail once with "failed to find the current suite" while Vite optimizes dependencies. Re-run it.

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 4. Key Local Endpoints

- **Web Application**: `http://localhost:3000`
- **Interactive API Documentation (Scalar)**: `http://localhost:3000/docs`
- **OpenAPI 3.1 Specification JSON**: `http://localhost:3000/api/openapi.json`
- **Dashboard (Authenticated)**: `http://localhost:3000/dashboard`

---

## 5. Next Chapter
Proceed to [Chapter 3: System Architecture](03-system-architecture.md) for technical architecture details.

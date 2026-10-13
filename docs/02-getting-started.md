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

Create a `.env.local` file in the project root:

```bash
# ==============================================================================
# 1. Database Connection
# ==============================================================================
MONGODB_URI="mongodb+srv://<username>:<password>@cluster0.mongodb.net/ghostmsg?retryWrites=true&w=majority"

# ==============================================================================
# 2. Authentication (NextAuth.js v4)
# ==============================================================================
# Generate with: openssl rand -base64 32
NEXT_AUTH_SECRET="your-generated-random-32-byte-secret"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth 2.0 Credentials (Optional)
GOOGLE_OAUTH_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_OAUTH_CLIENT_SECRET="GOCSPX-your-google-client-secret"
GOOGLE_OAUTH_CALLBACK_URL="http://localhost:3000/api/auth/callback/google"

# ==============================================================================
# 3. Transactional Emails (Nodemailer + SMTP)
# ==============================================================================
SMTP_HOST="smtp.mailtrap.io"
SMTP_PORT="587"
SMTP_USER="your-smtp-username"
SMTP_PASS="your-smtp-password"

# ==============================================================================
# 4. Google AI Studio (Gemini 2.5 Flash Lite)
# ==============================================================================
GOOGLE_AI_STUDIO_SECRET="AIzaSy..."

# ==============================================================================
# 5. Web Push (VAPID) — browser push notifications (ADR 0020)
# ==============================================================================
# Generate with: npx web-push generate-vapid-keys
NEXT_PUBLIC_VAPID_PUBLIC_KEY="B..."
VAPID_PRIVATE_KEY="..."
# Optional contact sent to push services (default: mailto:support@ghostmsg.app)
VAPID_SUBJECT="mailto:you@example.com"

# ==============================================================================
# 6. Sender Hash pepper (Trust & Safety, Chapter 17)
# ==============================================================================
# HMAC secret for Sender Hashes. Falls back to NEXT_AUTH_SECRET when unset.
# Rotating it changes every future hash, so existing blocks stop matching.
SENDER_PEPPER_SECRET="another-random-32-byte-secret"

# ==============================================================================
# 7. Daily digest scheduler (ADR 0029)
# ==============================================================================
# Bearer secret for GET /api/cron/daily-digest (Vercel Cron sends it).
# Unset = daily digests are off (the route answers 503).
CRON_SECRET="a-long-random-secret"
```

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

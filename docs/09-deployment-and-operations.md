# Chapter 9: Deployment & Operations

This chapter covers deployment architecture on Vercel, MongoDB Atlas production clustering, SMTP email provider setup, and operational monitoring.

---

## 1. Production Deployment on Vercel

GhostMsg is optimized for deployment on the **Vercel Edge & Serverless Platform**:

### Runtime Distribution
- **Edge Functions**: [`/api/suggest-messages`](file:///d:/Projects/GhostMsg/src/app/api/suggest-messages/route.ts) runs on Vercel Edge Runtime for global low-latency AI responses ([ADR 0003](file:///d:/Projects/GhostMsg/docs/adr/0003-edge-runtime-for-ai-suggestions.md)).
- **Serverless Functions**: Database-backed API endpoints run on Node.js Serverless Functions with cached MongoDB connection pooling.

### Build Command
Vercel executes the production build:
```bash
npm run build
# Runs: npm run typegen && next build --turbopack
```

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

---

## 3. Database Operations & Connection Management

To prevent database connection exhaustion across serverless lambdas, GhostMsg implements cached singleton connection pooling in [`src/lib/db-connect.ts`](file:///d:/Projects/GhostMsg/src/lib/db-connect.ts):

```typescript
// Reuses global cached connection promise across warm lambda invocations
let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}
```

---

## 4. Next Chapter
Proceed to [Chapter 10: Storybook & UI Catalog](file:///d:/Projects/GhostMsg/docs/10-storybook-and-ui-catalog.md).

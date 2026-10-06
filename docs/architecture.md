# System Architecture & Technical Design

This document details the architectural design, security model, and data flow of GhostMsg.

---

## 1. High-Level Architecture Overview

GhostMsg is built on the Next.js 15 App Router using React 19, Tailwind CSS v4, MongoDB via Mongoose, NextAuth.js v4, and Google AI Studio (Gemini 2.5 Flash Lite).

```
┌─────────────────────────────────────────────────────────────┐
│                       Client Browser                        │
│   (Landing, Dashboard, Profile Link /u/[username], Auth)    │
└──────────────┬───────────────────────────────┬──────────────┘
               │ HTTP Requests                 │ Edge API Call
               ▼                               ▼
┌──────────────────────────────┐ ┌────────────────────────────┐
│      Next.js App Router      │ │    Next.js Edge Runtime    │
│       Node.js Runtime        │ │   /api/suggest-messages    │
│  - Middleware Authentication │ └─────────────┬──────────────┘
│  - REST API Routes           │               │
│  - NextAuth Handlers         │               ▼
└──────┬───────────────┬───────┘ ┌────────────────────────────┐
       │               │         │ Google AI Studio (Gemini)  │
       ▼               ▼         └────────────────────────────┘
┌──────────────┐ ┌──────────────┐
│   MongoDB    │ │    Resend    │
│   Database   │ │ Email Service│
└──────────────┘ └──────────────┘
```

---

## 2. Authentication & Authorization

### Multi-Provider Strategy
1. **Credentials Provider**:
   - Username/Email + Password combination hashed with `bcryptjs` (salt rounds: 10).
   - Mandatory verification check (`isVerified: true`).
   - If unverified, users are prompted to complete email verification with a 6-digit verification code before authentication is granted.
2. **Google OAuth 2.0**:
   - Users signing in via Google automatically have an account created or linked.
   - Google accounts are automatically marked as `isVerified: true`.

### Session Management
- NextAuth JWT strategy (`session: { strategy: 'jwt' }`).
- Session payload enriched with `_id`, `username`, `isVerified`, and `isAcceptingMessage`.
- Protected route middleware (`src/middleware.ts`) secures dashboard access and redirects authenticated users away from guest-only auth pages.

---

## 3. Data Model & Storage

### Embedded Messages Model (`src/model/user.model.ts`)
```typescript
interface Message {
  _id: Types.ObjectId;
  content: string;
  createdAt: Date;
}

interface User {
  _id: Types.ObjectId;
  username: string;
  email: string;
  password: string;
  verifyCode: string;
  verifyCodeExpiry: Date;
  isVerified: boolean;
  isAcceptingMessage: boolean;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}
```

### Key Query Patterns
- **Fetch Inbox Messages**: Utilizes MongoDB Aggregation Pipeline (`$match` -> `$unwind` -> `$sort` by `messages.createdAt: -1` -> `$group`) to retrieve chronologically sorted messages efficiently.
- **Delete Single Message**: Utilizes atomic `$pull` operator on `user.messages` with `_id` matching.
- **Send Message**: Pushes new subdocument into `messages` array after verifying `isAcceptingMessage === true`.

---

## 4. AI Prompt Generation Pipeline

- **Endpoint**: `/api/suggest-messages`
- **Runtime**: `edge`
- **Engine**: Google AI Studio `gemini-2.5-flash-lite` via `@ai-sdk/google` and Vercel `ai` SDK.
- **Output Format**: 3 questions delimited by `||` for zero-overhead parsing on the client.

---

## 5. Security & Validation

- **Input Validation**: Strongly typed schemas defined in `src/schemas/` using Zod v4.
- **Password Hashing**: One-way bcrypt hashing before database persistence.
- **Token Verification**: Time-bound expiration (1 hour) on 6-digit numeric verification codes.
- **Database Connection Caching**: Cached singleton connection pattern in `src/lib/db-connect.ts` to prevent connection exhaustion in serverless environments.
- **Code Quality**: Biome / Ultracite enforcing strict type safety, accessibility, and anti-pattern bans.

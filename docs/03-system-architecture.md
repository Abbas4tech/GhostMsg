# Chapter 3: System Architecture & Technical Design

This chapter details the high-level system architecture, data models, authentication lifecycle, and runtime boundaries of GhostMsg.

---

## 1. High-Level Architecture Overview

GhostMsg is built on the **Next.js 15 App Router** using React 19, Tailwind CSS v4, MongoDB (Mongoose), NextAuth.js v4, and Google AI Studio.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                               Client Browser                                │
│          (Landing Page, Dashboard, Profile Link /u/[username], Auth)        │
└───────────────────────┬─────────────────────────────┬───────────────────────┘
                        │ HTTP Requests               │ Edge API Call
                        ▼                             ▼
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
        │   MongoDB    │ │  Nodemailer  │
        │   Database   │ │ (SMTP Mailer)│
        └──────────────┘ └──────────────┘
```

### Source layers & runtime boundaries ([ADR 0018](file:///d:/Projects/GhostMsg/docs/adr/0018-source-structure-server-data-lib-utils-controllers-tests.md))

Code is split by **where it runs**. Server-only code never reaches the client bundle (`import "server-only"` + Biome), the client reaches the server only over typed HTTP (`openapi-fetch`), and pure helpers have no runtime ties.

```mermaid
flowchart TB
    subgraph Browser["Client bundle"]
        direction TB
        UI["components: elements → patterns → blocks<br/>(pure UI, props + callbacks)"]
        PG["components/pages/**<br/>use-*.controller.ts"]
        DL["src/data/**<br/>api-client · query-keys · queries · mutations · live/push hooks"]
        HK["src/hooks · src/providers"]
        PG --> UI
        PG --> DL
        PG --> HK
    end
    subgraph Shared["Universal"]
        LIB["src/lib/**<br/>pure helpers"]
        SCH["src/schemas/**<br/>Zod contracts"]
        DTO["src/types/api.ts<br/>OpenAPI DTOs"]
    end
    subgraph Node["Server (Node / Edge)"]
        direction TB
        RT["src/app/api/**<br/>route handlers"]
        SV["src/server/**  (server-only)<br/>db · models · email · ai · security · realtime · openapi"]
        RT --> SV
    end
    DL -- "HTTP /api/* (openapi-fetch, typed by api-schema.d.ts)" --> RT
    SV -- "EventSource /api/messages/stream" --> DL
    PG --> LIB
    UI --> LIB
    DL --> DTO
    RT --> SCH
    PG --> SCH
    SV --> DB[("MongoDB")]
    SV --> SMTP["SMTP"]
    SV --> AI["Gemini"]
```

| Layer | Folder | Imported by | Must not import |
| :--- | :--- | :--- | :--- |
| Server | `src/server/<capability>/` | `src/app/**`, other server modules | anything client |
| Data | `src/data/<domain>/` | page controllers only | `@/server/**` |
| Controllers | `src/components/pages/<route>/` | page components | `@/server/**` |
| Pure UI | `elements` / `patterns` / `blocks` | higher tiers | `@/data/**`, `@/server/**`, router, session |
| Lib | `src/lib/<domain>/` | anyone | React, Next, `@/data`, `@/server`, components |

The full placement rules and recipes are in the [Source Structure Guide](file:///d:/Projects/GhostMsg/docs/agents/source-structure.md).

---

## 2. Authentication & Authorization Lifecycle

GhostMsg supports a dual-authentication strategy configured in [`src/app/api/auth/[...nextauth]/options.ts`](file:///d:/Projects/GhostMsg/src/app/api/auth/%5B...nextauth%5D/options.ts).

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant Browser
    participant API as Next.js API (/api/sign-up)
    participant DB as MongoDB (UserModel)
    participant Mailer as Nodemailer SMTP Transporter

    User->>Browser: Enters Username, Email, Password
    Browser->>API: POST /api/sign-up
    API->>DB: Check unique username & existing email
    API->>API: Generate 6-digit verification code & hash password (bcrypt)
    API->>DB: Save user document (isVerified: false)
    API->>Mailer: Dispatch Verification Email (@react-email/render)
    Mailer-->>User: Delivers 6-digit code to inbox
    User->>Browser: Enters code on /verify/[username]
    Browser->>API: POST /api/verify-code
    API->>DB: Validate code & expiration (1 hour)
    API->>DB: Update isVerified: true
    API-->>Browser: Verification Success -> Redirect to /sign-in
```

### Session Management & JWT Payload
- Strategy: JWT (`session: { strategy: 'jwt' }`).
- Token Enrichment: The session token includes `_id`, `username`, `isVerified`, and `isAcceptingMessage`.
- Protected Routes: [`src/middleware.ts`](file:///d:/Projects/GhostMsg/src/middleware.ts) enforces authentication on `/dashboard` and redirects logged-in users away from guest-only auth pages.

---

## 3. Data Model & Storage Design

GhostMsg implements a decoupled relational document model using a dedicated `Message` collection and compound indexing as defined in [ADR 0010](file:///d:/Projects/GhostMsg/docs/adr/0010-standalone-messages-schema-and-feature-architecture.md) (superseding legacy embedded subdocuments).

### Standalone Message Schema (`src/server/models/message.model.ts`)
```typescript
interface IMessage {
  _id: Types.ObjectId;
  recipientId: Types.ObjectId; // Ref: User (indexed)
  content: string;             // 10-300 chars
  sentimentTag: 'sweet' | 'curious' | 'spicy' | 'advice' | 'neutral';
  isQuarantined: boolean;      // Moderation flag (indexed)
  isPinned: boolean;           // Starred message (indexed)
  isRead: boolean;             // Read tracking
  reply?: {
    text: string;
    isPublished: boolean;      // Public showcase flag (indexed)
    publishedAt?: Date;
  };
  senderHash: string;          // Cryptographic HMAC-SHA256 fingerprint (indexed)
  createdAt: Date;             // Reverse-chronological sort (indexed)
  updatedAt: Date;
}
```

### User Schema (`src/server/models/user.model.ts`)
```typescript
interface IUser {
  _id: Types.ObjectId;
  username: string;
  email: string;
  password: string;
  verifyCode: string;
  verifyCodeExpiry: Date;
  isVerified: boolean;
  isAcceptingMessage: boolean;
  amaPrompt?: string;          // Custom banner prompt for /u/[username]
  blockedSenderHashes: string[]; // Recipient-level blocked sender fingerprints
  notificationSettings: {
    emailAlerts: "instant" | "daily" | "off";
    webPushEnabled: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}
```

### Key Database Compound Indexes
* `{ recipientId: 1, isQuarantined: 1, createdAt: -1 }` (Primary Inbox Feed)
* `{ recipientId: 1, isPinned: 1, createdAt: -1 }` (Starred/Favorites Feed)
* `{ recipientId: 1, "reply.isPublished": 1, createdAt: -1 }` (Public Showcase Q&A Feed)

---

## 4. AI & Content Moderation Pipeline

- **Suggested Prompts**: `/api/suggest-messages` (Edge runtime, Gemini 2.5 Flash Lite) generates 3 randomized conversation starters.
- **Synchronous Content Moderation & Sentiment Tagging**: Evaluated on `/api/send-message` ingestion:
  - **Toxicity Check**: Flags harassment or abusive content to set `isQuarantined: true`, isolating the message from the main inbox.
  - **Sentiment Classification**: Labels the emotional tone (`sweet`, `curious`, `spicy`, `advice`, `neutral`).
- **AI Smart Reply Assistant**: `/api/ai/smart-reply` generates multi-tone draft replies (`witty`, `wholesome`, `thoughtful`) directly into the recipient's reply modal.

---

## 5. Privacy, Abuse Prevention & Real-Time Transport

- **In-Memory Rate Limiting**: Upstash Redis sliding window (5 messages per 10 minutes per IP). Raw IPs are never written to MongoDB.
- **Cryptographic Sender Hash**: Computed as $\text{HMAC-SHA256}(\text{IP} + \text{RecipientId},\; \text{SECRET\_SALT})$. Allows recipients to shadowban abusive senders without compromising visitor anonymity.
- **Server-Sent Events (SSE) Live Feed**: Backed by Upstash Redis Pub/Sub channel `recipient:{userId}:messages` streamed over `/api/messages/stream`.
- **Web Push** ([ADR 0020](file:///d:/Projects/GhostMsg/docs/adr/0020-web-push-delivery-vapid-and-subscription-lifecycle.md)): each device's `PushSubscription` is stored in `User.pushSubscriptions`. `POST /api/send-message` calls `sendPushToUser` (`src/server/push/web-push.ts`, VAPID-signed via `web-push`) for messages that aren't quarantined, without blocking the response. Endpoints that answer 404/410 are pruned.

```mermaid
flowchart LR
    S["Sender<br/>/u/[username]"] -->|POST| SM["/api/send-message"]
    SM --> DB[("MongoDB")]
    SM -->|"SSE (Redis pub/sub)"| IN["Open dashboard tabs"]
    SM -->|"email (instant)"| MAIL["SMTP"]
    SM -->|"sendPushToUser (VAPID)"| PS["Browser push service"]
    PS --> SW["/sw.js → showNotification"]
    PS -. "404/410" .-> PR["$pull gone subscription"]
```

- **Password Hashing & Auth Security**: Bcrypt (rounds = 10), 6-digit verification codes (1-hour expiration), and cached MongoDB connection pooling via [`src/server/db/db-connect.ts`](file:///d:/Projects/GhostMsg/src/server/db/db-connect.ts).

---

## 6. Master Blueprint & Next Chapter
For the exhaustive implementation specification, see the [Feature & Implementation Master Blueprint](file:///d:/Projects/GhostMsg/docs/feature-and-implementation-blueprint.md).
Proceed to [Chapter 4: API & Type Safety Architecture](file:///d:/Projects/GhostMsg/docs/04-api-and-type-safety.md).

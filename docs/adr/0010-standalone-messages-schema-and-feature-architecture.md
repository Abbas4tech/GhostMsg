# ADR 0010: Standalone Message Collection, Privacy-First Abuse Prevention & Public Q&A Architecture

## Status
**Accepted** (Supersedes [ADR 0001: Embedded Messages in User Document](file:///d:/Projects/GhostMsg/docs/adr/0001-embedded-messages-schema.md))

---

## Context & Problem Statement
In [ADR 0001](file:///d:/Projects/GhostMsg/docs/adr/0001-embedded-messages-schema.md), messages were modeled as embedded subdocuments within `UserModel.messages`. While effective for simple single-message appending and deleting, this design creates severe bottlenecks when introducing advanced platform capabilities:

1. **Inbox Scalability & Pagination**: Pinned messages, read/unread states, sentiment classification tags, and cursor pagination require independent compound indexing.
2. **Abuse Prevention & Privacy**: Enabling recipients to block abusive senders without tracking raw IP addresses or requiring sender logins.
3. **Public Q&A & Virality**: Storing recipient replies and publishing them on public profile showcase feeds and social story cards.
4. **Content Safety**: AI-driven toxicity quarantine and sentiment classification without inflating the primary `User` document.

---

## Decision Drivers
1. **Unbounded Inbox Scalability**: Eliminate MongoDB's 16MB document size limit and expensive `$unwind` aggregation pipelines for inbox sorting and filtering.
2. **Strict Anonymity & Privacy-First Security**: Enforce rate limiting and recipient blocklists without ever storing persistent raw IP addresses.
3. **Public Q&A & Social Virality**: Allow recipients to publish answers and export 9:16 story cards for Instagram/Snapchat.
4. **Granular Indexing**: Enable compound indexes on `{ recipientId: 1, isQuarantined: 1, createdAt: -1 }` for sub-millisecond query performance.

---

## The Decisions

### 1. Standalone `Message` Model
We replace the embedded subdocument array with a standalone `Message` collection (`src/model/message.model.ts`):

```typescript
export interface IMessage extends Document {
  recipientId: Types.ObjectId;
  content: string;
  sentimentTag: 'sweet' | 'curious' | 'spicy' | 'advice' | 'neutral';
  isQuarantined: boolean;
  isPinned: boolean;
  isRead: boolean;
  reply?: {
    text: string;
    isPublished: boolean;
    publishedAt?: Date;
  };
  senderHash: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### 2. Privacy-First Rate Limiting & Shadowbanning
* **Rate Limiting**: Ephemeral sliding window IP rate limiting via Upstash Redis in memory (e.g. 5 requests per 10 minutes per IP with TTL). Senders' raw IPs are never written to MongoDB.
* **Sender Hash & Shadowbanning**: On message submission, a one-way cryptographic hash is computed:
  $$\text{SenderHash} = \text{SHA-256}(\text{Sender IP} + \text{Recipient ID} + \text{Salt})$$
  Recipients can block an anonymous sender by storing their `senderHash` in `user.blockedSenderHashes`. Future messages from that sender to that recipient are dropped/shadowbanned silently without exposing sender identities.

### 3. Public Q&A & Story Card Workflow
* Recipients can answer any message in their dashboard and optionally set `reply.isPublished = true`.
* Published Q&As appear on a public feed at `/u/[username]`.
* 9:16 social story cards are generated on the client via `html-to-image` across styled themes (Cyberpunk, Midnight Violet, Sunset Glow) for zero server compute overhead.

### 4. Real-time Delivery & AI Pipeline
* **Synchronous AI Processing**: Google Gemini 2.5 Flash Lite computes sentiment tags and checks toxicity on submission.
* **Real-Time Stream**: Server-Sent Events (SSE) backed by Upstash Redis Pub/Sub push new incoming messages directly to active dashboard sessions.

---

## Consequences

### Positive
* **Sub-Millisecond Query Latency**: Direct B-tree indexed queries replace `$unwind` aggregations.
* **Granular Filtering & Search**: Instant filtering by unread, starred, quarantined, or answered status.
* **Zero PII Leakage**: True sender anonymity preserved while giving recipients harassment defense tools.
* **Viral Acquisition**: Social story cards and public Q&A feeds drive incoming referral traffic.

### Negative & Mitigations
* **Migration Requirement**: Existing users with embedded messages require an idempotent migration script to extract messages into the new `Message` collection.
* **Cascading Cleanup**: Deleting a user account now requires a hook or transaction to clean up corresponding records from the `messages` collection (`Message.deleteMany({ recipientId: userId })`).

---

## References & Code Pointers
- User Model: [`src/model/user.model.ts`](file:///d:/Projects/GhostMsg/src/model/user.model.ts)
- Message Model: `src/model/message.model.ts`
- Domain Glossary: [`GLOSSARY.md`](file:///d:/Projects/GhostMsg/GLOSSARY.md)
- Superseded ADR: [`docs/adr/0001-embedded-messages-schema.md`](file:///d:/Projects/GhostMsg/docs/adr/0001-embedded-messages-schema.md)

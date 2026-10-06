# ADR 0001: Embedded Messages in User Document

## Status
**Accepted**

---

## Context & Problem Statement
GhostMsg is an anonymous messaging platform where verified users receive messages sent by anonymous visitors to their public profile URL (`/u/[username]`).

In relational database designs or normalized MongoDB architectures, messages would traditionally be stored in a distinct `messages` collection with a reference field `recipientId: ObjectId`. In document-oriented databases like MongoDB, we must evaluate whether to maintain a referenced collection or embed message subdocuments directly inside the `User` document.

---

## Decision Drivers
1. **Read Performance on Dashboard**: When an authenticated user opens `/dashboard`, their inbox messages must load with minimal query latency and zero join overhead.
2. **Account Lifecycle & Cascading Deletions**: When a user account is deleted, all associated anonymous messages must be purged atomically without leaving orphaned documents or requiring background sweep jobs.
3. **Atomic Message Appends & Deletions**: Adding a message to a user's inbox or deleting a single message must be atomic operations.
4. **Serverless Connection Efficiency**: Reducing round-trips and join operations conserves MongoDB connection pool capacity in Next.js serverless functions.

---

## Considered Options

### Option A: Separate Referenced `messages` Collection
- **Pros**:
  - Unbounded message growth per user without hitting MongoDB's 16MB document size limit.
  - Independent indexing on message attributes (e.g. `createdAt`, `sentiment`).
- **Cons**:
  - Requires multi-document queries or `$lookup` aggregation joins to fetch user profile and inbox data simultaneously.
  - Requires multi-document transactions or background cleanup jobs to prevent orphaned messages upon user deletion.
  - Slower write throughput for high-frequency messaging.

### Option B: Embedded Subdocuments inside `User.messages` (Chosen)
- **Pros**:
  - **Atomicity**: Complete user profile and message inbox reside in a single document.
  - **Zero Orphaned Data**: Deleting a user automatically purges all embedded messages in a single atomic operation.
  - **Atomic Mutations**: Single-message deletions use MongoDB's atomic `$pull` operator.
  - **Fast Reads**: Inbox retrieval requires a single indexed query by `User._id` or `username`.
- **Cons**:
  - Subject to MongoDB's 16MB per-document limit. However, given GhostMsg's 300-character message length constraint, a single user document can hold over 40,000+ messages before approaching storage boundaries.
  - Reverse chronological sorting requires an aggregation pipeline (`$match` -> `$unwind` -> `$sort` -> `$group`).

---

## The Decision
We chose **Option B**: Store anonymous messages as embedded subdocuments inside the `User` document in [`src/model/user.model.ts`](file:///d:/Projects/GhostMsg/src/model/user.model.ts).

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

---

## Consequences

### Positive
- **Instant Account Deletion**: Deleting a user document instantly removes all associated messages without orphaned sub-collections.
- **Atomic Operations**: Sending a message is a single `$push` operation after verifying `isAcceptingMessage: true`. Deleting a message is an atomic `$pull` by `_id`.
- **Simplified Backup & Recovery**: Backing up user records preserves the entire messaging state.

### Negative & Mitigations
- **Sorting Requirement**: Because subdocument arrays are appended in chronological order, retrieving newest messages first requires an aggregation pipeline (`$unwind` + `$sort` by `messages.createdAt: -1`). This is implemented in [`src/app/api/get-messages/route.ts`](file:///d:/Projects/GhostMsg/src/app/api/get-messages/route.ts).

---

## References & Code Pointers
- Data Model: [`src/model/user.model.ts`](file:///d:/Projects/GhostMsg/src/model/user.model.ts)
- Message Ingestion: [`src/app/api/send-message/route.ts`](file:///d:/Projects/GhostMsg/src/app/api/send-message/route.ts)
- Inbox Query: [`src/app/api/get-messages/route.ts`](file:///d:/Projects/GhostMsg/src/app/api/get-messages/route.ts)
- Message Deletion: [`src/app/api/delete-message/[messageId]/route.ts`](file:///d:/Projects/GhostMsg/src/app/api/delete-message/%5BmessageId%5D/route.ts)

# ADR 0003: Edge Runtime for AI Suggestions with Gemini 2.5 Flash Lite

## Status
**Accepted**

---

## Context & Problem Statement
On the public messaging page (`/u/[username]`), anonymous senders often experience writer's block when trying to compose a message. To enhance user engagement, GhostMsg includes an AI-powered message suggestion feature ("Suggest Messages") that generates 3 intriguing questions on demand.

Traditional serverless Node.js functions suffer from cold-start latencies (500ms to 2.5s) and regional routing overhead. For an interactive UI feature triggered frequently by public visitors, multi-second latency leads to high abandonment rates.

---

## Decision Drivers
1. **Sub-Second Latency**: Suggestions should render rapidly (<400ms time-to-first-token) regardless of visitor geography.
2. **Cost-Efficiency & Rate Limits**: High-throughput, low-cost LLM inference suitable for free-tier public traffic.
3. **Zero-Overhead Parsing**: Minimal wire transmission payload and deterministic client-side parsing without complex JSON schema decoding errors.
4. **Vercel AI SDK Integration**: Modern unified AI streaming primitives.

---

## Considered Options

### Option A: Static Predefined List of Prompts
- **Pros**: Instantaneous response (0ms LLM latency), zero API costs.
- **Cons**: Static, repetitive prompts that quickly feel stale and decrease engagement.

### Option B: Node.js Serverless Function + OpenAI GPT-4o-mini
- **Pros**: High ecosystem familiarity.
- **Cons**: Node.js cold-start latency; higher regional origin latencies compared to Edge network execution.

### Option C: Next.js Edge Runtime + Google AI Studio (`gemini-2.5-flash-lite`) (Chosen)
- **Pros**:
  - **Edge Execution**: Runs on Vercel's global Edge network (`export const runtime = 'edge'`), eliminating serverless container cold starts.
  - **Gemini 2.5 Flash Lite**: Exceptionally fast time-to-first-token and cost efficiency.
  - **Delimited Output Format**: Prompts are returned separated by `||` delimiters (e.g. `Question 1||Question 2||Question 3`), enabling immediate `split('||')` in the client without JSON parsing failures.
  - **Vercel AI SDK**: Leverages `@ai-sdk/google` for standardized LLM invocation.
- **Cons**: Edge runtime limits access to Node.js native APIs (e.g., `fs`), which are not required for API proxying and AI generation.

---

## The Decision
We chose **Option C**: Deploy [`src/app/api/suggest-messages/route.ts`](file:///d:/Projects/GhostMsg/src/app/api/suggest-messages/route.ts) on the Next.js `edge` runtime using Google AI Studio (`gemini-2.5-flash-lite`) via `@ai-sdk/google`.

```typescript
// src/app/api/suggest-messages/route.ts
export const runtime = "edge";

export async function GET() {
  const result = await generateText({
    model: google("gemini-2.5-flash-lite"),
    prompt:
      "Create a list of three open-ended and engaging questions formatted as a single string. Each question should be separated by '||'. These questions are for an anonymous social messaging platform, like Qooh.me, and should be suitable for a diverse audience. Avoid personal or sensitive topics, focusing on universal themes that encourage friendly interaction.",
  });

  return NextResponse.json({
    success: true,
    messages: result.text,
  });
}
```

---

## Consequences

### Positive
- **Global Low Latency**: Visitors worldwide experience sub-second AI suggestions.
- **Zero Cold Starts**: Edge isolates initialize in <5ms.
- **Resilient UI Integration**: The client splits the string by `||` and displays interactive clickable badges that auto-fill the message textarea.

### Negative & Mitigations
- **LLM Non-Determinism**: Occasionally the LLM may return formatting variations. Mitigated through specific system prompt instructions and fallback splitting in the client UI.

---

## References & Code Pointers
- Edge Route Handler: [`src/app/api/suggest-messages/route.ts`](file:///d:/Projects/GhostMsg/src/app/api/suggest-messages/route.ts)
- Public Messaging UI: [`src/app/u/[username]/page.tsx`](file:///d:/Projects/GhostMsg/src/app/u/%5Busername%5D/page.tsx)
- Chapter Guide: [`docs/03-system-architecture.md`](file:///d:/Projects/GhostMsg/docs/03-system-architecture.md)

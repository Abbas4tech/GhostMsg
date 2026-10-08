# ADR 0012: Vitest Unit & Integration Testing Strategy for GhostMsg

## Status
**Accepted** (Fully implemented & verified across 34 tests in 9 test suites)

---

## Context & Problem Statement
GhostMsg has built extensive server and client capabilities: standalone message collections, OpenAPI 3.1 Zod contracts, AI-driven toxicity quarantine and smart reply generation, Nodemailer SMTP email alerts, Web Push notifications (PWA), and cryptographic sender hash blocking/unblocking.

However, the repository currently lacks a fast, automated unit and integration testing suite. Without unit tests:
1. Regressions in critical security logic (e.g. HMAC SHA-256 sender hashing, IP rate limiting) might go unnoticed until deployment.
2. Edge cases in AI moderation, fallback generation, or Zod contract safeParsing are unverified.
3. Web Push VAPID key conversion and browser permission state transitions are difficult to test manually across all browser environments.

---

## Decision Drivers
1. **Sub-Second Feedback Loop**: Use **Vitest** for instant test execution with native ESM, TypeScript, and SWC support.
2. **Comprehensive Coverage Boundary**: Define clear boundaries for what to test with unit/integration tests vs E2E Playwright.
3. **Deterministic Mocking**: Isolate third-party services (Google Gemini AI, SMTP servers, Web Push APIs) using MSW (Mock Service Worker) and deterministic mocks.
4. **Contract Verification**: Guarantee 100% test coverage for Zod request/response schemas and custom TanStack Query mutation hooks.

---

## The Proposed Decisions

### 1. Test Framework & Environment Setup
- **Test Runner**: [`Vitest`](https://vitest.dev/) configured via `vitest.config.ts`.
- **DOM Environment**: `jsdom` or `happy-dom` for testing React 19 components and browser APIs (`window.atob`, `Notification`, `PushManager`).
- **React Testing Library**: `@testing-library/react` and `@testing-library/user-event` for component and hook testing.

### 2. Scope Matrix: What to Cover vs What NOT to Cover

| Category | What TO Cover (Unit & Integration) | What NOT to Cover in Vitest (Defer to Playwright E2E) |
| :--- | :--- | :--- |
| **Security & Utilities** | `senderHash` HMAC SHA-256 calculation, `urlBase64ToUint8Array` VAPID key converter, rate limit math. | Live IP network socket streaming. |
| **AI Moderation & Smart Reply** | Toxicity quarantine filters, sentiment classification (`sweet`, `curious`, `spicy`, `advice`, `neutral`), fallback responses on AI failure. | Live Google AI Studio API calls (stubbed via MSW / mocks). |
| **Email & Transporter** | Nodemailer transporter config, `@react-email/render` HTML compilation for OTP and new message alert emails. | Actual SMTP network delivery to external inboxes. |
| **OpenAPI & Zod Contracts** | All schema validation rules in `src/schemas/` (`safeParse` successes and failures). | Server runtime HTTP listening ports. |
| **React Query Hooks** | Custom mutation hooks (`useBlockSenderMutation`, `useUnblockSenderMutation`, `useNotificationSettingsMutation`, `usePushSubscriptionMutation`, `useAmaPromptMutation`). | Real browser navigation and cookie session setting. |
| **Dashboard Components** | `MessageCard` block/unblock modal state transitions, `SettingsTab` push notification permission checks, `MessageFilterBar` search filter state. | Full multi-tab cross-browser layout rendering (Playwright handles this). |

### 3. Mocking & Fixture Strategy
- **HTTP Network Mocking**: `msw` (Mock Service Worker) to intercept `openapi-fetch` calls (`api.GET`, `api.POST`, `api.PATCH`, `api.DELETE`).
- **Database Model Mocking**: In-memory Mongoose stubs or `mongodb-memory-server` for API route integration tests.
- **Browser Push APIs Mocking**: Polyfill `navigator.serviceWorker`, `PushManager`, and `Notification.requestPermission` in test setup file (`src/test/setup.ts`).

---

## Proposed Test Directory Structure

```
src/
├── test/
│   ├── setup.ts                    # Polyfills (window.atob, Notification, PushManager, TextEncoder)
│   ├── mocks/
│   │   ├── handlers.ts             # MSW handlers for OpenAPI endpoints
│   │   └── mock-data.ts            # Standardized user & message fixtures
├── lib/__tests__/
│   ├── security.test.ts            # Sender hash & security calculations
│   ├── ai-moderation.test.ts       # Sentiment & quarantine logic
│   ├── ai-smart-reply.test.ts      # Smart reply fallback generator
│   └── mailer.test.ts              # Email HTML rendering
├── schemas/__tests__/
│   ├── message-schema.test.ts      # Message & block sender Zod validation
│   └── notification-schema.test.ts # Notification settings validation
├── hooks/mutations/__tests__/
│   ├── use-block-sender.test.ts    # Block & Unblock mutation hooks
│   ├── use-push-sub.test.ts        # Push subscription mutation
│   └── use-notif-settings.test.ts  # Notification settings mutation
└── components/dashboard/__tests__/
    ├── message-card.test.tsx       # MessageCard block/unblock toggle
    └── settings-tab.test.tsx       # SettingsTab Web Push & blocklist UI
```

---

## References & Code Pointers
- Engineering Docs: [`docs/07-testing-strategy.md`](file:///d:/Projects/GhostMsg/docs/07-testing-strategy.md)
- API Patterns: [`docs/agents/api-patterns.md`](file:///d:/Projects/GhostMsg/docs/agents/api-patterns.md)
- Security Module: [`src/lib/security.ts`](file:///d:/Projects/GhostMsg/src/lib/security.ts)
- Settings Tab Component: [`src/components/dashboard/settings-tab.tsx`](file:///d:/Projects/GhostMsg/src/components/dashboard/settings-tab.tsx)

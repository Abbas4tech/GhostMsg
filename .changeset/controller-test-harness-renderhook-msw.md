---
"ghostmsg": minor
---

A shared harness for testing page controllers, and every controller now has a test.

- **Harness:** `renderHookWithProviders(hook, { session?, queryClient? })` wraps a controller hook in `SessionProvider` and a fresh React Query client. Default session is signed out, so there's no `/api/auth/session` fetch and no live-message SSE stream during tests.
- **Call assertions:** `recordRequests()` records every MSW request as `"METHOD /path"`, used for "called"/"not called" assertions instead of stubbing mutation hooks.
- **Minimal mocking:** only four true edges are ever mocked (`next/navigation`, `sonner` toasts, `next-auth/react`'s `signIn`, and browser download side effects). `@/data/**` always runs for real against the same MSW handlers and scenarios Storybook uses.
- **Coverage:** all 11 page controllers now have a `*.controller.test.ts`, covering the happy path, server-error scenarios and guard clauses. Render-only tests that only checked copy were removed; stories already cover that.
- **Docs:** ADR 0019.

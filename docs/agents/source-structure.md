# Source Structure Guide for Agents (ADR 0018 / ADR 0019)

Read this before you create, move or rename anything under `src/` outside `src/components/` (for components, read [component-architecture.md](component-architecture.md)). It answers three questions: **where does this file go**, **what may it import**, and **what test must it have**.

Decisions and rationale: [ADR 0018](../adr/0018-source-structure-server-data-lib-utils-controllers-tests.md) (structure) and [ADR 0019](../adr/0019-controller-test-harness-renderhook-msw-and-edge-mocking.md) (controller tests). Rule summary: [`.agents/rules/source-structure.md`](../../.agents/rules/source-structure.md).

---

## 1. The map

```
src/
├── app/                     # routes (thin pages) + API route handlers → may import @/server
├── components/              # elements → patterns → blocks → pages (ADR 0015)
│   └── pages/<route>/       # use-*.controller.ts (+ .test.ts), <route>.utils.ts (+ .test.ts)
├── content/                 # static app content (landing.ts: landing example copy)
├── data/                    # CLIENT data layer, imported only by page controllers
│   ├── api-client.ts        # openapi-fetch `api`, `clientFetch`, `ApiError`
│   ├── query-keys.ts        # every React Query key
│   ├── auth/                # auth.queries.ts, use-sign-up-mutation.ts, use-verify-code-mutation.ts
│   ├── messages/            # messages.queries.ts, messages-cache.ts (optimistic helpers), use-{bulk-action,delete-message,reply-message,
│   │                        #   update-message,smart-reply}-mutation.ts, use-live-messages.ts
│   ├── public/              # use-send-message-mutation.ts, use-suggest-messages-mutation.ts
│   └── user/                # user.queries.ts, use-{accept-message,ama-prompt,block-sender,
│                            #   notification-settings,push-subscription,remove-push-subscription}-mutation.ts,
│                            #   use-push-notification.ts (+ .utils.ts + .utils.test.ts)
├── generated/               # api-schema.d.ts (pnpm typegen, never edit)
├── hooks/                   # generic React hooks only (get-strict-context.tsx)
├── lib/                     # pure, framework-free helpers by domain
│   ├── utils.ts             # cn()
│   ├── messages/export.ts   # buildMessagesCsv / Json / Export (+ test)
│   └── browser/download.ts  # downloadTextFile side effect (+ test)
├── mock/                    # fixtures/, handlers/, noop.ts (tests & stories only)
├── providers/               # auth-provider, query-provider, theme-provider
├── schemas/                 # universal Zod contracts (+ zod.ts OpenAPI-extended z, + tests)
├── server/                  # SERVER ONLY: every file starts with `import "server-only"`
│   ├── ai/                  # moderation.ts, smart-reply.ts (+ tests)
│   ├── db/                  # db-connect.ts
│   ├── email/               # mailer.ts, send-*-email.ts, email-result.ts
│   ├── models/              # user.model.ts, message.model.ts
│   ├── openapi/             # openapi.ts (registry → /api/openapi.json, typegen)
│   ├── push/                # web-push.ts: VAPID config, sendPushToUser, gone-pruning (+ test)
│   ├── realtime/            # event-bus.ts (SSE fan-out)
│   └── security/            # security.ts (+ test)
├── test/                    # setup.ts, msw-server.ts, server-only-stub.ts, test-utils.tsx
└── types/                   # api.ts (OpenAPI DTOs), next-auth.d.ts
```

---

## 2. Where does it go?

```mermaid
flowchart TD
    A{"Runs only on the server?<br/>(DB, secrets, mail, AI, Node APIs)"} -- yes --> S["src/server/#lt;capability#gt;/<br/>+ import 'server-only'"]
    A -- no --> B{"Talks to the API,<br/>React Query or SSE?"}
    B -- yes --> D["src/data/#lt;domain#gt;/<br/>queries · use-*-mutation · use-live-*"]
    B -- no --> C{"React hook or helper,<br/>not tied to a domain?"}
    C -- yes --> H["src/hooks/"]
    C -- no --> P0{"Context provider?"}
    P0 -- yes --> PR["src/providers/"]
    P0 -- no --> E{"Pure function?"}
    E -- "used by 1 module" --> U["#lt;module#gt;.utils.ts<br/>(colocated, + .utils.test.ts)"]
    E -- "used by ≥ 2 modules" --> L["src/lib/#lt;domain#gt;/<br/>(+ .test.ts)"]
    E -- "no: page state / effects" --> P["pages/#lt;route#gt;/use-*.controller.ts<br/>(+ .controller.test.ts)"]
    E -- "browser side effect, no React" --> LB["src/lib/browser/"]
```

| You're adding… | It goes in | Test |
| :--- | :--- | :--- |
| A Mongoose model or DB query helper | `src/server/models/` or `src/server/db/` | if it has logic |
| An email sender | `src/server/email/send-<what>-email.ts` returning `EmailResult` | if it has logic |
| A new API call (GET) | `src/data/<domain>/<domain>.queries.ts` (+ key in `query-keys.ts`) | via the controller test |
| A new API call (POST/PATCH/DELETE) | `src/data/<domain>/use-<action>-mutation.ts` (one per file) | via the controller test |
| A client response type | alias in `src/types/api.ts` (`XDto = Schemas["X"]`) | n/a (`tsc`) |
| Page state, handlers, toasts, redirects | `pages/<route>/use-<concern>.controller.ts` | `use-<concern>.controller.test.ts` |
| A hook shared by sibling pages | `pages/<group>/shared/use-<concern>.controller.ts` | `.controller.test.ts` |
| Filtering, parsing or mapping used by one module | `<module>.utils.ts` next to it | `<module>.utils.test.ts` |
| The same pure helper needed by a second module | move to `src/lib/<domain>/<name>.ts` | `<name>.test.ts` |
| A Zod schema (request, form, OpenAPI) | `src/schemas/<name>-schema.ts` | `<name>-schema.test.ts` |
| Landing or marketing copy and data | `src/content/` | n/a |
| Test or story data | `src/mock/fixtures/` + `src/mock/handlers/` | n/a |

---

## 3. What may it import? (lint-enforced)

```mermaid
flowchart LR
    subgraph Server["Server runtime"]
        APP["src/app/**<br/>routes · API handlers"]
        SRV["src/server/**<br/>server-only"]
    end
    subgraph Client["Client bundle"]
        PAGES["components/pages/**<br/>controllers"]
        BPE["blocks · patterns · elements<br/>(pure UI)"]
        DATA["src/data/**"]
        HOOKS["src/hooks/**"]
        PROV["src/providers/**"]
    end
    subgraph Universal["Universal (no runtime ties)"]
        LIB["src/lib/**"]
        SCH["src/schemas/**"]
        TYP["src/types/api.ts"]
    end

    APP --> SRV
    APP --> PAGES
    SRV --> SCH
    PAGES --> BPE
    PAGES --> DATA
    PAGES --> HOOKS
    DATA --> TYP
    DATA -. "HTTP /api/*" .-> APP
    BPE --> LIB
    PAGES --> LIB
    PAGES --> SCH
    PROV --> HOOKS

    PAGES -. "✗ @/server" .-x SRV
    BPE -. "✗ @/data" .-x DATA
    LIB -. "✗ react / next / @/data" .-x DATA
```

| From | ✗ May not import | Biome message starts with |
| :--- | :--- | :--- |
| components (all tiers), `src/data`, `src/hooks`, `src/providers`, `src/content`, `src/mock`, `src/types`, `.storybook` | `@/server/**`, `server-only` | "Server-only code (@/server/**) is imported only by src/app/**" |
| elements, patterns, blocks | `@/data/**`, `@tanstack/react-query`, `next-auth/react`, `next/navigation` | "Business logic (queries, mutations, … in @/data) belongs in @/components/pages" |
| `src/lib/**` (non-test) | `react`, `react-dom`, `next/**`, `next-auth/**`, `@tanstack/**`, `@/data/**`, `@/components/**`, `@/server/**` | "src/lib is framework-free" |

Two more guards back this up:
- **Next.js build:** importing a `server-only` module into a client component fails `pnpm build`.
- **`tsc`:** Vitest aliases `server-only` to `src/test/server-only-stub.ts`, and `pnpm typegen` runs with `--conditions=react-server`, so neither breaks under plain Node.

---

## 4. Recipes

### 4.1 Extract pure logic from a controller
1. Move the pure function(s) to `pages/<route>/<route>.utils.ts`, with named exports and no React imports.
2. Add `<route>.utils.test.ts`, built from `src/mock/fixtures` (e.g. `inbox.utils.test.ts` asserts `countByStatus(messageScenarios.mixed)` equals `mixedMessageCounts`).
3. Import the utils into the controller and keep only wiring there (`useMemo(() => countByStatus(all), [all])`).

**Done when** the controller has no branching that could be tested without React.

### 4.2 Promote a util to `src/lib`
1. A second module needs it. Move it to `src/lib/<domain>/<name>.ts` and its test next to it.
2. If it mixes a pure builder with a browser effect, split them: the builder goes in `lib/<domain>/`, the effect in `lib/browser/` (`buildMessagesExport` + `downloadTextFile`).
3. Update both consumers and delete the old `.utils.ts`.

**Done when** `pnpm check` passes, meaning the lib file imports no framework.

### 4.3 Add an API call end-to-end
1. Schema → OpenAPI registry (`src/server/openapi/openapi.ts`) → `pnpm typegen` ([api-patterns.md](api-patterns.md)).
2. Add a DTO alias to `src/types/api.ts` if the UI needs the shape.
3. Add a query in `src/data/<domain>/<domain>.queries.ts`, or a mutation in a new `src/data/<domain>/use-<action>-mutation.ts`.
4. Add a typed MSW handler and scenario in `src/mock/handlers/<domain>.handlers.ts`.
5. Use it from a page controller and extend that controller's test (happy path + error scenario).

### 4.4 Add a server capability
1. Create `src/server/<capability>/<name>.ts`, starting with `import "server-only";`.
2. Import it only from `src/app/api/**` or other server modules.
3. Add `<name>.test.ts` if it has logic. It runs in the unit project through the stub alias.

### 4.5 Add or split a controller (and its test)
1. One hook per file: `use-<concern>.controller.ts`. If a hook is shared by sibling routes, put it in `pages/<group>/shared/`.
2. A controller may compose another (`useSignUpController` calls `useUsernameAvailabilityController(form)` and `useGoogleSignInController()`).
3. Write `use-<concern>.controller.test.ts` using the harness (section 5).

```mermaid
flowchart TB
    SUP["sign-up-page.tsx"] --> SU["useSignUpController"]
    SIP["sign-in-page.tsx"] --> SI["useSignInController"]
    SU --> UA["useUsernameAvailabilityController"]
    SU --> G["shared/useGoogleSignInController"]
    SI --> G
    UA --> UAU["username-availability.utils.ts<br/>deriveUsernameAvailability · isCheckableUsername"]
    UA --> AQ["@/data/auth/auth.queries<br/>checkUsername"]
    SU --> SM["@/data/auth/use-sign-up-mutation"]
```

---

## 5. Controller test harness (ADR 0019)

```ts
import { act, waitFor } from "@testing-library/react";
import { toast } from "sonner";
import { scenarios } from "@/mock/handlers";
import { server } from "@/test/msw-server";
import { recordRequests, renderHookWithProviders } from "@/test/test-utils";

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

it("ignores a blank AMA prompt", async () => {
  const requests = recordRequests();
  const { result } = renderHookWithProviders(() => useProfileController());

  act(() => result.current.setAmaPrompt("   "));
  await act(() => result.current.handleSaveAmaPrompt());

  expect(requests).not.toContain("PATCH /api/user/ama-prompt");
});
```

| Need | Use |
| :--- | :--- |
| Providers | `renderHookWithProviders(hook, { session?, queryClient? })`. The session defaults to `null`: no session fetch, no SSE. |
| A signed-in user | `{ session: sessionScenarios.authenticated }` |
| A server state | `server.use(...scenarios.<area>.<name>)`, e.g. `scenarios.inbox.error`, `scenarios.username.taken` |
| "Was the API called?" | `const requests = recordRequests()` → `expect(requests).toContain("POST /api/messages/bulk")` |
| Router | `const { replace } = vi.hoisted(() => ({ replace: vi.fn() }))` + `vi.mock("next/navigation", () => ({ useRouter: () => ({ replace }) }))` |
| Toasts | `vi.mock("sonner", …)` |
| `signIn` | `vi.mock("next-auth/react", () => ({ signIn: vi.fn() }))` (no `renderHookWithProviders`, use plain `renderHook`) |
| Downloads | `vi.mock("@/lib/browser/download", () => ({ downloadTextFile: vi.fn() }))` |
| Never | mocking `@/data/**`, or hitting the real network |

---

## 6. Checklist before you finish

- [ ] The file is where the flowchart (section 2) puts it, and it is named `use-*.controller.ts`, `use-*-mutation.ts`, `<domain>.queries.ts` or `<module>.utils.ts`.
- [ ] New server files start with `import "server-only"`.
- [ ] Every new `*.utils.ts`, lib/server module with logic and controller has a colocated test; there are no `__tests__/` folders.
- [ ] Client code uses `@/types/api` DTOs, never `@/server/models`.
- [ ] `pnpm check && pnpm exec tsc --noEmit && pnpm test:all && pnpm build && pnpm docs:registry:check` all pass.

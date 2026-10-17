# API & Client-Server Patterns for Agents

This guide defines the mandatory patterns every agent must follow when creating, modifying, or consuming API endpoints in GhostMsg.

---

## 1. Mandatory 4-Step Pattern for API Endpoints

Whenever adding or modifying an API route, you **MUST** follow this exact 4-step sequence:

```
Step 1: Schemas (SSoT) ──▶ Step 2: Registry ──▶ Step 3: Typegen ──▶ Step 4: Consumer
  (src/schemas/)          (src/server/openapi/openapi.ts)     (pnpm typegen)       (React Query + api.*)
```

### Step 1: Define Schemas in `src/schemas/`
- Every request param, query param, request body, and status response schema must be defined using Zod and annotated with `.openapi(...)`.
- Shared response schemas reside in [`src/schemas/api-response-schemas.ts`](../../src/schemas/api-response-schemas.ts).

### Step 2: Register in `src/server/openapi/openapi.ts`
- Register the schema names using `registry.register(...)`.
- Register the route operation via `registry.registerPath({...})` specifying:
  - `method`, `path`, `summary`, `description`, `tags`
  - `request` (`query`, `params`, `body`)
  - `responses` (`200`, `400`, `401`, `404`, `500`) with appropriate schema references.

### Step 3: Regenerate TypeScript Definitions
- Run the typegen command to update [`src/generated/api-schema.d.ts`](../../src/generated/api-schema.d.ts):
  ```bash
  pnpm typegen
  ```
- **Never edit `src/generated/api-schema.d.ts` manually.**

### Step 4: Implement Route & Consume with `clientFetch` + React Query
- **Route Handler**: Implement `src/app/api/[endpoint]/route.ts` validating requests with Zod `safeParse` and returning structured `Response.json({...}, { status })`.
- **Query Options**: Define query keys in `src/data/query-keys.ts` and pure `queryOptions` in `src/data/<domain>/<domain>.queries.ts` using `clientFetch` from `@/data/api-client`.
- **Custom Mutation Hooks**: One hook per file at `src/data/<domain>/use-<action>-mutation.ts` ([ADR 0018](../adr/0018-source-structure-server-data-lib-utils-controllers-tests.md), Q11). Pick the shape from the table in section 1.1.
- **Lists**: an endpoint that returns a collection filters, searches and pages **on the server** (keyset cursor, `limit`, `nextCursor`) and is consumed with `infiniteQueryOptions`; counts come from their own endpoint. Never download everything and filter on the client ([ADR 0030](../adr/0030-server-side-inbox-filtering-paging-and-counts.md)).
- **Client types**: Response shapes on the client come from OpenAPI via `src/types/api.ts` (`MessageDto`, `PublicAnswerDto`, …). Never import a Mongoose model (`@/server/models/**`) into client code: Biome blocks `@/server/**` outside `src/app` and `src/server`.
- **Consumer location**: Queries and mutations are consumed **only** in page controllers (`src/components/pages/<route>/use-*.controller.ts`). Elements, patterns and blocks never import them, and Biome enforces this ([ADR 0015](../adr/0015-four-tier-components-pages-layer-and-vendor-consolidation.md)).

### Step 5: Update the MSW handlers and fixtures
- Every endpoint used by a page needs a handler in `src/mock/handlers/<domain>.handlers.ts`, typed with `ok(path, method, body)` (200) or `created(path, method, body)` (201). A contract change then breaks the handler at compile time.
- Response data comes from `src/mock/fixtures`. Add a named scenario (e.g. `error`, `empty`, `loading`) and expose it in `scenarios` (`src/mock/handlers/index.ts`).
- Run `pnpm docs:registry` so the scenario appears in Chapter 11. See [ADR 0016](../adr/0016-storybook-msw-and-story-driven-component-testing.md).

```typescript
// 1. Define queryOptions in src/data/resource/resource.queries.ts
import { queryOptions } from "@tanstack/react-query";
import { api, clientFetch } from "@/data/api-client";
import { queryKeys } from "@/data/query-keys";

export const resourceQueries = {
  detail: (id: string) =>
    queryOptions({
      queryKey: queryKeys.resource.detail(id),
      queryFn: ({ signal }) =>
        clientFetch(
          api.GET("/api/resource/{id}", {
            params: { path: { id } },
            signal,
          })
        ),
      staleTime: 60 * 1000,
    }),
};

// 2. Define mutation hook in src/data/resource/use-update-resource-mutation.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, clientFetch } from "@/data/api-client";
import { queryKeys } from "@/data/query-keys";

export function useUpdateResourceMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { id: string; name: string }) =>
      clientFetch(
        api.POST("/api/resource/{id}", {
          params: { path: { id: payload.id } },
          body: { name: payload.name },
        })
      ),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.resource.all });
      toast.success(data.message || "Updated successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Update failed");
    },
  });
}
```

### 1.1 Which mutation shape?

| The mutation… | Use | Example |
| :--- | :--- | :--- |
| Edits one settings-like resource (a switch, a select, a profile form) | `useOptimisticResourceMutation({ queryKey, scopeId, mutationFn, merge, errorMessage, successMessage?, alsoInvalidate? })` from `src/data/optimistic-resource-mutation.ts`: optimistic, queued per `scopeId`, rollback + one error toast, silent unless `successMessage` | `use-update-preferences-mutation.ts` |
| Changes messages in the inbox | `useMutation` + the helpers in `src/data/messages/messages-cache.ts` (`patchCachedMessage`, removals over every cached page); on settle `invalidateCachedMessages` refreshes lists + counts | `use-update-message-mutation.ts`, `use-delete-message-mutation.ts` |
| Is a one-shot form action (sign-up, verify, send, change username, delete account) | plain `useMutation`; the page controller shows the toast or redirect | `use-sign-up-mutation.ts` |
| Only reads (`GET`), even AI ideas | a **query** in `<domain>.queries.ts`; "load again" is `refetch` | `publicQueries.suggestions()` |

Full rules: [Chapter 20 §2](../20-state-management.md#2-rules).

---

## 2. Anti-Patterns to Strictly Avoid

| Anti-Pattern | Why It's Banned | Correct Pattern |
| :--- | :--- | :--- |
| ❌ Calling `api.*` directly in UI components | Bypasses caching, loading state lifecycle, and DevTools. | Use custom `useMutation` hooks and `useQuery(queryOptions)`. |
| ❌ Manual `if (error \|\| !data)` in every hook | Verbose boilerplate and inconsistent error structures. | Use `clientFetch()` from `@/data/api-client` which throws `ApiError`. |
| ❌ Inline string array query keys (`["messages"]`) | Fragile, error-prone, hard to manage scoped invalidations. | Centralize in `queryKeys` factory (`src/data/query-keys.ts`). |
| ❌ Using `axios` or raw native `fetch()` | Strictly forbidden! Bypasses OpenAPI type-checking, introduces type drift, breaks schema validation contract. | Use `api` (`openapi-fetch`) + `clientFetch` from `@/data/api-client`. |
| ❌ Manual `useState` for loading/data in fetchers | Causes race conditions & cache desync. | Use `@tanstack/react-query` (`useQuery`, `useMutation`). |
| ❌ A `GET` wrapped in `useMutation` + a `useEffect` to fire it | Double calls under Strict Mode, no cache, no dedupe. | A query; `enabled` gates it, `refetch` reloads it. |
| ❌ Fetching a whole collection to filter, search or count on the client | Unbounded downloads; counts depend on what happened to load. | Server-side filter + keyset paging + a counts endpoint. |
| ❌ Hand-written `onMutate`/rollback for a settings resource | Inconsistent toasts; overlapping toggles roll back to a stale value. | `useOptimisticResourceMutation` with its own `scopeId`. |
| ❌ Settings or preferences in the session token | Set at sign-in, never updated, so it goes stale. | Identity only in the JWT; read settings through their query. |
| ❌ Manually editing `src/generated/api-schema.d.ts` | Overwritten on build. | Run `pnpm typegen`. |
| ❌ Adding endpoints without OpenAPI registration | Breaks documentation & SDK type inference. | Register every route in `src/server/openapi/openapi.ts`. |


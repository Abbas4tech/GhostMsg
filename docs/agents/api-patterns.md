# API & Client-Server Patterns for Agents

This guide defines the mandatory patterns every agent must follow when creating, modifying, or consuming API endpoints in GhostMsg.

---

## 1. Mandatory 4-Step Pattern for API Endpoints

Whenever adding or modifying an API route, you **MUST** follow this exact 4-step sequence:

```
Step 1: Schemas (SSoT) ──▶ Step 2: Registry ──▶ Step 3: Typegen ──▶ Step 4: Consumer
  (src/schemas/)          (src/lib/openapi.ts)     (npm run typegen)     (React Query + api.*)
```

### Step 1: Define Schemas in `src/schemas/`
- Every request param, query param, request body, and status response schema must be defined using Zod and annotated with `.openapi(...)`.
- Shared response schemas reside in [`src/schemas/api-response-schemas.ts`](file:///d:/Projects/GhostMsg/src/schemas/api-response-schemas.ts).

### Step 2: Register in `src/lib/openapi.ts`
- Register the schema names using `registry.register(...)`.
- Register the route operation via `registry.registerPath({...})` specifying:
  - `method`, `path`, `summary`, `description`, `tags`
  - `request` (`query`, `params`, `body`)
  - `responses` (`200`, `400`, `401`, `404`, `500`) with appropriate schema references.

### Step 3: Regenerate TypeScript Definitions
- Run the typegen command to update [`src/generated/api-schema.d.ts`](file:///d:/Projects/GhostMsg/src/generated/api-schema.d.ts):
  ```bash
  npm run typegen
  # or
  pnpm typegen
  ```
- **Never edit `src/generated/api-schema.d.ts` manually.**

### Step 4: Implement Route & Consume with `clientFetch` + React Query
- **Route Handler**: Implement `src/app/api/[endpoint]/route.ts` validating requests with Zod `safeParse` and returning structured `Response.json({...}, { status })`.
- **Query Options**: Define query keys in `src/queries/query-keys.ts` and pure `queryOptions` in `src/queries/[domain].queries.ts` using `clientFetch` from `@/lib/api-client`.
- **Custom Mutation Hooks**: Define mutations under `src/hooks/mutations/` using `useMutation` with standardized cache invalidation or optimistic rollback.

```typescript
// 1. Define queryOptions in src/queries/resource.queries.ts
import { queryOptions } from "@tanstack/react-query";
import { api, clientFetch } from "@/lib/api-client";
import { queryKeys } from "./query-keys";

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

// 2. Define mutation hook in src/hooks/mutations/use-update-resource.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, clientFetch } from "@/lib/api-client";
import { queryKeys } from "@/queries/query-keys";

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

---

## 2. Anti-Patterns to Strictly Avoid

| Anti-Pattern | Why It's Banned | Correct Pattern |
| :--- | :--- | :--- |
| ❌ Calling `api.*` directly in UI components | Bypasses caching, loading state lifecycle, and DevTools. | Use custom `useMutation` hooks and `useQuery(queryOptions)`. |
| ❌ Manual `if (error \|\| !data)` in every hook | Verbose boilerplate and inconsistent error structures. | Use `clientFetch()` from `@/lib/api-client` which throws `ApiError`. |
| ❌ Inline string array query keys (`["messages"]`) | Fragile, error-prone, hard to manage scoped invalidations. | Centralize in `queryKeys` factory (`src/queries/query-keys.ts`). |
| ❌ Using `axios` or raw native `fetch()` | Strictly forbidden! Bypasses OpenAPI type-checking, introduces type drift, breaks schema validation contract. | Use `api` (`openapi-fetch`) + `clientFetch` from `@/lib/api-client`. |
| ❌ Manual `useState` for loading/data in fetchers | Causes race conditions & cache desync. | Use `@tanstack/react-query` (`useQuery`, `useMutation`). |
| ❌ Manually editing `src/generated/api-schema.d.ts` | Overwritten on build. | Run `npm run typegen`. |
| ❌ Adding endpoints without OpenAPI registration | Breaks documentation & SDK type inference. | Register every route in `src/lib/openapi.ts`. |


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

### Step 4: Implement Route & Consume with `openapi-fetch` + React Query
- **Route Handler**: Implement `src/app/api/[endpoint]/route.ts` validating requests with Zod `safeParse` and returning structured `Response.json({...}, { status })`.
- **Client Consumer**: Use `api.GET()`, `api.POST()`, `api.DELETE()` from [`@/lib/api-client`](file:///d:/Projects/GhostMsg/src/lib/api-client.ts) inside `@tanstack/react-query` hooks:

```typescript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

// Query pattern
export function useResource() {
  return useQuery({
    queryKey: ["resource-key"],
    queryFn: async ({ signal }) => {
      const { data, error } = await api.GET("/api/resource-path", { signal });
      if (error || !data) {
        throw new Error(error?.message || "Failed to fetch");
      }
      return data;
    },
  });
}

// Mutation pattern
export function useUpdateResource() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const { data, error } = await api.POST("/api/resource-path", {
        body: payload,
      });
      if (error || !data) {
        throw new Error(error?.message || "Failed to update");
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resource-key"] });
    },
  });
}
```

---

## 2. Anti-Patterns to Strictly Avoid

| Anti-Pattern | Why It's Banned | Correct Pattern |
| :--- | :--- | :--- |
| ❌ Using `axios` | Outdated, uninstalled, adds bundle bloat. | Use `api` (`openapi-fetch`) from `@/lib/api-client`. |
| ❌ Untyped raw `fetch()` | Prone to runtime type errors and URL typos. | Use `api.GET()` / `api.POST()` / `api.DELETE()`. |
| ❌ Manual cancel tokens / `isCancel` | Legacy pattern. | Pass native `{ signal }` from `useQuery`. |
| ❌ Manual `useState` for loading/data in fetchers | Causes race conditions & cache desync. | Use `@tanstack/react-query` (`useQuery`, `useMutation`). |
| ❌ Manually editing `src/generated/api-schema.d.ts` | Overwritten on build. | Run `npm run typegen`. |
| ❌ Adding endpoints without OpenAPI registration | Breaks documentation & SDK type inference. | Register every route in `src/lib/openapi.ts`. |

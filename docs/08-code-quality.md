# Chapter 8: Code Quality & Standards

This chapter outlines GhostMsg's strict code standards, linting configuration via Ultracite (Biome), TypeScript compiler settings, and architectural anti-patterns.

---

## 1. Ultracite (Biome) Tooling ([ADR 0004](file:///d:/Projects/GhostMsg/docs/adr/0004-ultracite-and-biome-tooling.md))

GhostMsg has standardized on **Ultracite** (powered by Biome) to replace legacy ESLint and Prettier setups:
- **Sub-second execution**: Checks 100+ files in under 200ms.
- **Zero configuration drift**: Consistent rules across developer machines, pre-commit hooks, and CI pipelines.
- **Strict linting**: Enforces accessibility (`a11y`), hook dependencies, imports sorting, and anti-pattern bans.

### Commands
```bash
# Verify formatting and linting
pnpm check

# Automatically fix linting and formatting
pnpm fix
```

---

## 2. TypeScript Strict Mode & Compiler Configuration

TypeScript is configured with strict compiler flags in [`tsconfig.json`](file:///d:/Projects/GhostMsg/tsconfig.json):
- `strict: true`
- `noImplicitAny: true`
- `strictNullChecks: true`
- Path aliases: `@/*` mapped to `./src/*`

### Type Checking
```bash
npx tsc --noEmit
```

---

## 3. Banned Anti-Patterns

| Banned Practice | Enforced Alternative |
| :--- | :--- |
| `axios` imports | `api` (`openapi-fetch`) from [`@/lib/api-client`](file:///d:/Projects/GhostMsg/src/lib/api-client.ts) |
| Untyped raw `fetch()` calls | `api.GET()`, `api.POST()`, `api.DELETE()` |
| Manual `useState` for API data | `@tanstack/react-query` (`useQuery`, `useMutation`) |
| Untyped `any` casting | Strongly typed Zod schemas (`z.infer<typeof schema>`) |
| Unverified string endpoints | Strongly typed OpenAPI `paths` |

---

## 4. Next Chapter
Proceed to [Chapter 9: Deployment & Operations](file:///d:/Projects/GhostMsg/docs/09-deployment-and-operations.md).

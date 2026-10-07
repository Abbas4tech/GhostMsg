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
| Array index as React `key` (`key={index}`) | Stable unique IDs (`key={item.id}` or deterministic item attributes) |

---

## 4. Biome Suppression Elimination & Code Quality ([ADR 0009](file:///d:/Projects/GhostMsg/docs/adr/0009-biome-suppression-elimination-and-lint-remediation.md))

GhostMsg enforces a **zero-inline-suppression policy** and strict linter rules for core application and feature code:
- **No Array Index Keys (`suspicious.noArrayIndexKey: "error"`)**: React list rendering must always use stable, deterministic keys (e.g. database `_id`, semantic names, or deterministic angle/coordinate formulas) rather than array indices. Array index keys cause subtle reconciliation bugs, state leakage across reordered items, and animation glitching with Motion / `AnimatePresence`.
- **No Interactive `<div>`s**: Interactive elements must use semantic `<button type="button">` with `aria-label` or `<input>` to satisfy `a11y` rules.
- **No `any` Types**: Generic utility hooks and NextAuth callbacks must use `unknown`, strongly typed interfaces, or generic parameters.
- **No Nested Ternaries**: Branching logic must use early returns, guard clauses, or isolated resolver functions.
- **Scoped UI Overrides**: Framework conventions in third-party primitives (e.g. `src/components/ui/`) are configured centrally via `overrides` in [`biome.jsonc`](file:///d:/Projects/GhostMsg/biome.jsonc) rather than through ad-hoc inline comments.

---

## 5. Next Chapter
Proceed to [Chapter 9: Deployment & Operations](file:///d:/Projects/GhostMsg/docs/09-deployment-and-operations.md).



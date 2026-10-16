---
"ghostmsg": minor
---

Source structure: a real boundary between server, client data and pure logic, with colocated tests everywhere.

- **Runtime split:** `src/server/` holds server-only code (each file guarded by `import "server-only"`); `src/lib/` holds pure, framework-agnostic helpers only; client infrastructure (API client, query keys, hooks, mutations) moved into `src/data/<domain>/`.
- **Enforcement:** Biome `noRestrictedImports` bans `@/server/**` from components, data, hooks, lib and Storybook; bans `@/data/**` below `pages/`; keeps `src/lib/**` free of React, Next, NextAuth and TanStack imports (ADR 0018).
- **Renamed/moved:** `src/context/` → `src/providers/`; `src/helpers/` absorbed into `src/server/email/`; `src/queries/` and `src/hooks/mutations/` removed in favor of `src/data/`; real landing-page content moved to `src/content/`; client DTOs now come from the generated OpenAPI schema (`src/types/api.ts`) instead of Mongoose model types.
- **Tests:** always colocated (no `__tests__/`); every `*.utils.ts`, every `src/lib`/`src/server` module with logic, and every page controller now has its own test.
- **Docs:** ADR 0018, agent guide `docs/agents/source-structure.md`.

# Agent Guidelines

## Agent skills

### Issue tracker

GitHub issues via `gh` CLI for `Abbas4tech/GhostMsg`. See `docs/agents/issue-tracker.md`.

### Triage labels

Canonical five-role vocabulary (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context (`GLOSSARY.md` and `docs/adr/` at root). See `docs/agents/domain.md`.

### Agent guide index

`docs/agents/README.md` maps each kind of task to its guide and to reference chapters 12–19 (product, design system, screens, data model, API, trust & safety, notifications, release summary).

### Product rules & safety

Before changing user-facing behaviour, settings, copy, moderation, notifications, or anything that stores or shows sender data, read `docs/agents/product-rules.md` (invariants S1–S10, recipient-control and copy rules). Depth: `docs/17-trust-safety-and-privacy.md`.

### Design system

shadcn (Radix) components first; the design is applied through opt-in CVA variants inside `src/components/elements/*`, semantic tokens only, every screen in 3 palettes × light/dark. Before adding a token, variant, palette or element, read `docs/13-design-system-and-theming.md`.

### Documentation

Every change updates the docs it affects (`docs/agents/documentation-maintenance.md` maps changes to chapters, glossary, ADRs and screenshots). Screenshots are generated: `pnpm build-storybook && pnpm docs:screenshots`.

### API & client-server patterns

OpenAPI 3.1 Zod registry (`src/server/openapi/openapi.ts`), automated typegen (`pnpm typegen`), `openapi-fetch` (`api` from `@/data/api-client`), and `@tanstack/react-query`. 
**STRICT RULE**: NEVER use native `fetch()` or `axios`. ALL client API calls MUST be type-safe using the OpenAPI SDK (`api.GET`, `api.POST`, `api.PATCH`, etc. wrapped in `clientFetch`).

### Component architecture

Four-tier `src/components/`: `elements → patterns → blocks → pages`. Business logic (React Query, mutations, session, router, adapters) lives **only** in `pages/<route>/use-*.controller.ts`; elements, patterns and blocks are pure (props + callbacks). Before any UI, component, route-page, or registry (`shadcn add` / `@animate-ui`) change, read `docs/agents/component-architecture.md`. Rule summary: `.agents/rules/component-architecture.md`.

### Source structure (where code goes)

`src/server/` is server-only (`import "server-only"`: db, models, email, ai, push, security, realtime, openapi). `src/data/` is the client data layer (api-client, query-keys, `<domain>/<domain>.queries.ts`, one `use-*-mutation.ts` per file). `src/lib/` holds pure, framework-free helpers by domain. `src/hooks/` holds generic hooks only. `src/providers/` holds context providers, `src/content/` static app content and `src/types/api.ts` the OpenAPI DTOs used on the client. Pure helpers start colocated as `<module>.utils.ts`; promote them to `src/lib/<domain>/` once two or more modules use them. Tests are always colocated (no `__tests__/`): every `*.utils.ts`, every lib/server module with logic and every page controller (`*.controller.test.ts`) has one. Before adding or moving files outside `src/components`, or writing a controller test, read `docs/agents/source-structure.md` (placement flowchart, import boundaries, recipes, test harness). Rationale: ADR 0018 (structure) and ADR 0019 (controller tests). Rule summary: `.agents/rules/source-structure.md`.

### Testing, Storybook & mocks

Storybook 10 (`@storybook/nextjs-vite`) stories are the component tests. They run via `pnpm test:stories` in headless Chromium with `play()` and axe. Mock data comes only from `src/mock/fixtures`, and network calls only through MSW handlers in `src/mock/handlers`. Before writing a story, `*.mock.ts` or test, read `docs/10-storybook-and-ui-catalog.md`. Rationale: ADR 0016. The generated inventory is in `docs/11-component-registry.md`: run `pnpm docs:registry` after component, story, mock or scenario changes. Package manager: **pnpm only**.

### Email Provider
Nodemailer + `@react-email/render` via SMTP (configured via `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` env variables in `src/server/email/mailer.ts`). `resend` package has been completely removed.



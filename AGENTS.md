# Agent Guidelines

## Agent skills

### Issue tracker

GitHub issues via `gh` CLI for `Abbas4tech/GhostMsg`. See `docs/agents/issue-tracker.md`.

### Triage labels

Canonical five-role vocabulary (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context (`GLOSSARY.md` and `docs/adr/` at root). See `docs/agents/domain.md`.

### API & client-server patterns

OpenAPI 3.1 Zod registry (`src/lib/openapi.ts`), automated typegen (`pnpm typegen`), `openapi-fetch` (`api` from `@/lib/api-client`), and `@tanstack/react-query`. 
**STRICT RULE**: NEVER use native `fetch()` or `axios`. ALL client API calls MUST be type-safe using the OpenAPI SDK (`api.GET`, `api.POST`, `api.PATCH`, etc. wrapped in `clientFetch`).

### Component architecture

Four-tier `src/components/`: `elements → patterns → blocks → pages`. Business logic (React Query, mutations, session, router, adapters) lives **only** in `pages/<route>/use-*.controller.ts`; elements, patterns and blocks are pure (props + callbacks). Before any UI, component, route-page, or registry (`shadcn add` / `@animate-ui`) change, read `docs/agents/component-architecture.md`. Rule summary: `.agents/rules/component-architecture.md`.

### Testing, Storybook & mocks

Storybook 10 (`@storybook/nextjs-vite`) stories are the component tests. They run via `pnpm test:stories` in headless Chromium with `play()` and axe. Mock data comes only from `src/mock/fixtures`, and network calls only through MSW handlers in `src/mock/handlers`. Before writing a story, `*.mock.ts` or test, read `docs/10-storybook-and-ui-catalog.md`. Rationale: ADR 0016. The generated inventory is in `docs/11-component-registry.md`: run `pnpm docs:registry` after component, story, mock or scenario changes. Package manager: **pnpm only**.

### Email Provider
Nodemailer + `@react-email/render` via SMTP (configured via `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` env variables in `src/lib/mailer.ts`). `resend` package has been completely removed.



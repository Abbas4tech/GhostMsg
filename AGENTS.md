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

### Email Provider
Nodemailer + `@react-email/render` via SMTP (configured via `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` env variables in `src/lib/mailer.ts`). `resend` package has been completely removed.



# Agent Guidelines

## Agent skills

### Issue tracker

GitHub issues via `gh` CLI for `Abbas4tech/GhostMsg`. See `docs/agents/issue-tracker.md`.

### Triage labels

Canonical five-role vocabulary (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context (`GLOSSARY.md` and `docs/adr/` at root). See `docs/agents/domain.md`.

### API & client-server patterns

OpenAPI 3.1 Zod registry (`src/lib/openapi.ts`), automated typegen (`pnpm typegen`), `openapi-fetch` (`api` from `@/lib/api-client`), and `@tanstack/react-query`. Never use Axios or raw untyped fetch. See `docs/agents/api-patterns.md`.


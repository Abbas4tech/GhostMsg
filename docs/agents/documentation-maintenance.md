# Documentation Maintenance for Agents

Which docs a change must update, how to keep screenshots and diagrams current, and the writing conventions for `docs/`. A change is **not done** until the docs it affects match the code ([ADR 0028](../adr/0028-agent-first-documentation-system-and-generated-screenshots.md)).

---

## 1. Change → docs map

| If you change… | Update | Regenerate |
| :--- | :--- | :--- |
| A component, story, mock, fixture or MSW scenario | [Chapter 14](../14-ui-screens-and-user-flows.md) composition tables if a screen changed | `pnpm docs:registry` (Chapter 11) |
| Anything visible on a screen | [Chapter 14](../14-ui-screens-and-user-flows.md) states | `pnpm build-storybook && pnpm docs:screenshots <shot names>` |
| Tokens, fonts, palettes, element variants | [Chapter 13](../13-design-system-and-theming.md) | `pnpm theme:contrast`; palette screenshots |
| A user-facing feature or setting | [Chapter 12](../12-product-guide-and-features.md), [product-rules.md](product-rules.md) §6 | screenshots |
| A model field or index | [Chapter 15](../15-data-model-and-database.md) (ER diagram + tables) | — |
| An endpoint (new, changed request/response/status) | [Chapter 16](../16-api-reference.md), [Chapter 4](../04-api-and-type-safety.md) operations matrix | `pnpm typegen` |
| Moderation, blocking, rate limits, privacy | [Chapter 17](../17-trust-safety-and-privacy.md) (and its known-issues table) | — |
| Email, push, SSE, quiet hours | [Chapter 18](../18-notifications-and-realtime.md) | — |
| A query, mutation, cache rule or where some state lives | [Chapter 20](../20-state-management.md) (state map, rules, review status) | — |
| A domain term | [`GLOSSARY.md`](../../GLOSSARY.md) (with `_Avoid_`) | — |
| A hard-to-reverse or surprising decision | New ADR in `docs/adr/` (next number) + [docs/README.md](../README.md) index + root README list | — |
| Env vars | [`.env.example`](../../.env.example) (the complete list: purpose, default, what breaks without it; optional lines commented out), the [Chapter 2](../02-getting-started.md) summary table, the [Chapter 9](../09-deployment-and-operations.md) production checklist | — |
| Fixing a known issue (K1…) | Remove its row in [Chapter 17 §10](../17-trust-safety-and-privacy.md#10-known-issues-code-that-does-not-yet-meet-these-rules) and mentions in Chapters 12/15/18 | — |

## 2. Screenshots

- Generated only: `scripts/capture-doc-screenshots.ts` renders Storybook stories (with MSW fixtures) in headless Chromium and writes `docs/assets/screenshots/<name>.png`.
- Workflow: `pnpm build-storybook` (writes the git-ignored `storybook-static/`), then `pnpm docs:screenshots` for all shots or `pnpm docs:screenshots <name> <name>` for some.
- Add a shot: append to `SHOTS` with a story id (`<title lower-kebab>--<export-kebab>`), a viewport (`DESKTOP`, `LAPTOP`, `MOBILE`, `DIALOG`), optional `palette`, `mode`, `fullPage`.
- Fixture data only. Never capture real user content.
- Look at every new or changed PNG before committing (a loading spinner or an empty root means the story didn't finish).

## 3. Diagrams

Mermaid in fenced ` ```mermaid ` blocks: `flowchart` for structure and decisions, `sequenceDiagram` for request flows, `erDiagram` for data, `stateDiagram-v2` for lifecycles, `timeline` for history. Keep labels short; quote labels with special characters (`"/api/…"`); use `<br/>` for line breaks. A diagram must match the code it describes. Prefer citing the file it summarises.

## 4. Writing conventions

- **Relative links** from the file's own folder (`../src/…`, `adr/0024-….md`), never `file:///` absolute paths.
- **Open with what the chapter answers** and which ADRs back it; end with where to go next when useful.
- **Tables for reference, numbered steps for procedures**, each procedure ending on a done-check.
- **Cite paths** (`src/server/ai/quarantine-policy.ts`) instead of copying code that will drift; copy code only for short, stable examples.
- **Glossary terms verbatim**, capitalised as in `GLOSSARY.md`.
- **Record mismatches.** If the code and the intended behaviour differ, document the actual behaviour and add a known-issue row with the fix, instead of describing the intent as fact.
- **Plain language:** short sentences, no marketing adjectives, no em dashes.

## 5. Before you finish

- [ ] Every link you added resolves (relative path exists; anchors match headings).
- [ ] New chapters are listed in [docs/README.md](../README.md); new ADRs in both indexes.
- [ ] `pnpm docs:registry:check` passes.
- [ ] Screenshots re-captured for visible changes and reviewed.

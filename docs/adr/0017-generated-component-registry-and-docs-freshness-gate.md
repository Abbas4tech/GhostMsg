# ADR 0017: Generated Component Registry & Documentation Freshness Gate

## Status
**Accepted** (2026-10-12). Complements [ADR 0015](0015-four-tier-components-pages-layer-and-vendor-consolidation.md) and [ADR 0016](0016-storybook-msw-and-story-driven-component-testing.md).

---

## Context & Problem Statement

After the four-tier restructure and the story rewrite, the codebase has dozens of component modules, hundreds of stories and many fixtures and MSW scenarios. Hand-maintained inventories in Chapter 5 and the ADR registry logs had already drifted:
- **Chapter 7** described a Playwright E2E suite and unit tests that don't exist.
- **Chapter 5** said modals were hoisted at block level.
- **Several docs** still used `npm run` after the pnpm-only decision.

Agents and humans both rely on these docs to follow the structure "without explicit mention".

---

## Decision

1. **The inventory is generated, not written.** `scripts/generate-component-registry.ts` writes `docs/11-component-registry.md` from the source:
   - **Per tier:** module list, `index.ts` presence, story count, `play()` count, mock count and unit-test count.
   - **Per module:** public API (parsed from `index.ts`), each story file with its title and story names, mock files with their exports, and controllers (`use*Controller` in `*.controller.ts`).
   - **Fixtures:** builders, datasets and types from `src/mock/fixtures/*.fixtures.ts`.
   - **MSW scenarios:** imported at runtime from `src/mock/handlers` (`scenarios`), so the table is exact by construction.
2. **Scripts:** `pnpm docs:registry` writes the file. `pnpm docs:registry:check` exits 1 when the committed file differs (line endings normalized).
3. **Gate:** `docs:registry:check` is step 5 of `.agents/rules/pre-push-quality-checks.md` and of the agent completion gate.
4. **Prose docs keep rules, not lists.** Chapters 5 and 10 and the agent guide describe rules, contracts and recipes, and point to Chapter 11 for inventories.
5. **Related consistency fixes made at the same time:**
   - `build` script is now `pnpm typegen && next build`, and the typegen banner says `pnpm typegen`.
   - Chapter 7 now states that there is **no E2E suite**: Playwright is only the story-test browser provider.
   - Historical ADRs (0006, 0008, 0009, 0011–0014) got dated "Update" notes pointing to current locations instead of being rewritten.

---

## Consequences

### Positive
- **No inventory drift.** Adding a module, story, mock export or scenario without regenerating fails the pre-push gate.
- **One place to look.** Agents find every component, story and scenario in Chapter 11.

### Negative & Mitigations
- **Regex parsing of source files.** The generator relies on the repo conventions it documents (`export const X: Story`, `title: "…"`, `export { … } from` in `index.ts`). If a convention changes, update the generator in the same change. The check failing makes that visible.

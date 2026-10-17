# ADR 0028: Agent-First Documentation System and Generated Screenshots

## Status
**Accepted** (2026-10-14). Extends the generated registry of [ADR 0017](0017-generated-component-registry-and-docs-freshness-gate.md).

---

## Context

Most changes in this repository are made with AI agents. Agents start each task cold: they learn the product, its rules and its architecture only from what is in the repo and how clearly it is pointed to. The redesign added features, screens, endpoints, fields and policies faster than the docs tracked them. Some docs had already drifted from the code (for example, "Upstash Redis" for a limiter and event bus that are in-memory). Screens existed only in Storybook.

## Decisions

| # | Decision |
| :-- | :--- |
| D1 | **Numbered chapters by question**, not by team: product (12), design system (13), screens (14), data (15), API (16), trust & safety (17), notifications (18), release summary (19), next to the existing setup/architecture/testing chapters 01–11. Each opens with what it answers and links its ADRs. |
| D2 | **Agent entry points stay short and point outward.** `AGENTS.md` and `.claude/CLAUDE.md` hold one trigger line per branch ("before touching X, read Y"); the depth lives in `docs/` and `docs/agents/`. `docs/agents/README.md` is the index; `docs/agents/product-rules.md` lists the invariants an agent must not break; `docs/agents/documentation-maintenance.md` maps code changes to the docs they require. |
| D3 | **Screenshots are generated from Storybook**, never hand-made: `pnpm build-storybook && pnpm docs:screenshots` (`scripts/capture-doc-screenshots.ts`, Playwright) writes `docs/assets/screenshots/*.png`, including the palette × mode matrix. Re-capture after visible UI changes. |
| D4 | **Diagrams are Mermaid in Markdown** (flowcharts, sequences, ER, state), so they diff, review and render on GitHub without binary assets. |
| D5 | **Code is the source of truth; docs cite it.** Values that change often (variant lists, endpoints) are summarised with file paths; generated inventories (registry, OpenAPI at `/docs`) stay generated. Mismatches found while writing are recorded as **known issues** with a fix, never papered over. |
| D6 | **Relative links** inside `docs/` (not absolute `file:///` paths), so links work on GitHub, in editors and for agents reading the tree. |
| D7 | **Glossary first.** New domain terms are added to `GLOSSARY.md` (with `_Avoid_` lists) in the same change that introduces them. |

## Considered options

- **One long architecture document.** Rejected: agents load whole files; long files dilute attention (sprawl). Chapters let a pointer load only the branch that is needed.
- **Hand-captured screenshots.** Rejected: they rot on the first UI change and can't be re-shot consistently across palettes.
- **A docs site generator (Docusaurus, Nextra).** Deferred: Markdown in the repo already renders on GitHub and is what agents read; a site can be layered on later without moving content.

## Consequences

- A UI change is not done until its screenshots are re-captured; an API, model or policy change is not done until its chapter and the glossary are updated (see `docs/agents/documentation-maintenance.md`).
- `storybook-static/` stays git-ignored; screenshots (~4 MB of PNGs) are committed.
- The pre-push checklist keeps `pnpm docs:registry:check`; screenshot freshness is a review-time check (capturing needs a browser).

---
"ghostmsg": minor
---

Four-tier component architecture, Storybook 10 story-driven testing and generated docs.

- **Components:** `src/components` is split into `elements → patterns → blocks → pages`. Business logic lives only in page controllers, and Biome `noRestrictedImports` enforces the boundaries. Vendor shadcn `ui/` and Animate UI were moved into `elements/`, and the duplicate Button was merged (ADR 0015).
- **UI parity:** pre-refactor visuals were restored. Accessibility fixes found by the new a11y gate:
  - the sign-in/sign-up link was nested inside a button
  - carousel buttons had no names
  - the tabs highlight had an invalid `aria-selected`
  - the send-message textarea had no label
  - the public Q&A heading skipped a level
  - the destructive badge used an undefined text token
  - contrast was raised to WCAG AA: one shade darker on sentiment badges and red status text, and a darker light-mode `--muted-foreground` (ADR 0016 Q17/Q18)
- **Testing:** Storybook 10 (`@storybook/nextjs-vite`) stories are now the component tests. They run in a Vitest browser project (Chromium, `play()`, axe). Page stories use MSW. Unit tests are network-isolated with `msw/node`. Shared fixtures live in `src/mock/fixtures` and typed handlers in `src/mock/handlers` (ADR 0016).
- **Tooling:**
  - pnpm only (`packageManager` pinned, `package-lock.json` removed)
  - new scripts: `storybook`, `build-storybook`, `test:stories`, `test:all`, `docs:registry`, `docs:registry:check`
- **Docs:**
  - generated Component Registry (Chapter 11, ADR 0017)
  - agent guide `docs/agents/component-architecture.md`
  - updated chapters 2 and 4–11
  - dated update notes on historical ADRs

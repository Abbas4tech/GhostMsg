# Documentation Maintenance for Agents

Which docs a change must update, how to keep screenshots and diagrams current, and the writing conventions for `docs/`. A change is **not done** until the docs it affects match the code ([ADR 0028](../adr/0028-agent-first-documentation-system-and-generated-screenshots.md)).

---

## 1. Change → docs map

| If you change… | Update | Regenerate |
| :--- | :--- | :--- |
| A component, story, mock, fixture or MSW scenario | [UI Screens & User Flows](../features/screens-and-user-flows.md) composition tables if a screen changed | `pnpm docs:registry` (Component Registry) |
| Anything visible on a screen | [UI Screens & User Flows](../features/screens-and-user-flows.md) states | `pnpm build-storybook && pnpm docs:screenshots <shot names>` |
| Tokens, fonts, palettes, element variants | [Design System](../reference/design-system.md) | `pnpm theme:contrast`; palette screenshots |
| A user-facing feature or setting | [Product Guide](../features/product-guide.md), [product-rules.md](product-rules.md) §6 | screenshots |
| A model field or index | [Data Model](../reference/data-model.md) (ER diagram + tables) | — |
| An endpoint (new, changed request/response/status) | [API Reference](../reference/api-reference.md), [API & Type Safety](../04-api-and-type-safety.md) operations matrix | `pnpm typegen` |
| Moderation, blocking, rate limits, privacy | [Trust, Safety & Privacy](../features/trust-safety-and-privacy.md) (and its known-issues table) | — |
| Email, push, SSE, quiet hours | [Notifications & Real-Time](../features/notifications-and-realtime.md) | — |
| A query, mutation, cache rule or where some state lives | [State Management](../guides/state-management.md) (state map, rules, review status) | — |
| Sign-up, verification, sign-in, NextAuth | [Authentication & Verification](../features/authentication-and-verification.md) | — |
| Inbox filters, read state, archive, selection, deletes, live updates | [Inbox Triage](../features/inbox-triage.md) | — |
| A prompt, model, AI route or AI client hook | [AI Features](../features/ai-features.md) | — |
| A keyboard shortcut, toast copy or duration, focus rule, live region, animation | [Accessibility & Feedback](../guides/accessibility-and-feedback.md) (and the `?` sheet's `SHORTCUT_GROUPS`) | — |
| A phone/desktop difference, a breakpoint, a layout prop | [Responsive Design](../guides/responsive-design.md) | phone screenshots |
| A config file, install script, editor task or anything that runs code at start-up | [Supply-Chain Security](../guides/supply-chain-security.md) (and `scripts/check-suspicious-code.ts` if a new shape needs a check) | `pnpm security:check` |
| A confusing error you solved | [Troubleshooting](../guides/troubleshooting.md) (symptom → cause → fix) | — |
| A domain term | [`GLOSSARY.md`](../../GLOSSARY.md) (with `_Avoid_`) | — |
| A hard-to-reverse or surprising decision | New ADR in `docs/adr/` (next number) + [docs/README.md](../README.md) index + root README list | — |
| Env vars | [`.env.example`](../../.env.example) (the complete list: purpose, default, what breaks without it; optional lines commented out), the [Getting Started](../02-getting-started.md) summary table, the [Deployment & Operations](../09-deployment-and-operations.md) production checklist | — |
| A Vercel project setting, a Production/Preview env var, or the MongoDB Atlas cluster/database users | [`terraform/README.md`](../../terraform/README.md), `terraform/terraform.tfvars.example`, [Deployment & Operations §2](../09-deployment-and-operations.md#2-production-environment-variables-checklist), [Infrastructure & Terraform](../guides/infrastructure-and-terraform.md) | — |
| Fixing a known issue (K1…) | Remove its row in [Trust, Safety & Privacy §10](../features/trust-safety-and-privacy.md#10-known-issues-code-that-does-not-yet-meet-these-rules) and mentions in Chapters 12/15/18 | — |

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
- **Open with what the document answers** and which ADRs back it; end with where to go next when useful.
- **Tables for reference, numbered steps for procedures**, each procedure ending on a done-check.
- **Cite paths** (`src/server/ai/quarantine-policy.ts`) instead of copying code that will drift; copy code only for short, stable examples.
- **Glossary terms verbatim**, capitalised as in `GLOSSARY.md`.
- **Record mismatches.** If the code and the intended behaviour differ, document the actual behaviour and add a known-issue row with the fix, instead of describing the intent as fact.
- **Plain language:** short sentences, no marketing adjectives, no em dashes.

## 5. Before you finish

- [ ] Every link you added resolves (relative path exists; anchors match headings).
- [ ] New documents are listed in [docs/README.md](../README.md) and the folder README; new ADRs in both indexes.
- [ ] `pnpm docs:registry:check` passes.
- [ ] Screenshots re-captured for visible changes and reviewed.

# Agent Guides

Start here when you are an AI agent working in GhostMsg. Each guide covers one kind of work; open the one whose trigger matches your task. The always-loaded summary is [`AGENTS.md`](../../AGENTS.md).

| Guide | Read it when you… |
| :--- | :--- |
| [product-rules.md](product-rules.md) | Change any user-facing behaviour, copy, setting, moderation, notification or anything touching sender data. |
| [component-architecture.md](component-architecture.md) | Touch `src/components/**` or `src/app/**/page.tsx|layout.tsx`, or install a shadcn / Animate UI component. |
| [source-structure.md](source-structure.md) | Add or move files under `src/` outside `src/components/`, extract a `*.utils.ts`, or write a controller test. |
| [api-patterns.md](api-patterns.md) | Add, change or call an API endpoint. |
| [../20-state-management.md](../20-state-management.md) | Add a query, mutation, controller `useState`, URL or device state, or touch the inbox data flow. |
| [feature-recipes.md](feature-recipes.md) | Build a common change end-to-end (new setting, endpoint, screen section, variant, shadcn install, policy change, shortcut, AI feature). |
| [../22-authentication-and-verification.md](../22-authentication-and-verification.md) | Touch sign-up, `/verify`, sign-in, NextAuth or the `verify-code` routes. |
| [../23-inbox-triage.md](../23-inbox-triage.md) | Touch the inbox block, message card, filter bar or any `use-inbox*.controller.ts`. |
| [../24-ai-features.md](../24-ai-features.md) | Change a prompt, model, AI route or the hooks that call them. |
| [../25-accessibility-and-feedback.md](../25-accessibility-and-feedback.md) | Add a shortcut, toast, dialog, animation or form field. |
| [../26-responsive-design.md](../26-responsive-design.md) | Add a phone-only or desktop-only behaviour. |
| [../27-developer-troubleshooting.md](../27-developer-troubleshooting.md) | Hit a confusing error (styling, types, stories, lint, merges, Storybook). |
| [../28-supply-chain-security.md](../28-supply-chain-security.md) | Add or review a config file, copy files from another project, see something obfuscated, or `pnpm security:check` fails. |
| [../../terraform/README.md](../../terraform/README.md) | Change the Vercel project, sync an environment variable to Production/Preview, or touch the MongoDB Atlas cluster/database users. |
| [documentation-maintenance.md](documentation-maintenance.md) | Finish any change: which docs, screenshots and indexes to update. |
| [domain.md](domain.md) | Explore the codebase (read `GLOSSARY.md` and relevant ADRs first). |
| [issue-tracker.md](issue-tracker.md) · [triage-labels.md](triage-labels.md) | Work with GitHub issues. |

## Reference chapters

| Question | Chapter |
| :--- | :--- |
| What does the product do, for whom, on which route? | [12 Product Guide](../12-product-guide-and-features.md) |
| How does it look; which tokens and variants exist? | [13 Design System](../13-design-system-and-theming.md) |
| How is each screen composed; which controller owns it? | [14 UI Screens](../14-ui-screens-and-user-flows.md) |
| What is stored, with which defaults and indexes? | [15 Data Model](../15-data-model-and-database.md) |
| What does each endpoint accept and return? | [16 API Reference](../16-api-reference.md) (live contract at `/docs`) |
| What must never leak, and how is abuse handled? | [17 Trust, Safety & Privacy](../17-trust-safety-and-privacy.md) |
| When do alerts fire? | [18 Notifications & Real-Time](../18-notifications-and-realtime.md) |
| What changed in the redesign? | [19 Change Summary](../19-redesign-change-summary.md) |
| Where does state live, and which state rules apply (server paging, optimistic factory, URL/device state)? | [20 State Management](../20-state-management.md) |
| How is Vercel and MongoDB Atlas infrastructure managed, and how do env vars flow to Production/Preview? | [21 Infrastructure & Terraform](../21-infrastructure-and-terraform.md) and [`terraform/README.md`](../../terraform/README.md) |
| How do sign-up, the Verification Code and sign-in work? | [22 Authentication & Verification](../22-authentication-and-verification.md) |
| How does the inbox filter, read, archive, select and delete? | [23 Inbox Triage](../23-inbox-triage.md) |
| What does each AI call send and return, and how does it fail? | [24 AI Features](../24-ai-features.md) |
| Which keys, focus rules, live regions and toast rules apply? | [25 Accessibility & Feedback](../25-accessibility-and-feedback.md) |
| How do phone and desktop differ, and which technique do I use? | [26 Responsive Design](../26-responsive-design.md) |
| I'm stuck on an error | [27 Developer Troubleshooting](../27-developer-troubleshooting.md) |
| Is this file safe; what do I do if a payload is found? | [28 Supply-Chain Security](../28-supply-chain-security.md) |
| Which modules, stories, mocks and scenarios exist? | [11 Component Registry](../11-component-registry.md) (generated) |

## Gates before you hand off

`.agents/rules/pre-push-quality-checks.md`: `pnpm check` → `pnpm exec tsc --noEmit` → `pnpm build` → `pnpm test:all` → `pnpm docs:registry:check` → `pnpm security:check`. Add `pnpm theme:contrast` for token changes and `pnpm docs:screenshots` for visible changes.

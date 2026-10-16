# Ultracite Code Standards

This project uses **Ultracite**, a zero-config preset that enforces strict code quality standards through automated formatting and linting.

## Quick Reference

- **Format code**: `npm exec -- ultracite fix`
- **Check for issues**: `npm exec -- ultracite check`
- **Diagnose setup**: `npm exec -- ultracite doctor`

Biome (the underlying engine) provides robust linting and formatting. Most issues are automatically fixable.

---

## Core Principles

Write code that is **accessible, performant, type-safe, and maintainable**. Focus on clarity and explicit intent over brevity.

### Type Safety & Explicitness

- Use explicit types for function parameters and return values when they enhance clarity
- Prefer `unknown` over `any` when the type is genuinely unknown
- Use const assertions (`as const`) for immutable values and literal types
- Leverage TypeScript's type narrowing instead of type assertions
- Use meaningful variable names instead of magic numbers - extract constants with descriptive names

### Modern JavaScript/TypeScript

- Use arrow functions for callbacks and short functions
- Prefer `for...of` loops over `.forEach()` and indexed `for` loops
- Use optional chaining (`?.`) and nullish coalescing (`??`) for safer property access
- Prefer template literals over string concatenation
- Use destructuring for object and array assignments
- Use `const` by default, `let` only when reassignment is needed, never `var`

### Async & Promises

- Always `await` promises in async functions - don't forget to use the return value
- Use `async/await` syntax instead of promise chains for better readability
- Handle errors appropriately in async code with try-catch blocks
- Don't use async functions as Promise executors

### React & JSX

- Use function components over class components
- Call hooks at the top level only, never conditionally
- Specify all dependencies in hook dependency arrays correctly
- Use the `key` prop for elements in iterables (prefer unique IDs over array indices)
- Nest children between opening and closing tags instead of passing as props
- Don't define components inside other components
- Use semantic HTML and ARIA attributes for accessibility:
  - Provide meaningful alt text for images
  - Use proper heading hierarchy
  - Add labels for form inputs
  - Include keyboard event handlers alongside mouse events
  - Use semantic elements (`<button>`, `<nav>`, etc.) instead of divs with roles

### Error Handling & Debugging

- Remove `console.log`, `debugger`, and `alert` statements from production code
- Throw `Error` objects with descriptive messages, not strings or other values
- Use `try-catch` blocks meaningfully - don't catch errors just to rethrow them
- Prefer early returns over nested conditionals for error cases

### Code Organization

- Keep functions focused and under reasonable cognitive complexity limits
- Extract complex conditions into well-named boolean variables
- Use early returns to reduce nesting
- Prefer simple conditionals over nested ternary operators
- Group related code together and separate concerns

### Security

- Add `rel="noopener"` when using `target="_blank"` on links
- Avoid `dangerouslySetInnerHTML` unless absolutely necessary
- Don't use `eval()` or assign directly to `document.cookie`
- Validate and sanitize user input

### Performance

- Avoid spread syntax in accumulators within loops
- Use top-level regex literals instead of creating them in loops
- Prefer specific imports over namespace imports
- Avoid barrel files (index files that re-export everything)
- Use proper image components (e.g., Next.js `<Image>`) over `<img>` tags

### Framework-Specific Guidance

**Next.js:**
- Use Next.js `<Image>` component for images
- Use `next/head` or App Router metadata API for head elements
- Use Server Components for async data fetching instead of async Client Components

**React 19+:**
- Use ref as a prop instead of `React.forwardRef`

**Solid/Svelte/Vue/Qwik:**
- Use `class` and `for` attributes (not `className` or `htmlFor`)

---

## Testing

- Write assertions inside `it()` or `test()` blocks
- Avoid done callbacks in async tests - use async/await instead
- Don't use `.only` or `.skip` in committed code
- Keep test suites reasonably flat - avoid excessive `describe` nesting

## When Biome Can't Help

Biome's linter will catch most issues automatically. Focus your attention on:

1. **Business logic correctness** - Biome can't validate your algorithms
2. **Meaningful naming** - Use descriptive names for functions, variables, and types
3. **Architecture decisions** - Component structure, data flow, and API design
4. **Edge cases** - Handle boundary conditions and error states
5. **User experience** - Accessibility, performance, and usability considerations
6. **Documentation** - Add comments for complex logic, but prefer self-documenting code

---

Most formatting and common issues are automatically fixed by Biome. Run `npm exec -- ultracite fix` before committing to ensure compliance.

---

## GhostMsg Project Rules

- Read `AGENTS.md` at the repo root for project-wide agent guidance.
- **Components / UI / route pages:** before touching `src/components/**` or `src/app/**/page.tsx|layout.tsx`, read `docs/agents/component-architecture.md`. It defines the four tiers (`elements → patterns → blocks → pages`), keeps all business logic in `pages/` controllers, and explains how Biome enforces this.
- **Source structure / utils / controllers / tests:** before adding or moving files under `src/` outside `src/components/`, extracting a `*.utils.ts`, or writing a `*.controller.test.ts`, read `docs/agents/source-structure.md` (ADR 0018, ADR 0019).
- **Product behaviour / settings / moderation / notifications / sender data:** read `docs/agents/product-rules.md` first; never break invariants S1–S10.
- **Tokens, variants, palettes, new shadcn elements:** read `docs/13-design-system-and-theming.md` (shadcn first, design via CVA variants, `className` for layout only).
- **Queries, mutations, controller/URL/device state:** read `docs/20-state-management.md` (server data only in React Query, server-side filtering + paging, optimistic switches, stable callbacks, derived UI state).
- **Common end-to-end changes** (new setting, endpoint, screen section): follow `docs/agents/feature-recipes.md`.
- **Finishing any change:** update the docs it affects per `docs/agents/documentation-maintenance.md` (chapters 12–19, `GLOSSARY.md`, ADRs, `pnpm docs:screenshots` for visible UI).
- **Before push:** follow `.agents/rules/pre-push-quality-checks.md`.
- **Mobile redesign / typography sweep / Toaster / Command Palette / Sidebar / Settings accordion:** read `docs/agents/redesign-progress.md` first — it tracks what's done, what's blocked, and what's confirmed-but-not-started for the current design-alignment effort, so you don't redo work or re-ask questions already answered.

## GhostMsg UI rules (redesign v2: see `ghostmsg-handoff/ghostmsg-handoff/HANDOFF.md`, gitignored scratch material, not committed)

Base UI, cva variants, colour/type/spacing tokens and the four-tier `elements → patterns → blocks → pages` split already have canonical docs — read `docs/agents/component-architecture.md` and `docs/13-design-system-and-theming.md` before touching components, not this section. This section only covers what the v2 handoff adds on top:

- Base UI = shadcn/Radix (or Animate UI) parts in `src/components/elements` only (ADR 0015). Never create new base primitives; build GhostMsg pieces as compositions in `patterns/`, `blocks/` or `pages/`. There is no `components/ui` or `features/` directory in this repo — ignore any handoff reference to those paths.
- Type: semantic utilities only (`text-display/h1/h2/h3/title/body-lg/body/sm/xs/overline`). Messages and inputs use `text-body` (16px). Headings use `font-display`.
- Spacing: `px-gutter`, `py-section`, `p-card`, `gap-stack` for layout rhythm; Tailwind 4px scale for the rest.
- Mobile first: touch targets ≥44px below `md`; Dialogs become Drawers below `md` (use `ResponsiveDialog`).
- Motion: import tokens and presets from `src/lib/motion.ts`; the app root wraps children in `<MotionConfig reducedMotion="user">` (`src/app/layout.tsx`); dashboard animations ≤300ms; idle loops only on the landing hero and the first-run empty state.
- Reversible actions use a Sonner undo toast; AlertDialog only for irreversible or bulk actions.
- Use the domain terms exactly: Anonymous Message, Recipient, Message Acceptance, Suggested Message, AMA Prompt, Sentiment Tag, Quarantined Message, Public Q&A, Story Card, Verification Code, Sender Hash.
- Visual target for any screen: `design/ghostmsg-handoff/screenshots/`. Exact values: `design/ghostmsg-handoff/reference/boards/` (design HTML, not app code).

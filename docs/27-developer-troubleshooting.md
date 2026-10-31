# Chapter 27: Developer Troubleshooting

Symptoms we have hit while building GhostMsg, what causes them, and the fix. Search this page for the error text first. Each entry is **Symptom → Cause → Fix**.

Related: [Chapter 6](06-dev-workflow.md) (commands), [Chapter 7](07-testing-strategy.md) (tests), [Chapter 8](08-code-quality.md) (lint), [Chapter 10](10-storybook-and-ui-catalog.md) (stories).

---

## 1. Styling

### 1.1 Tailwind classes on a toast do nothing
**Cause.** Sonner's stylesheet is unlayered, so it beats Tailwind utilities (which live in `@layer utilities`).
**Fix.** Every toast is `unstyled`; the look comes from the `Toaster`'s `toastOptions.classNames` in `src/components/elements/sonner/sonner.tsx`. Change the surface there, not per call. Don't use `toast.custom()`: in Sonner 2.0.8 custom JSX renders inside `[data-title]` and breaks the one-line layout; pass an `action` element instead (see `UndoToastAction`).

### 1.2 `cn("text-h2", "text-destructive")` loses the size
**Cause.** Plain tailwind-merge reads `text-h2` as a colour, so a later colour removed it.
**Fix.** Already fixed in `src/lib/utils.ts` with a `text-scale` group. If you add a type step to `globals.css`, add it to that list too:

```ts
classGroups: {
  "text-scale": [{ text: ["display", "h1", "h2", "h3", "title", "body-lg", "body", "overline"] }],
},
conflictingClassGroups: {
  "font-size": ["text-scale"],
  "text-scale": ["font-size", "font-weight", "leading", "tracking"],
},
```

### 1.3 Biome crashes on a class string
**Symptom.** `nursery.noTailwindRawColors` throws a parser error on a file.
**Cause.** It can't parse compound bracket selectors such as `[[data-slot=x]_&]:` or `has-[[data-x]>*]:`.
**Fix.** Prefer state, props or a single data attribute (`has-data-[state=checked]:`, `in-data-[expanded=true]:`). Five vendor elements are excluded by override in `biome.jsonc`; don't add more without a reason.

### 1.4 An element looks different after a shadcn update
**Cause.** Someone changed a stock default instead of adding a variant.
**Fix.** Defaults stay stock; the approved deviations are listed in [Chapter 13 §6](13-design-system-and-theming.md#6-elements-shadcn-first-design-through-variants) and marked `GhostMsg:` in the source.

## 2. API and types

### 2.1 "Property 'x' does not exist" after changing a schema
**Cause.** `src/generated/api-schema.d.ts` is generated from the Zod/OpenAPI registry.
**Fix.**

```bash
pnpm typegen          # regenerate after editing src/schemas/** or src/server/openapi/openapi.ts
npx tsc --noEmit -p . # then fix every caller the compiler points at
```

MSW handlers are typed from the same file (`ok("/api/…", "post", body)`), so a contract change also breaks the mocks that need updating. That is intended.

### 2.2 The client can't see `retryAfterSeconds` (or another field) on a 4xx
**Cause.** `clientFetch` throws an `ApiError` for non-2xx responses; the JSON body is in `error.details`, not `error.message`.
**Fix.**

```ts
function readRetryAfter(error: unknown): number | null {
  if (!(error instanceof ApiError)) return null;
  const body = error.details as { retryAfterSeconds?: unknown } | undefined;
  return typeof body?.retryAfterSeconds === "number" ? body.retryAfterSeconds : null;
}
```

### 2.3 A new inbox status shows archived messages in All
**Cause.** The three copies of the filter rules drifted.
**Fix.** Change `src/lib/messages/inbox-filter.ts`, `src/server/messages/inbox-query.ts` (`NOT_ARCHIVED`) and the MSW handler together; `inbox-query.test.ts` checks they agree ([Chapter 23 §2](23-inbox-triage.md#2-filters)).

## 3. Tests and stories

### 3.1 A play function fails in the dev Storybook but passes in `pnpm test:stories`
**Symptom.** `expect(element).toBeVisible()` fails on a toast or dialog at `http://localhost:6006`.
**Cause.** Interactive Storybook keeps animations; the element is caught at opacity 0. Story tests set `MotionGlobalConfig.skipAnimations` and a zero-duration CSS rule.
**Fix.** Nothing, if `pnpm test:stories` passes. If you need it in the dev UI, wrap the assertion in `waitFor`.

### 3.2 `Found multiple elements with the role "alert"`
**Cause.** More than one `role="alert"` in the canvas.
**Fix.** Query the text (`getByText("That code isn't right.")`) or scope with `within(container)`. The Toaster's assertive region deliberately has no `role` ([Chapter 25 §4](25-accessibility-and-feedback.md#4-live-regions)).

### 3.3 `[Function noop] is not a spy`
**Cause.** A story's `args` replaced a whole object (for example `filters`) with one from a `*.mock.ts`, whose callbacks are `noop`, so the meta's `fn()` spies are gone. Storybook merges args shallowly.
**Fix.** Keep the spies in one place and spread overrides onto them:

```ts
const storyFilters = { ...defaultInboxArgs.filters, onSearchChange: fn(), onStatusChange: fn() };

export const NoMatches: Story = {
  args: { ...noMatchesInboxArgs, filters: { ...storyFilters, ...unreadFilterOverride } },
};
```

### 3.4 Toast assertions stopped matching
**Cause.** App code calls `notify`, not `toast`.
**Fix.** Mock both, so assertions stay on Sonner's spies:

```ts
vi.mock("sonner", () => ({ toast: { error: vi.fn(), success: vi.fn() } }));
vi.mock("@/components/elements/sonner", async () => {
  const sonner = await import("sonner");
  return { notify: sonner.toast };
});
```

### 3.5 A countdown or debounce never moves in a test
**Fix.** Fake timers, and advance inside `act`:

```ts
beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

act(() => vi.advanceTimersByTime(18_000));
expect(result.current.secondsLeft).toBe(42);
```

### 3.6 The full story suite times out on a laptop
**Fix.** Run the folders you touched: `npx vitest run --project storybook src/components/patterns/modals src/components/pages/auth`. CI runs everything.

### 3.7 `noAwaitInLoops` in a play function
**Fix.** Collect, then assert once:

```ts
const ideas = smartReplyDrafts.map((d) => screen.getByRole("button", { name: d.text }));
await expect(ideas).toHaveLength(smartReplyDrafts.length);
```

## 4. Lint (Biome / Ultracite)

| Rule | Typical trigger | Fix |
| :--- | :--- | :--- |
| `noExcessiveCognitiveComplexity` (max 20) | A component with many branches | Extract sub-components or a helper (`ResendHint`, `VerifyAction`) |
| `noJsxPropsBind` | `onClick={() => onPick(text)}` in a list | A small child component with a `useCallback` (`DraftIdeaButton`) |
| `useTopLevelRegex` | `/^delete$/i` inside a test or loop | A top-level `const DELETE_REGEX = /^delete$/i;` |
| `noLeakedRender` | `{cond ? "a" : someString}` in JSX | Compute the string first, render `{subtitle}` |
| `noShadow` | A mock factory variable named like an import | Rename (`const sonner = await import("sonner")`) |
| `useAwait` | `async` test with no `await` | Drop `async` |

The repo's formatter hook runs after every edit and **removes unused imports**, so add the usage before (or with) the import. Biome also sorts object and interface members; scripted text replacements that rely on member order go stale.

## 5. Git and merges

### 5.1 A merge from `develop` silently reverted design work
**Cause.** A lint-fix commit on `develop` rewrote files from their pre-redesign versions; the merge kept those.
**Fix.** After any merge, look for lost semantic type classes:

```bash
git diff <last-redesign-commit> HEAD -- src | grep -E '^-.*text-(h1|h2|h3|title|body)'
```

## 6. Local tooling

### 6.1 Storybook won't start: port 6006 in use
**Fix.** Stop only the process on that port (not every `node`):

```powershell
Get-NetTCPConnection -LocalPort 6006 -State Listen |
  Select-Object -ExpandProperty OwningProcess -Unique |
  ForEach-Object { Stop-Process -Id $_ }
```

```bash
lsof -ti :6006 | xargs kill   # macOS / Linux
```

The first start after a dependency change takes minutes (Vite pre-bundling); later starts are fast.

### 6.2 AI features show the same stock text every time
**Cause.** `GOOGLE_AI_STUDIO_SECRET` is unset; every AI module falls back by design ([Chapter 24 §2](24-ai-features.md#2-shared-rules)).
**Fix.** Set the key in `.env.local` and restart `pnpm dev`.

### 6.3 Settings says push notifications aren't configured
**Cause.** No VAPID keys. **Fix.** `npx web-push generate-vapid-keys`, set `NEXT_PUBLIC_VAPID_PUBLIC_KEY` and `VAPID_PRIVATE_KEY`, rebuild (the public key is built into the bundle).

### 6.4 The landing has no "See a live profile" link
**Cause.** `NEXT_PUBLIC_LIVE_PROFILE_USERNAME` is unset (the link is hidden on purpose). **Fix.** Set it to a real public username and rebuild.

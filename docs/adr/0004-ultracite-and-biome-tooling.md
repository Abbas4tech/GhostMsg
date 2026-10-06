# ADR 0004: Ultracite and Biome for Code Quality Standards

## Status
**Accepted**

---

## Context & Problem Statement
JavaScript and TypeScript codebases commonly rely on a fragmented quality stack: ESLint with numerous plugins (`eslint-plugin-react`, `eslint-plugin-react-hooks`, `@typescript-eslint`, etc.) alongside Prettier.

In practice, this setup creates several friction points:
1. **Slow Execution**: Running linting and formatting across 100+ files often takes 8–20 seconds, discouraging frequent pre-commit checks.
2. **Rule Clashes**: Conflicts between ESLint formatting rules and Prettier formatting engines cause CI pipeline failures and developer frustration.
3. **Configuration Drift**: Maintaining multiple complex configuration files (`.eslintrc.json`, `.prettierrc`, `.eslintignore`, `.prettierignore`) creates maintenance overhead.

---

## Decision Drivers
1. **Sub-Second Execution**: Pre-commit hooks must run in <200ms to preserve immediate developer feedback loops.
2. **Unified Tooling**: Single engine for both formatting and linting.
3. **Strict Quality Defaults**: Zero-tolerance enforcement for TypeScript type safety, accessibility (a11y), React 19 hook safety, and anti-pattern bans.
4. **AI & Multi-Developer Consistency**: Automated formatting that prevents noisy Git diffs.

---

## Considered Options

### Option A: Traditional ESLint + Prettier + lint-staged
- **Pros**: Extensive ecosystem of community plugins.
- **Cons**: Slow execution time; frequent AST parsing duplication; constant maintenance of plugin version compatibility.

### Option B: ESLint Flat Config + Prettier
- **Pros**: Native ESLint modern config format.
- **Cons**: Does not solve underlying Node.js AST performance bottlenecks; still requires coordinating two separate tools.

### Option C: Ultracite powered by Biome (Chosen)
- **Pros**:
  - **Rust-Powered Speed**: Checks and formats 100+ files in under 150ms.
  - **Single Unified Configuration**: Configured in [`biome.jsonc`](file:///d:/Projects/GhostMsg/biome.jsonc).
  - **Comprehensive Rule Set**: Enforces type safety, React 19 best practices, Next.js optimization rules, and strict styling.
  - **Lightweight Git Hooks**: Enables pre-commit checks with zero noticeable delay.
- **Cons**: Smaller third-party plugin ecosystem than ESLint, but all necessary web/React/TypeScript rules are built-in natively.

---

## The Decision
We chose **Option C**: Adopt Ultracite with the Biome engine as the sole formatter and linter for GhostMsg, replacing ESLint and Prettier.

```jsonc
// biome.jsonc
{
  "$schema": "https://biomejs.dev/schemas/1.9.4/schema.json",
  "extends": ["ultracite"],
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true
    }
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 80
  }
}
```

---

## Consequences

### Positive
- **Instant Pre-Commit Feedback**: Pre-commit hooks execute `pnpm check` in ~150ms.
- **Zero Configuration Drift**: A single configuration file handles all linting and formatting rules.
- **Clean Diff History**: Deterministic formatting prevents whitespace and styling noise in pull requests.

### Negative & Mitigations
- **Rule Adaptation**: Deprecated ESLint-specific inline comments (`// eslint-disable-next-line`) must be replaced with Biome suppression comments (`// biome-ignore lint/...`).

---

## References & Code Pointers
- Configuration: [`biome.jsonc`](file:///d:/Projects/GhostMsg/biome.jsonc)
- Pre-Commit Hook: [`.husky/pre-commit`](file:///d:/Projects/GhostMsg/.husky/pre-commit)
- Quality Guide: [`docs/08-code-quality.md`](file:///d:/Projects/GhostMsg/docs/08-code-quality.md)

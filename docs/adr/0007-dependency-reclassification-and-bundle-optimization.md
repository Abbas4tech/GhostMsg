# ADR 0007: Dependency Reclassification & Next.js Bundle Optimization

## Status
**Accepted**

---

## Context & Problem Statement

GhostMsg's [`package.json`](file:///d:/Projects/GhostMsg/package.json) previously had build-time CLI tools (`@biomejs/biome`, `shadcn`) grouped under production `dependencies`. 

Additionally, large UI libraries with extensive barrel exports (such as `lucide-react`, `motion`, `radix-ui`, `@tanstack/react-query`, and `usehooks-ts`) were imported without Next.js import optimization, resulting in larger initial client chunk sizes and slower cold-start compilation.

---

## Technical Context: Bundling vs `package.json`

In Next.js (Webpack / Turbopack), moving a package from `dependencies` to `devDependencies` in `package.json`:
1. **Reduces production Docker / serverless container artifact sizes** by preventing CLI tools from being installed in production-only node environments.
2. **Does NOT automatically shrink client browser JavaScript**, because Next.js constructs client bundles strictly from the static `import` dependency graph of client components (`"use client"`).

To achieve real browser bundle reductions, compiler-level tree-shaking optimizations and import path rewrites must be configured in [`next.config.ts`](file:///d:/Projects/GhostMsg/next.config.ts).

---

## Decision Drivers

1. **Production Container Hygiene**: Exclude non-runtime development CLI utilities from production container installations.
2. **Measurable Client Bundle Reduction**: Prevent barrel export bloat from heavy icon and utility packages.
3. **Zero Runtime Regressions**: Ensure all packages required by server routes or client components remain accessible and correctly typed.

---

## The Decision

1. **Reclassify CLI Utilities**:
   Move `@biomejs/biome` and `shadcn` to `devDependencies` in [`package.json`](file:///d:/Projects/GhostMsg/package.json).
2. **Enable Next.js Package Import Optimization**:
   Configure `experimental.optimizePackageImports` in [`next.config.ts`](file:///d:/Projects/GhostMsg/next.config.ts) for:
   - `lucide-react`
   - `@tanstack/react-query`
   - `motion`
   - `radix-ui`
   - `usehooks-ts`
   - `@hookform/resolvers`

```typescript
// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "@tanstack/react-query",
      "motion",
      "radix-ui",
      "usehooks-ts",
      "@hookform/resolvers",
    ],
  },
};

export default nextConfig;
```

---

## Consequences

### Positive
- **Reduced Deployment Footprint**: Production serverless/container installs skip dev CLI binaries.
- **Tree-Shaken Client Bundles**: Next.js automatically transforms barrel imports (e.g. `import { X, Loader2 } from 'lucide-react'`) into direct file imports, eliminating hundreds of unused module evaluations.
- **Faster Turbopack / Webpack Compilation**: Compiler processes fewer unused export trees during hot reloads.

### Negative & Mitigations
- None. All packages remain fully functional and correctly resolved.

---

## References & Code Pointers
- Next.js Config: [`next.config.ts`](file:///d:/Projects/GhostMsg/next.config.ts)
- Package Manifest: [`package.json`](file:///d:/Projects/GhostMsg/package.json)
- Documentation Index: [`docs/README.md`](file:///d:/Projects/GhostMsg/docs/README.md)

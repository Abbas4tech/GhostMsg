import path from "node:path";
import { fileURLToPath } from "node:url";
import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import react from "@vitejs/plugin-react";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

const dirname =
  typeof import.meta.dirname === "undefined"
    ? path.dirname(fileURLToPath(import.meta.url))
    : import.meta.dirname;

/**
 * Two projects (ADR 0016):
 * - `unit`: happy-dom + msw/node — logic, controllers, page integration (`*.test.ts(x)`).
 * - `storybook`: every story in headless Chromium — smoke render, play(), axe.
 *
 * `pnpm test` → unit · `pnpm test:stories` → storybook · `pnpm test:all` → both.
 */
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(dirname, "./src"),
      // The real package throws outside the react-server condition (ADR 0018).
      "server-only": path.resolve(dirname, "./src/test/server-only-stub.ts"),
    },
  },
  test: {
    coverage: {
      exclude: [
        "node_modules/",
        "src/generated/",
        "src/test/",
        "src/mock/",
        "**/*.d.ts",
        "**/*.stories.tsx",
        "**/*.mock.ts",
      ],
      provider: "v8",
      reporter: ["text", "json", "html"],
    },
    projects: [
      {
        extends: true,
        test: {
          environment: "happy-dom",
          // A real origin so relative `/api/*` requests resolve and MSW can match them.
          environmentOptions: { happyDOM: { url: "http://localhost:3000" } },
          globals: true,
          include: ["src/**/*.{test,spec}.{ts,tsx}"],
          name: "unit",
          setupFiles: ["./src/test/setup.ts"],
        },
      },
      {
        extends: true,
        plugins: [
          storybookTest({ configDir: path.join(dirname, ".storybook") }),
        ],
        test: {
          browser: {
            enabled: true,
            headless: true,
            instances: [{ browser: "chromium" }],
            provider: playwright({}),
            // Desktop width so lg: layouts (dashboard sidebar) render in tests.
            viewport: { height: 900, width: 1280 },
          },
          name: "storybook",
          // Page stories run real controllers against MSW in a real browser.
          testTimeout: 30_000,
        },
      },
    ],
  },
});

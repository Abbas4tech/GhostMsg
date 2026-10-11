import type { StorybookConfig } from "@storybook/nextjs-vite";

/**
 * Storybook 10 for GhostMsg (ADR 0016).
 * - nextjs-vite: Next-aware (next/link, next/navigation, next/image) on the same
 *   Vite toolchain as Vitest; Tailwind v4 comes in through postcss.config.mjs.
 * - `public/` is served so MSW's `mockServiceWorker.js` is available.
 */
const config: StorybookConfig = {
  stories: ["../src/components/**/*.stories.@(ts|tsx)"],
  addons: [
    "@storybook/addon-docs",
    "@storybook/addon-a11y",
    "@storybook/addon-vitest",
  ],
  framework: {
    name: "@storybook/nextjs-vite",
    options: {},
  },
  staticDirs: ["../public"],
  core: {
    disableTelemetry: true,
  },
};

export default config;

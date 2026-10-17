import type { Decorator, Preview } from "@storybook/nextjs-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MotionGlobalConfig } from "motion/react";
import { setupWorker } from "msw/browser";
import { mswLoader } from "msw-storybook-addon/csf3";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { useState } from "react";
import { Toaster } from "../src/components/elements/sonner";
import { isPalette } from "../src/lib/theme/palette";
import { defaultHandlers } from "../src/mock/handlers";
import PaletteProvider from "../src/providers/palette-provider";
import "../src/app/globals.css";

// Story tests (Vitest runs Vite in "test" mode) skip Motion + CSS animations so
// assertions and axe never sample a half-faded frame. Interactive Storybook
// keeps full animation.
if (import.meta.env.MODE === "test") {
  MotionGlobalConfig.skipAnimations = true;
  // Same for CSS animations/transitions (tw-animate-css dialogs, sonner toasts).
  const noMotion = document.createElement("style");
  noMotion.textContent =
    "*,*::before,*::after{animation-duration:0s!important;animation-delay:0s!important;transition-duration:0s!important;transition-delay:0s!important;}";
  document.head.appendChild(noMotion);
}

/**
 * MSW worker (msw-storybook-addon 3, CSF3 integration). Only `/api/*` must be
 * mocked: an unmocked API call fails loudly, while assets and HMR pass through.
 */
const startMswWorker = async () => {
  const worker = setupWorker();
  await worker.start({
    onUnhandledRequest: (request, print) => {
      if (new URL(request.url).pathname.startsWith("/api/")) {
        print.error();
      }
    },
    quiet: true,
    serviceWorker: { url: "/mockServiceWorker.js" },
  });
  return worker;
};

/**
 * Light/dark and palette from the toolbar, applied through next-themes and
 * PaletteProvider like the app does.
 */
const withTheme: Decorator = (Story, context) => {
  const palette = isPalette(context.globals.palette)
    ? context.globals.palette
    : "spectral";
  return (
    <ThemeProvider
      attribute="class"
      disableTransitionOnChange
      forcedTheme={context.globals.theme ?? "light"}
    >
      <PaletteProvider forcedPalette={palette}>
        <div className="bg-background font-sans text-foreground">
          <Story />
        </div>
        <Toaster />
      </PaletteProvider>
    </ThemeProvider>
  );
};

/** Fresh QueryClient per story so cached data never leaks between stories. */
function PageProviders({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          mutations: { retry: false },
          queries: { refetchOnWindowFocus: false, retry: false },
        },
      })
  );
  return (
    <SessionProvider refetchOnWindowFocus={false}>
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    </SessionProvider>
  );
}

/** Pages (and only pages) get session + React Query, opted in via `parameters.pageProviders`. */
const withPageProviders: Decorator = (Story, context) =>
  context.parameters.pageProviders ? (
    <PageProviders>
      <Story />
    </PageProviders>
  ) : (
    <Story />
  );

const preview: Preview = {
  decorators: [withPageProviders, withTheme],
  globalTypes: {
    palette: {
      description: "Color palette",
      toolbar: {
        dynamicTitle: true,
        icon: "paintbrush",
        items: [
          { title: "Soft spectral", value: "spectral" },
          { title: "Midnight confessional", value: "midnight" },
          { title: "Playful paper", value: "paper" },
        ],
        title: "Palette",
      },
    },
    theme: {
      description: "Color theme",
      toolbar: {
        dynamicTitle: true,
        icon: "mirror",
        items: [
          { icon: "sun", title: "Light", value: "light" },
          { icon: "moon", title: "Dark", value: "dark" },
        ],
        title: "Theme",
      },
    },
  },
  initialGlobals: {
    palette: "spectral",
    theme: "light",
  },
  loaders: [mswLoader(startMswWorker)],
  parameters: {
    a11y: { test: "error" },
    controls: {
      expanded: true,
      matchers: { color: /(background|color)$/i, date: /Date$/i },
    },
    layout: "padded",
    msw: { handlers: defaultHandlers },
    nextjs: { appDirectory: true },
  },
  tags: ["autodocs"],
};

export default preview;

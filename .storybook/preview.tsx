import type { Decorator, Preview } from "@storybook/nextjs-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MotionGlobalConfig } from "motion/react";
import { setupWorker } from "msw/browser";
import { mswLoader } from "msw-storybook-addon/csf3";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { useState } from "react";
import { Toaster } from "../src/components/elements/sonner";
import { defaultHandlers } from "../src/mock/handlers";
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
    quiet: true,
    serviceWorker: { url: "/mockServiceWorker.js" },
    onUnhandledRequest: (request, print) => {
      if (new URL(request.url).pathname.startsWith("/api/")) {
        print.error();
      }
    },
  });
  return worker;
};

/** Light/dark from the toolbar, applied through next-themes like the app does. */
const withTheme: Decorator = (Story, context) => (
  <ThemeProvider
    attribute="class"
    disableTransitionOnChange
    forcedTheme={context.globals.theme ?? "light"}
  >
    <div className="bg-background text-foreground">
      <Story />
    </div>
    <Toaster />
  </ThemeProvider>
);

/** Fresh QueryClient per story so cached data never leaks between stories. */
function PageProviders({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { retry: false, refetchOnWindowFocus: false },
          mutations: { retry: false },
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
  loaders: [mswLoader(startMswWorker)],
  globalTypes: {
    theme: {
      description: "Color theme",
      toolbar: {
        title: "Theme",
        icon: "mirror",
        items: [
          { value: "light", title: "Light", icon: "sun" },
          { value: "dark", title: "Dark", icon: "moon" },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    theme: "light",
  },
  parameters: {
    layout: "padded",
    nextjs: { appDirectory: true },
    msw: { handlers: defaultHandlers },
    a11y: { test: "error" },
    controls: {
      expanded: true,
      matchers: { color: /(background|color)$/i, date: /Date$/i },
    },
  },
  tags: ["autodocs"],
};

export default preview;

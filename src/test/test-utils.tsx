import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  type RenderHookOptions,
  type RenderOptions,
  render,
  renderHook,
} from "@testing-library/react";
import type { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import type React from "react";
import { onTestFinished } from "vitest";
import { server } from "./msw-server";

export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      mutations: {
        retry: false,
      },
      queries: {
        retry: false,
        staleTime: Number.POSITIVE_INFINITY,
      },
    },
  });
}

interface CustomRenderOptions extends Omit<RenderOptions, "wrapper"> {
  queryClient?: QueryClient;
}

export function renderWithProviders(
  ui: React.ReactElement,
  options: CustomRenderOptions = {}
) {
  const { queryClient = createTestQueryClient(), ...renderOptions } = options;

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  }

  return {
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
    queryClient,
  };
}

interface RenderHookWithProvidersOptions<Props>
  extends Omit<RenderHookOptions<Props>, "wrapper"> {
  queryClient?: QueryClient;
  /**
   * Session handed straight to `SessionProvider` (no `/api/auth/session` fetch).
   * Defaults to `null` (signed out), which also keeps the inbox SSE listener off.
   */
  session?: Session | null;
}

/**
 * `renderHook` for page controllers (ADR 0018, Q7): QueryClient + NextAuth
 * session. Network calls go to the shared MSW handlers.
 */
export function renderHookWithProviders<Result, Props>(
  hook: (props: Props) => Result,
  options: RenderHookWithProvidersOptions<Props> = {}
) {
  const {
    queryClient = createTestQueryClient(),
    session = null,
    ...hookOptions
  } = options;

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <SessionProvider refetchOnWindowFocus={false} session={session}>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </SessionProvider>
    );
  }

  return {
    ...renderHook(hook, { wrapper: Wrapper, ...hookOptions }),
    queryClient,
  };
}

/**
 * Records `METHOD /path` for every request MSW sees during the current test,
 * so controller tests can assert which endpoints were (or were not) called.
 */
export function recordRequests(): string[] {
  const calls: string[] = [];
  const listener = ({ request }: { request: Request }) => {
    calls.push(`${request.method} ${new URL(request.url).pathname}`);
  };
  server.events.on("request:start", listener);
  onTestFinished(() => {
    server.events.removeListener("request:start", listener);
  });
  return calls;
}

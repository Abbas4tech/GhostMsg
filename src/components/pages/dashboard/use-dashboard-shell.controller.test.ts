import { act, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { FIXTURE_USERNAME } from "@/mock/fixtures/public-profile.fixtures";
import { sessionScenarios } from "@/mock/fixtures/session.fixtures";
import { scenarios } from "@/mock/handlers";
import { server } from "@/test/msw-server";
import { recordRequests, renderHookWithProviders } from "@/test/test-utils";
import { useDashboardShellController } from "./use-dashboard-shell.controller";

const { push, signOut, pathname } = vi.hoisted(() => ({
  pathname: { current: "/dashboard" },
  push: vi.fn(),
  signOut: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => pathname.current,
  useRouter: () => ({ push }),
}));
vi.mock("next-auth/react", async (importOriginal) => ({
  ...(await importOriginal<typeof import("next-auth/react")>()),
  signOut,
}));
vi.mock("sonner", () => ({ toast: { error: vi.fn(), success: vi.fn() } }));

const renderShell = () =>
  renderHookWithProviders(() => useDashboardShellController(), {
    session: sessionScenarios.authenticated,
  });

const findItem = (
  result: ReturnType<typeof renderShell>["result"],
  id: string
) =>
  result.current.commandGroups
    .flatMap((group) => group.items)
    .find((item) => item.id === id);

describe("useDashboardShellController", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    pathname.current = "/dashboard";
  });

  it("exposes the session, active nav and unread count", async () => {
    const { result } = renderShell();

    expect(result.current.status).toBe("authenticated");
    expect(result.current.username).toBe(FIXTURE_USERNAME);
    expect(result.current.activeNav).toBe("inbox");
    await waitFor(() => expect(result.current.unreadCount).toBeGreaterThan(0));
  });

  it("marks Settings active on its route", () => {
    pathname.current = "/dashboard/settings";
    expect(renderShell().result.current.activeNav).toBe("settings");
  });

  it("toggles Message Acceptance through the API", async () => {
    const requests = recordRequests();
    const { result } = renderShell();
    await waitFor(() =>
      expect(result.current.acceptance.isAccepting).toBe(true)
    );

    act(() => result.current.acceptance.onToggle());

    await waitFor(() => expect(requests).toContain("POST /api/accept-message"));
  });

  it("shows the paused state from the server", async () => {
    server.use(...scenarios.settings.closedWithBlocks);
    const { result } = renderShell();

    await waitFor(() =>
      expect(result.current.acceptance.isAccepting).toBe(false)
    );
    expect(findItem(result, "acceptance")?.label).toBe(
      "Resume Message Acceptance"
    );
  });

  it("opens and closes the command palette with ⌘K / Ctrl+K", () => {
    const { result } = renderShell();

    act(() => {
      window.dispatchEvent(
        new KeyboardEvent("keydown", { key: "k", metaKey: true })
      );
    });
    expect(result.current.isCommandOpen).toBe(true);

    act(() => {
      window.dispatchEvent(
        new KeyboardEvent("keydown", { ctrlKey: true, key: "K" })
      );
    });
    expect(result.current.isCommandOpen).toBe(false);

    act(() => result.current.handleOpenCommand());
    expect(result.current.isCommandOpen).toBe(true);
  });

  it("routes command palette items", () => {
    const { result } = renderShell();

    act(() => findItem(result, "settings")?.onSelect());
    act(() => findItem(result, "inbox-starred")?.onSelect());
    act(() => findItem(result, "visit")?.onSelect());

    expect(push).toHaveBeenCalledWith("/dashboard/settings");
    expect(push).toHaveBeenCalledWith("/dashboard?filter=starred");
    expect(push).toHaveBeenCalledWith(`/u/${FIXTURE_USERNAME}`);
  });

  it("signs out to the landing page and sends guests to sign in", () => {
    const { result } = renderShell();

    act(() => result.current.handleSignOut());
    act(() => result.current.handleGoToLogin());

    expect(signOut).toHaveBeenCalledWith({ callbackUrl: "/" });
    expect(push).toHaveBeenCalledWith("/sign-in");
  });
});

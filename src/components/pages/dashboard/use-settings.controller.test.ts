import { act, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { userSettingsScenarios } from "@/mock/fixtures/user.fixtures";
import { scenarios } from "@/mock/handlers";
import { server } from "@/test/msw-server";
import { recordRequests, renderHookWithProviders } from "@/test/test-utils";
import { useSettingsController } from "./use-settings.controller";

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

describe("useSettingsController", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("falls back to accepting + instant alerts before data arrives", () => {
    const { result } = renderHookWithProviders(() => useSettingsController());

    expect(result.current.isAccepting).toBe(true);
    expect(result.current.emailAlerts).toBe("instant");
    expect(result.current.blockedHashes).toEqual([]);
  });

  it("reflects a closed inbox with alerts, web push and blocked senders", async () => {
    server.use(...scenarios.settings.closedWithBlocks);
    const { closedWithBlocks } = userSettingsScenarios;
    const { result } = renderHookWithProviders(() => useSettingsController());

    await waitFor(() => expect(result.current.isAccepting).toBe(false));
    await waitFor(() =>
      expect(result.current.blockedHashes).toEqual(
        closedWithBlocks.blockedSenderHashes
      )
    );
    expect(result.current.emailAlerts).toBe("daily");
    expect(result.current.webPushEnabled).toBe(true);
  });

  it("toggles acceptance through the API", async () => {
    const requests = recordRequests();
    const { result } = renderHookWithProviders(() => useSettingsController());

    act(() => result.current.handleToggleAcceptance());

    await waitFor(() => expect(requests).toContain("POST /api/accept-message"));
  });

  it("delegates acceptance to a controlled toggle", () => {
    const onToggle = vi.fn();
    const requests = recordRequests();
    const { result } = renderHookWithProviders(() =>
      useSettingsController({ acceptMessages: false, onToggle })
    );

    act(() => result.current.handleToggleAcceptance());

    expect(result.current.isAccepting).toBe(false);
    expect(onToggle).toHaveBeenCalledOnce();
    expect(requests).not.toContain("POST /api/accept-message");
  });

  it("updates email alerts and unblocks senders", async () => {
    const requests = recordRequests();
    const { result } = renderHookWithProviders(() => useSettingsController());

    act(() => result.current.handleEmailAlertChange("daily"));
    act(() => result.current.handleUnblockAll());

    await waitFor(() =>
      expect(requests).toEqual(
        expect.arrayContaining([
          "PATCH /api/user/notifications",
          "DELETE /api/block-sender",
        ])
      )
    );
  });
});

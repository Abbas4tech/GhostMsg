import { act, waitFor } from "@testing-library/react";
import { toast } from "sonner";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PUSH_NOT_CONFIGURED_MESSAGE } from "@/data/user/use-push-notification.utils";
import { userSettingsScenarios } from "@/mock/fixtures/user.fixtures";
import { scenarios } from "@/mock/handlers";
import { server } from "@/test/msw-server";
import { recordRequests, renderHookWithProviders } from "@/test/test-utils";
import { useSettingsController } from "./use-settings.controller";

/** Any 65-byte base64url string: the test PushManager does not validate it. */
const TEST_VAPID_PUBLIC_KEY = `B${"A".repeat(86)}`;

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

describe("useSettingsController", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
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

  it("explains when web push is not configured on the server", async () => {
    vi.stubEnv("NEXT_PUBLIC_VAPID_PUBLIC_KEY", "");
    const requests = recordRequests();
    const { result } = renderHookWithProviders(() => useSettingsController());

    await act(() => result.current.handleToggleWebPush(true));

    expect(toast.error).toHaveBeenCalledWith(PUSH_NOT_CONFIGURED_MESSAGE);
    expect(requests).not.toContain("POST /api/user/push-subscription");
  });

  it("registers this device's push subscription when enabled", async () => {
    vi.stubEnv("NEXT_PUBLIC_VAPID_PUBLIC_KEY", TEST_VAPID_PUBLIC_KEY);
    const requests = recordRequests();
    const { result } = renderHookWithProviders(() => useSettingsController());

    await act(() => result.current.handleToggleWebPush(true));

    expect(requests).toContain("POST /api/user/push-subscription");
    expect(toast.error).not.toHaveBeenCalled();
  });

  it("turns web push off on the server when disabled", async () => {
    const requests = recordRequests();
    const { result } = renderHookWithProviders(() => useSettingsController());

    await act(() => result.current.handleToggleWebPush(false));

    expect(requests).toContain("PATCH /api/user/notifications");
  });
});

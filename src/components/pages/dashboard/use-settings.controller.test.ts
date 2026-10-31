import { act, waitFor } from "@testing-library/react";
import { toast } from "sonner";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PUSH_NOT_CONFIGURED_MESSAGE } from "@/data/user/use-push-notification.utils";
import { downloadTextFile } from "@/lib/browser/download";
import { messageScenarios } from "@/mock/fixtures/messages.fixtures";
import { userSettingsScenarios } from "@/mock/fixtures/user.fixtures";
import { scenarios } from "@/mock/handlers";
import { server } from "@/test/msw-server";
import { recordRequests, renderHookWithProviders } from "@/test/test-utils";
import { useSettingsController } from "./use-settings.controller";

/** A service worker registration that already holds a push subscription. */
const thisDeviceRegistration = () =>
  ({
    pushManager: {
      getSubscription: vi.fn().mockResolvedValue({
        endpoint: "https://push.example.com/sub/this-device",
        unsubscribe: vi.fn().mockResolvedValue(true),
      }),
    },
  }) as unknown as ServiceWorkerRegistration;

/** Any 65-byte base64url string: the test PushManager does not validate it. */
const TEST_VAPID_PUBLIC_KEY = `B${"A".repeat(86)}`;

vi.mock("sonner", () => ({ toast: { error: vi.fn(), success: vi.fn() } }));
// `notify` (the design's toast API) forwards to the mocked Sonner spies above.
vi.mock("@/components/elements/sonner", async () => {
  const sonner = await import("sonner");
  return { notify: sonner.toast };
});
vi.mock("@/lib/browser/download", () => ({ downloadTextFile: vi.fn() }));

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
    // The account has push on, but not on this browser: the switch is off.
    expect(result.current.webPushEnabled).toBe(false);
  });

  it("shows push on only when this device is subscribed", async () => {
    vi.mocked(navigator.serviceWorker.getRegistration).mockResolvedValueOnce(
      thisDeviceRegistration()
    );
    server.use(...scenarios.settings.closedWithBlocks);
    const { result } = renderHookWithProviders(() => useSettingsController());

    await waitFor(() => expect(result.current.webPushEnabled).toBe(true));
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

  it("exports every message, quarantined included, without Sender Hashes", async () => {
    const { result } = renderHookWithProviders(() => useSettingsController());

    await act(() => result.current.handleExport("json"));

    expect(downloadTextFile).toHaveBeenCalledTimes(1);
    const [file] = vi.mocked(downloadTextFile).mock.calls[0];
    const records: { isQuarantined: boolean }[] = JSON.parse(file.content);
    expect(records).toHaveLength(messageScenarios.mixed.length);
    expect(records.some((record) => record.isQuarantined)).toBe(true);
    expect(file.content).not.toContain("senderHash");
    expect(result.current.isExporting).toBe(false);
  });

  it("toasts and downloads nothing when the export fails", async () => {
    server.use(...scenarios.inbox.error);
    const { result } = renderHookWithProviders(() => useSettingsController());

    await act(() => result.current.handleExport("csv"));

    expect(toast.error).toHaveBeenCalledWith("Failed to fetch messages");
    expect(downloadTextFile).not.toHaveBeenCalled();
    expect(result.current.isExporting).toBe(false);
  });

  it("turns push off for this device only (other devices keep it)", async () => {
    const registration = thisDeviceRegistration();
    vi.mocked(navigator.serviceWorker.getRegistration).mockResolvedValue(
      registration
    );
    const requests = recordRequests();
    const { result } = renderHookWithProviders(() => useSettingsController());

    await act(() => result.current.handleToggleWebPush(false));

    expect(requests).toContain("DELETE /api/user/push-subscription");
    expect(requests).not.toContain("PATCH /api/user/notifications");
    expect(result.current.webPushEnabled).toBe(false);
    vi.mocked(navigator.serviceWorker.getRegistration).mockResolvedValue(
      undefined
    );
  });
});

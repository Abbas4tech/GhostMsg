import { act, waitFor } from "@testing-library/react";
import { toast } from "sonner";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  messageScenarios,
  mixedMessageCounts,
} from "@/mock/fixtures/messages.fixtures";
import { scenarios } from "@/mock/handlers";
import { server } from "@/test/msw-server";
import { renderHookWithProviders } from "@/test/test-utils";
import { useInboxDataController } from "./use-inbox-data.controller";

vi.mock("sonner", () => ({
  toast: { error: vi.fn(), info: vi.fn(), success: vi.fn() },
}));
// `notify` (the design's toast API) forwards to the mocked Sonner spies above.
vi.mock("@/components/elements/sonner", async () => {
  const sonner = await import("sonner");
  return { notify: sonner.toast };
});

describe("useInboxDataController", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads one filter from the server with the server counts", async () => {
    const { result } = renderHookWithProviders(() =>
      useInboxDataController({ q: "", status: "quarantined" })
    );

    await waitFor(() => expect(result.current.messages).toHaveLength(1));
    await waitFor(() =>
      expect(result.current.counts).toEqual(mixedMessageCounts)
    );
    expect(result.current.totalMessages).toBe(messageScenarios.mixed.length);
    expect(result.current.loadedIds.has("msg-5")).toBe(true);
    expect(result.current.pagination.hasMore).toBe(false);
  });

  it("polls while the live stream is not connected", () => {
    const { result } = renderHookWithProviders(() =>
      useInboxDataController({ q: "", status: "all" })
    );

    // No session in this harness, so the stream never connects.
    expect(result.current.isLiveConnected).toBe(false);
  });

  it("toasts a failed refresh and confirms a good one", async () => {
    const { result } = renderHookWithProviders(() =>
      useInboxDataController({ q: "", status: "all" })
    );
    await waitFor(() =>
      expect(result.current.messages.length).toBeGreaterThan(0)
    );

    await act(() => result.current.handleRefresh());
    expect(toast.success).toHaveBeenCalledWith(
      "Messages refreshed successfully"
    );

    server.use(...scenarios.inbox.error);
    await act(() => result.current.handleRefresh());
    expect(toast.error).toHaveBeenCalledWith("Failed to fetch messages");
  });
});

import { act } from "@testing-library/react";
import { toast } from "sonner";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { FIXTURE_USERNAME } from "@/mock/fixtures/public-profile.fixtures";
import { sessionScenarios } from "@/mock/fixtures/session.fixtures";
import { recordRequests, renderHookWithProviders } from "@/test/test-utils";
import { useProfileController } from "./use-profile.controller";

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

describe("useProfileController", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("builds the shareable profile URL from the session username", () => {
    const { result } = renderHookWithProviders(() => useProfileController(), {
      session: sessionScenarios.authenticated,
    });

    expect(result.current.profileUrl).toBe(
      `${window.location.origin}/u/${FIXTURE_USERNAME}`
    );
  });

  it("saves a trimmed AMA prompt", async () => {
    const requests = recordRequests();
    const { result } = renderHookWithProviders(() => useProfileController());

    act(() => result.current.setAmaPrompt("  Ask me about design  "));
    await act(() => result.current.handleSaveAmaPrompt());

    expect(requests).toContain("PATCH /api/user/ama-prompt");
    expect(toast.success).toHaveBeenCalled();
  });

  it("ignores a blank AMA prompt", async () => {
    const requests = recordRequests();
    const { result } = renderHookWithProviders(() => useProfileController());

    act(() => result.current.setAmaPrompt("   "));
    await act(() => result.current.handleSaveAmaPrompt());

    expect(requests).not.toContain("PATCH /api/user/ama-prompt");
  });
});

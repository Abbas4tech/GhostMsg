import { act, waitFor } from "@testing-library/react";
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

  it("keeps edits as a dirty draft until discarded", () => {
    const { result } = renderHookWithProviders(() => useProfileController());

    act(() => result.current.setDisplayName("Maya R."));
    expect(result.current.displayName).toBe("Maya R.");
    expect(result.current.isDirty).toBe(true);

    act(() => result.current.handleDiscard());
    expect(result.current.isDirty).toBe(false);
  });

  it("saves the profile and the trimmed AMA prompt together", async () => {
    const requests = recordRequests();
    const { result } = renderHookWithProviders(() => useProfileController());

    act(() => {
      result.current.setDisplayName("Maya R.");
      result.current.setAmaPrompt("  Ask me about design  ");
    });
    await act(() => result.current.handleSave());

    expect(requests).toContain("PATCH /api/user/profile");
    expect(requests).toContain("PATCH /api/user/ama-prompt");
    expect(toast.success).toHaveBeenCalledWith("Profile saved");
    expect(result.current.isDirty).toBe(false);
  });

  it("does not send a blank AMA prompt", async () => {
    const requests = recordRequests();
    const { result } = renderHookWithProviders(() => useProfileController());

    act(() => result.current.setAmaPrompt("   "));
    await act(() => result.current.handleSave());

    expect(requests).not.toContain("PATCH /api/user/ama-prompt");
  });

  it("loads AI prompt ideas", async () => {
    const { result } = renderHookWithProviders(() => useProfileController());

    await act(() => result.current.handleSuggest());

    await waitFor(() =>
      expect(result.current.aiIdeas.length).toBeGreaterThan(0)
    );
  });
});

import { act, waitFor } from "@testing-library/react";
import { toast } from "sonner";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { FIXTURE_USERNAME } from "@/mock/fixtures/public-profile.fixtures";
import { sessionScenarios } from "@/mock/fixtures/session.fixtures";
import { server } from "@/test/msw-server";
import { recordRequests, renderHookWithProviders } from "@/test/test-utils";
import { useProfileController } from "./use-profile.controller";

const { push } = vi.hoisted(() => ({ push: vi.fn() }));

vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));
vi.mock("sonner", () => ({ toast: { error: vi.fn(), success: vi.fn() } }));
// `notify` (the design's toast API) forwards to the mocked Sonner spies above.
vi.mock("@/components/elements/sonner", async () => {
  const sonner = await import("sonner");
  return { notify: sonner.toast };
});

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

  it("saves the profile and the trimmed AMA prompt in one request", async () => {
    const requests = recordRequests();
    const bodies: unknown[] = [];
    const captureBody = async ({ request }: { request: Request }) => {
      if (request.method === "PATCH") {
        bodies.push(await request.clone().json());
      }
    };
    server.events.on("request:start", captureBody);
    const { result } = renderHookWithProviders(() => useProfileController());

    act(() => {
      result.current.setDisplayName("Maya R.");
      result.current.setAmaPrompt("  Ask me about design  ");
    });
    await act(() => result.current.handleSave());

    expect(
      requests.filter((request) => request === "PATCH /api/user/profile")
    ).toHaveLength(1);
    expect(requests).not.toContain("PATCH /api/user/ama-prompt");
    expect(toast.success).toHaveBeenCalledWith("Profile saved");
    await waitFor(() => expect(result.current.isDirty).toBe(false));
    expect(bodies).toEqual([
      { amaPrompt: "Ask me about design", displayName: "Maya R." },
    ]);
    server.events.removeListener("request:start", captureBody);
  });

  it("sends nothing when the only change is a blank AMA prompt", async () => {
    const requests = recordRequests();
    const { result } = renderHookWithProviders(() => useProfileController());

    act(() => result.current.setAmaPrompt("   "));
    await act(() => result.current.handleSave());

    expect(requests).not.toContain("PATCH /api/user/profile");
    expect(result.current.isDirty).toBe(false);
  });

  it("asks before leaving with unsaved edits, then discards and navigates", async () => {
    const { result } = renderHookWithProviders(() => useProfileController());

    act(() => result.current.setDisplayName("Unsaved"));
    act(() => {
      const anchor = document.createElement("a");
      anchor.href = "/dashboard/settings";
      document.body.append(anchor);
      anchor.click();
      anchor.remove();
    });

    expect(result.current.isLeaveConfirmOpen).toBe(true);
    act(() => result.current.handleConfirmLeave());

    expect(push).toHaveBeenCalledWith("/dashboard/settings");
    await waitFor(() => expect(result.current.isDirty).toBe(false));
  });

  it("loads AI prompt ideas", async () => {
    const { result } = renderHookWithProviders(() => useProfileController());

    await act(() => result.current.handleSuggest());

    await waitFor(() =>
      expect(result.current.aiIdeas.length).toBeGreaterThan(0)
    );
  });
});

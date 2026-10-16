import { act } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { FIXTURE_USERNAME } from "@/mock/fixtures/public-profile.fixtures";
import { sessionScenarios } from "@/mock/fixtures/session.fixtures";
import { renderHookWithProviders } from "@/test/test-utils";
import { useProfileLinkController } from "./use-profile-link.controller";

const { toast } = vi.hoisted(() => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock("sonner", () => ({ toast }));

const renderLink = () =>
  renderHookWithProviders(() => useProfileLinkController(), {
    session: sessionScenarios.authenticated,
  });

describe("useProfileLinkController", () => {
  const writeText = vi.fn();
  const share = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
  });

  afterEach(() => {
    Reflect.deleteProperty(navigator, "share");
  });

  it("builds the link and its label from the session username", () => {
    const { result } = renderLink();

    expect(result.current.username).toBe(FIXTURE_USERNAME);
    expect(result.current.profileUrl).toBe(
      `${window.location.origin}/u/${FIXTURE_USERNAME}`
    );
    expect(result.current.profileLabel).toBe(
      `${window.location.host}/u/${FIXTURE_USERNAME}`
    );
  });

  it("copies the link and confirms", async () => {
    writeText.mockResolvedValueOnce(undefined);
    const { result } = renderLink();

    await act(() => result.current.handleCopy());

    expect(writeText).toHaveBeenCalledWith(result.current.profileUrl);
    expect(toast.success).toHaveBeenCalledWith("Link copied");
  });

  it("explains a blocked clipboard", async () => {
    writeText.mockRejectedValueOnce(new Error("denied"));
    const { result } = renderLink();

    await act(() => result.current.handleCopy());

    expect(toast.error).toHaveBeenCalled();
  });

  it("offers the native share sheet only when the browser has one", async () => {
    expect(renderLink().result.current.handleShare).toBeUndefined();

    Object.defineProperty(navigator, "share", {
      configurable: true,
      value: share,
    });
    share.mockResolvedValueOnce(undefined);
    const { result } = renderLink();

    await act(() => result.current.handleShare?.() ?? Promise.resolve());

    expect(share).toHaveBeenCalledWith(
      expect.objectContaining({ url: result.current.profileUrl })
    );
  });
});

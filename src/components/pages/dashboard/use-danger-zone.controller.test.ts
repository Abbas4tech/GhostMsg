import { act, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { FIXTURE_USERNAME } from "@/mock/fixtures/public-profile.fixtures";
import { recordRequests, renderHookWithProviders } from "@/test/test-utils";
import { useDangerZoneController } from "./use-danger-zone.controller";

const { signOut, toast } = vi.hoisted(() => ({
  signOut: vi.fn(),
  toast: Object.assign(vi.fn(), { error: vi.fn(), success: vi.fn() }),
}));

vi.mock("next-auth/react", async (importOriginal) => ({
  ...(await importOriginal<typeof import("next-auth/react")>()),
  signOut,
}));
vi.mock("sonner", () => ({ toast }));

interface UndoToastOptions {
  action: { onClick: () => void };
}

const DELETE_ALL_REQUEST = "DELETE /api/messages";
const SETTLE_MS = 50;

describe("useDangerZoneController", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("holds Delete all behind an Undo toast", () => {
    const requests = recordRequests();
    const { result } = renderHookWithProviders(() =>
      useDangerZoneController(FIXTURE_USERNAME)
    );

    act(() => result.current.openDeleteAll());
    expect(result.current.isDeleteAllOpen).toBe(true);

    act(() => result.current.handleConfirmDeleteAll());

    expect(result.current.isDeleteAllOpen).toBe(false);
    expect(toast).toHaveBeenCalledOnce();
    expect(requests).not.toContain(DELETE_ALL_REQUEST);
  });

  it("cancels the delete when Undo is clicked", async () => {
    const requests = recordRequests();
    const { result, unmount } = renderHookWithProviders(() =>
      useDangerZoneController(FIXTURE_USERNAME)
    );

    act(() => result.current.handleConfirmDeleteAll());
    const options = toast.mock.calls[0]?.[1] as UndoToastOptions;
    act(() => options.action.onClick());
    unmount();

    expect(toast.success).toHaveBeenCalledWith("Nothing was deleted");
    await new Promise((resolve) => setTimeout(resolve, SETTLE_MS));
    expect(requests).not.toContain(DELETE_ALL_REQUEST);
  });

  it("commits a pending delete when the page unmounts", async () => {
    const requests = recordRequests();
    const { result, unmount } = renderHookWithProviders(() =>
      useDangerZoneController(FIXTURE_USERNAME)
    );

    act(() => result.current.handleConfirmDeleteAll());
    unmount();

    await waitFor(() => expect(requests).toContain(DELETE_ALL_REQUEST));
  });

  it("deletes the account with the typed username, then signs out", async () => {
    const requests = recordRequests();
    const { result } = renderHookWithProviders(() =>
      useDangerZoneController(FIXTURE_USERNAME)
    );

    act(() => result.current.openDeleteAccount());
    act(() => result.current.setConfirmValue(FIXTURE_USERNAME));
    await act(() => result.current.handleConfirmDeleteAccount());

    expect(requests).toContain("DELETE /api/user");
    expect(signOut).toHaveBeenCalledWith({ callbackUrl: "/" });
  });

  it("does not sign out when the confirmation is wrong", async () => {
    const { result } = renderHookWithProviders(() =>
      useDangerZoneController(FIXTURE_USERNAME)
    );

    act(() => result.current.setConfirmValue("someone_else"));
    await act(() => result.current.handleConfirmDeleteAccount());

    expect(signOut).not.toHaveBeenCalled();
  });
});

import { act, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { FIXTURE_USERNAME } from "@/mock/fixtures/public-profile.fixtures";
import { recordRequests, renderHookWithProviders } from "@/test/test-utils";
import { useDangerZoneController } from "./use-danger-zone.controller";

const { showUndoToast, signOut, toast } = vi.hoisted(() => ({
  showUndoToast: vi.fn(() => UNDO_TOAST_ID),
  signOut: vi.fn(),
  toast: Object.assign(vi.fn(), {
    dismiss: vi.fn(),
    error: vi.fn(),
    success: vi.fn(),
  }),
}));

vi.mock("next-auth/react", async (importOriginal) => ({
  ...(await importOriginal<typeof import("next-auth/react")>()),
  signOut,
}));
vi.mock("sonner", () => ({ toast }));
// `notify` (the design's toast API) forwards to the mocked Sonner spies above.
vi.mock("@/components/elements/sonner", async () => {
  const sonner = await import("sonner");
  return { notify: sonner.toast };
});
vi.mock("@/components/patterns/undo-toast", () => ({ showUndoToast }));

interface UndoToastOptions {
  onCommit: () => void;
  onUndo: () => void;
}

const lastUndoToast = () =>
  showUndoToast.mock.calls.at(-1)?.at(0) as unknown as UndoToastOptions;

const UNDO_TOAST_ID = "undo-delete-all";
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
    expect(showUndoToast).toHaveBeenCalledOnce();
    expect(requests).not.toContain(DELETE_ALL_REQUEST);
  });

  it("deletes when the Undo toast closes without Undo", async () => {
    const requests = recordRequests();
    const { result } = renderHookWithProviders(() =>
      useDangerZoneController(FIXTURE_USERNAME)
    );

    act(() => result.current.handleConfirmDeleteAll());
    act(() => lastUndoToast().onCommit());

    await waitFor(() => expect(requests).toContain(DELETE_ALL_REQUEST));
  });

  it("cancels the delete when Undo is clicked", async () => {
    const requests = recordRequests();
    const { result, unmount } = renderHookWithProviders(() =>
      useDangerZoneController(FIXTURE_USERNAME)
    );

    act(() => result.current.handleConfirmDeleteAll());
    act(() => lastUndoToast().onUndo());
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

    expect(toast.dismiss).toHaveBeenCalledWith(UNDO_TOAST_ID);
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

import { act, waitFor } from "@testing-library/react";
import { toast } from "sonner";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { downloadTextFile } from "@/lib/browser/download";
import {
  answeredSpicyMessage,
  mixedMessageCounts,
  quarantinedMessage,
  sweetMessage,
} from "@/mock/fixtures/messages.fixtures";
import { buildBlockedHashes } from "@/mock/fixtures/user.fixtures";
import { scenarios } from "@/mock/handlers";
import { server } from "@/test/msw-server";
import { recordRequests, renderHookWithProviders } from "@/test/test-utils";
import { useInboxController } from "./use-inbox.controller";

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
}));
vi.mock("@/lib/browser/download", () => ({ downloadTextFile: vi.fn() }));

const VISIBLE_IN_ALL = mixedMessageCounts.all;

async function renderLoadedInbox() {
  const view = renderHookWithProviders(() => useInboxController());
  await waitFor(() =>
    expect(view.result.current.allMessages.length).toBeGreaterThan(0)
  );
  return view;
}

describe("useInboxController", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads the inbox and hides quarantined messages from 'all'", async () => {
    const { result } = await renderLoadedInbox();

    expect(result.current.counts).toEqual(mixedMessageCounts);
    expect(result.current.messages).toHaveLength(VISIBLE_IN_ALL);
    expect(result.current.messages).not.toContainEqual(quarantinedMessage);
  });

  it("filters by status and search query", async () => {
    const { result } = await renderLoadedInbox();

    act(() => result.current.setActiveStatus("quarantined"));
    expect(result.current.messages).toEqual([quarantinedMessage]);

    act(() => {
      result.current.setActiveStatus("all");
      result.current.setSearchQuery("controversial");
    });
    expect(result.current.messages).toEqual([answeredSpicyMessage]);
  });

  it("toggles selection and clears it", async () => {
    const { result } = await renderLoadedInbox();
    const id = String(sweetMessage._id);

    act(() => result.current.handleToggleSelect(id));
    expect(result.current.selectedIds).toEqual([id]);

    act(() => result.current.handleToggleSelect(id));
    expect(result.current.selectedIds).toEqual([]);

    act(() => result.current.handleToggleSelect(id));
    act(() => result.current.handleDeselectAll());
    expect(result.current.selectedIds).toEqual([]);
  });

  it("keeps the active message after closing so dialogs can animate out", async () => {
    const { result } = await renderLoadedInbox();

    act(() => result.current.openReplyModal(sweetMessage));
    expect(result.current.activeModal).toBe("reply");
    expect(result.current.activeMessage).toEqual(sweetMessage);

    act(() => result.current.closeModal());
    expect(result.current.activeModal).toBeNull();
    expect(result.current.activeMessage).toEqual(sweetMessage);
  });

  it("applies a bulk action to the selection, then clears it", async () => {
    const requests = recordRequests();
    const { result } = await renderLoadedInbox();

    act(() => result.current.handleToggleSelect(String(sweetMessage._id)));
    await act(() => result.current.handleBulkAction("read"));

    expect(requests).toContain("POST /api/messages/bulk");
    expect(result.current.selectedIds).toEqual([]);
  });

  it("exports only the selected messages", async () => {
    const { result } = await renderLoadedInbox();

    act(() => result.current.handleToggleSelect(String(sweetMessage._id)));
    act(() => result.current.handleExport("json"));

    expect(downloadTextFile).toHaveBeenCalledWith(
      expect.objectContaining({
        content: JSON.stringify([sweetMessage], null, 2),
        mimeType: "text/json",
      })
    );
  });

  it("deletes through the API and closes the modal", async () => {
    const requests = recordRequests();
    const { result } = await renderLoadedInbox();

    act(() => result.current.openDeleteModal(sweetMessage));
    await act(() => result.current.handleDeleteConfirm(sweetMessage));

    expect(requests).toContain(
      `DELETE /api/delete-message/${sweetMessage._id}`
    );
    expect(result.current.activeModal).toBeNull();
  });

  it("delegates deletes and refreshes to controlled callbacks", async () => {
    const onDelete = vi.fn().mockResolvedValue(undefined);
    const onRefresh = vi.fn();
    const { result } = renderHookWithProviders(() =>
      useInboxController({
        initialMessages: [sweetMessage],
        onDelete,
        onRefresh,
      })
    );

    await act(() => result.current.handleDeleteConfirm(sweetMessage));
    await act(() => result.current.handleRefresh());

    expect(onDelete).toHaveBeenCalledWith(sweetMessage);
    expect(onRefresh).toHaveBeenCalledOnce();
  });

  it("toasts the error when a refresh fails", async () => {
    const { result } = await renderLoadedInbox();
    server.use(...scenarios.inbox.error);

    await act(() => result.current.handleRefresh());

    expect(toast.error).toHaveBeenCalledWith("Failed to fetch messages");
  });

  it("reports blocked senders from the blocklist", async () => {
    server.use(...scenarios.settings.closedWithBlocks);
    const [blockedHash] = buildBlockedHashes(1);
    const { result } = renderHookWithProviders(() => useInboxController());

    await waitFor(() =>
      expect(result.current.isSenderBlocked(blockedHash)).toBe(true)
    );
    expect(result.current.isSenderBlocked("not-blocked")).toBe(false);
    expect(result.current.isSenderBlocked(undefined)).toBe(false);
  });
});

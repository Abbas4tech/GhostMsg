import { act, waitFor } from "@testing-library/react";
import { delay, http } from "msw";
import { toast } from "sonner";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { INBOX_PAGE_SIZE } from "@/data/messages/messages.queries";
import { downloadTextFile } from "@/lib/browser/download";
import { buildMessagesJson } from "@/lib/messages/export";
import {
  answeredSpicyMessage,
  buildMessage,
  curiousMessage,
  fixtureDate,
  messageScenarios,
  mixedMessageCounts,
  quarantinedMessage,
  sweetMessage,
} from "@/mock/fixtures/messages.fixtures";
import { buildBlockedHashes } from "@/mock/fixtures/user.fixtures";
import { scenarios } from "@/mock/handlers";
import { inboxHandlers } from "@/mock/handlers/messages.handlers";
import { apiError, mswPath } from "@/mock/handlers/utils";
import { server } from "@/test/msw-server";
import { recordRequests, renderHookWithProviders } from "@/test/test-utils";
import { useInboxController } from "./use-inbox.controller";

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
}));
vi.mock("@/lib/browser/download", () => ({ downloadTextFile: vi.fn() }));

const VISIBLE_IN_ALL = mixedMessageCounts.all;
const ids = (messages: { _id: string }[]) => messages.map((m) => String(m._id));

async function renderLoadedInbox() {
  const view = renderHookWithProviders(() => useInboxController());
  await waitFor(() =>
    expect(view.result.current.messages.length).toBeGreaterThan(0)
  );
  return view;
}

/** 35 messages, newest first: one full page plus a second page of 5. */
const manyMessages = Array.from({ length: INBOX_PAGE_SIZE + 5 }, (_, i) =>
  buildMessage({
    _id: `msg-many-${String(i).padStart(2, "0")}`,
    content: `Paged message number ${i}`,
    createdAt: fixtureDate(i + 1),
  })
);

describe("useInboxController", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads 'all' from the server (no quarantined) with server counts", async () => {
    const { result } = await renderLoadedInbox();

    expect(result.current.messages).toHaveLength(VISIBLE_IN_ALL);
    expect(ids(result.current.messages)).not.toContain(
      String(quarantinedMessage._id)
    );
    await waitFor(() =>
      expect(result.current.counts).toEqual(mixedMessageCounts)
    );
    expect(result.current.totalMessages).toBe(messageScenarios.mixed.length);
  });

  it("asks the server for each filter, so Quarantined is never empty by accident", async () => {
    const { result } = await renderLoadedInbox();

    act(() => result.current.setActiveStatus("quarantined"));

    await waitFor(() =>
      expect(ids(result.current.messages)).toEqual([
        String(quarantinedMessage._id),
      ])
    );
  });

  it("searches on the server after a short pause", async () => {
    const { result } = await renderLoadedInbox();

    act(() => result.current.setSearchQuery("controversial"));

    await waitFor(() =>
      expect(ids(result.current.messages)).toEqual([
        String(answeredSpicyMessage._id),
      ])
    );
  });

  it("pages through the server with Load more", async () => {
    server.use(...inboxHandlers(manyMessages));
    const { result } = await renderLoadedInbox();

    expect(result.current.messages).toHaveLength(INBOX_PAGE_SIZE);
    expect(result.current.pagination.hasMore).toBe(true);

    act(() => result.current.pagination.onLoadMore());

    await waitFor(() =>
      expect(result.current.messages).toHaveLength(manyMessages.length)
    );
    expect(result.current.pagination.hasMore).toBe(false);
    expect(new Set(ids(result.current.messages)).size).toBe(
      manyMessages.length
    );
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

  it("drops the selection when the filter changes, so bulk actions only touch visible messages", async () => {
    const { result } = await renderLoadedInbox();

    act(() => result.current.handleToggleSelect(String(sweetMessage._id)));
    act(() => result.current.setActiveStatus("starred"));

    expect(result.current.selectedIds).toEqual([]);
  });

  it("ignores selected ids that are not loaded", async () => {
    const { result } = await renderLoadedInbox();

    act(() => result.current.handleToggleSelect("msg-not-loaded"));

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

  it("marks an unread message read when the recipient opens it to reply", async () => {
    server.use(
      http.patch(mswPath("/api/messages/{messageId}"), async () => {
        await delay("infinite");
      })
    );
    const requests = recordRequests();
    const { result } = await renderLoadedInbox();

    act(() => result.current.openReplyModal(sweetMessage));

    await waitFor(() =>
      expect(requests).toContain(`PATCH /api/messages/${sweetMessage._id}`)
    );
    const updated = result.current.messages.find(
      (m) => m._id === sweetMessage._id
    );
    expect(updated?.isRead).toBe(true);
  });

  it("does not mark an already-read message again", async () => {
    const requests = recordRequests();
    const { result } = await renderLoadedInbox();

    act(() => result.current.openStoryModal(answeredSpicyMessage));

    expect(requests).not.toContain(
      `PATCH /api/messages/${answeredSpicyMessage._id}`
    );
  });

  it("stars optimistically and rolls back when the server refuses", async () => {
    server.use(
      http.patch(mswPath("/api/messages/{messageId}"), () =>
        apiError(500, "Could not star")
      )
    );
    const { result } = await renderLoadedInbox();

    await act(() => result.current.handleStarToggle(curiousMessage));

    expect(toast.error).toHaveBeenCalledWith("Could not star");
    await waitFor(() =>
      expect(
        result.current.messages.find((m) => m._id === curiousMessage._id)
          ?.isPinned
      ).toBe(false)
    );
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
        content: buildMessagesJson([sweetMessage]),
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

  it("removes a deleted message before the server responds", async () => {
    server.use(
      http.delete(mswPath("/api/delete-message/{messageId}"), async () => {
        await delay("infinite");
      })
    );
    const { result } = await renderLoadedInbox();

    act(() => result.current.openDeleteModal(sweetMessage));
    act(() => {
      result.current.handleDeleteConfirm(sweetMessage);
    });

    expect(result.current.activeModal).toBeNull();
    await waitFor(() =>
      expect(ids(result.current.messages)).not.toContain(
        String(sweetMessage._id)
      )
    );
  });

  it("restores a message and toasts when the delete fails", async () => {
    server.use(
      http.delete(mswPath("/api/delete-message/{messageId}"), () =>
        apiError(500, "Could not delete")
      )
    );
    const { result } = await renderLoadedInbox();

    await act(() => result.current.handleDeleteConfirm(sweetMessage));

    expect(toast.error).toHaveBeenCalledWith("Could not delete");
    await waitFor(() =>
      expect(ids(result.current.messages)).toContain(String(sweetMessage._id))
    );
  });

  it("applies bulk delete optimistically", async () => {
    server.use(
      http.post(mswPath("/api/messages/bulk"), async () => {
        await delay("infinite");
      })
    );
    const { result } = await renderLoadedInbox();

    act(() => result.current.handleToggleSelect(String(sweetMessage._id)));
    act(() => {
      result.current.handleBulkAction("delete");
    });

    expect(result.current.selectedIds).toEqual([]);
    await waitFor(() =>
      expect(ids(result.current.messages)).not.toContain(
        String(sweetMessage._id)
      )
    );
  });

  it("rolls back a failed bulk action", async () => {
    server.use(
      http.post(mswPath("/api/messages/bulk"), () =>
        apiError(500, "Bulk failed")
      )
    );
    const { result } = await renderLoadedInbox();

    act(() => result.current.handleToggleSelect(String(sweetMessage._id)));
    await act(() => result.current.handleBulkAction("delete"));

    expect(toast.error).toHaveBeenCalledWith("Bulk failed");
    await waitFor(() =>
      expect(ids(result.current.messages)).toContain(String(sweetMessage._id))
    );
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

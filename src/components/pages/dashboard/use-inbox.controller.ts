"use client";

import { useQuery } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";
import { useLocalStorage } from "usehooks-ts";
import type { BulkAction } from "@/components/patterns/bulk-action-toolbar";
import type { MessageFilterStatus } from "@/components/patterns/filter-bar";
import { useArchiveMessageMutation } from "@/data/messages/use-archive-message-mutation";
import { useBulkActionMutation } from "@/data/messages/use-bulk-action-mutation";
import { useDeleteMessageMutation } from "@/data/messages/use-delete-message-mutation";
import { useUpdateMessageMutation } from "@/data/messages/use-update-message-mutation";
import {
  useBlockSenderMutation,
  useUnblockSenderMutation,
} from "@/data/user/use-block-sender-mutation";
import { userQueries } from "@/data/user/user.queries";
import { downloadTextFile } from "@/lib/browser/download";
import {
  buildMessagesExport,
  type MessageExportFormat,
} from "@/lib/messages/export";
import type { MessageDto } from "@/types/api";
import {
  CLOSED_INBOX_MODAL,
  type InboxModalKind,
  type InboxModalState,
  resolveModalMessage,
  type ScopedSelection,
  toggleScopedSelection,
  visibleSelection,
} from "./inbox.utils";
import { useInboxDataController } from "./use-inbox-data.controller";
import { useInboxFiltersController } from "./use-inbox-filters.controller";

export type ActiveModalType = InboxModalKind | null;

export type InboxViewMode = "grid" | "list";

/** Grid or list, remembered per device. */
export const INBOX_LAYOUT_STORAGE_KEY = "ghostmsg-inbox-layout";

export interface UseInboxControllerOptions {
  /** `?q=` from the route. */
  initialQuery?: string;
  /** `?filter=` from the route (command palette shortcuts, shared links). */
  initialStatus?: MessageFilterStatus;
}

const NO_IDS: string[] = [];

/**
 * Headless Inbox controller (ADR 0014, Chapter 20): composes the URL-synced
 * filters and the server data, and owns selection, the hoisted dialog (by
 * message id) and the message actions. The Inbox block renders; this decides.
 */
export function useInboxController({
  initialStatus,
  initialQuery,
}: UseInboxControllerOptions = {}) {
  const filters = useInboxFiltersController({ initialQuery, initialStatus });
  const data = useInboxDataController({
    q: filters.debouncedQuery,
    status: filters.activeStatus,
  });
  const { messages, loadedIds } = data;
  const { scope } = filters;

  const { data: blockedSendersData } = useQuery(userQueries.blockedSenders());
  const { data: preferencesData } = useQuery(userQueries.preferences());
  const blockedSenderHashes = useMemo(
    () => new Set(blockedSendersData?.blockedSenderHashes ?? []),
    [blockedSendersData?.blockedSenderHashes]
  );
  const isSenderBlocked = useCallback(
    (senderHash?: string) =>
      senderHash ? blockedSenderHashes.has(senderHash) : false,
    [blockedSenderHashes]
  );

  // Stable mutate functions keep the callbacks below (and memoized cards) stable.
  const { mutate: updateMessage, mutateAsync: updateMessageAsync } =
    useUpdateMessageMutation();
  const deleteMutation = useDeleteMessageMutation();
  const blockMutation = useBlockSenderMutation();
  const unblockMutation = useUnblockSenderMutation();
  const bulkMutation = useBulkActionMutation();
  const { mutateAsync: deleteMessageAsync } = deleteMutation;
  const { mutateAsync: blockAsync } = blockMutation;
  const { mutateAsync: unblockAsync } = unblockMutation;
  const { mutateAsync: bulkAsync } = bulkMutation;

  // ── UI state ────────────────────────────────────────────────────────────
  const [selection, setSelection] = useState<ScopedSelection>({
    ids: NO_IDS,
    scope,
  });
  const [rawFocusedId, setFocusedId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useLocalStorage<InboxViewMode>(
    INBOX_LAYOUT_STORAGE_KEY,
    "grid",
    { initializeWithValue: false }
  );
  const [revealedIds, setRevealedIds] = useState<string[]>(NO_IDS);
  const [modal, setModal] = useState<InboxModalState>(CLOSED_INBOX_MODAL);

  // Derived, never copied: only loaded ids of this view are selected/focused,
  // and the open dialog always shows the freshest copy of its message.
  const selectedIds = useMemo(
    () => visibleSelection(selection, scope, loadedIds),
    [selection, scope, loadedIds]
  );
  const focusedId =
    rawFocusedId && loadedIds.has(rawFocusedId) ? rawFocusedId : null;
  const activeMessage = useMemo(
    () => resolveModalMessage(modal, messages),
    [modal, messages]
  );

  /** Interacting with a message (reply, reveal, share, star) marks it read. */
  const markRead = useCallback(
    (message: MessageDto) => {
      if (!message.isRead) {
        updateMessage({ isRead: true, messageId: String(message._id) });
      }
    },
    [updateMessage]
  );

  // ── Selection ───────────────────────────────────────────────────────────
  const handleToggleSelect = useCallback(
    (messageId: string) => {
      setSelection((prev) => toggleScopedSelection(prev, scope, messageId));
    },
    [scope]
  );
  const handleDeselectAll = useCallback(() => {
    setSelection({ ids: NO_IDS, scope });
  }, [scope]);
  /** Phones' selection bar: select every loaded message in this view. */
  const handleSelectAll = useCallback(() => {
    setSelection({ ids: [...loadedIds], scope });
  }, [loadedIds, scope]);

  // ── Dialogs ─────────────────────────────────────────────────────────────
  const openModal = useCallback((kind: InboxModalKind, message: MessageDto) => {
    setModal({ kind, messageId: String(message._id), snapshot: message });
  }, []);
  // Keep the message id so the dialog animates out with its content.
  const closeModal = useCallback(() => {
    setModal((prev) => ({ ...prev, kind: null }));
  }, []);
  const openBlockModal = useCallback(
    (message: MessageDto) => openModal("block", message),
    [openModal]
  );
  const openDeleteModal = useCallback(
    (message: MessageDto) => openModal("delete", message),
    [openModal]
  );
  const openReplyModal = useCallback(
    (message: MessageDto) => {
      markRead(message);
      openModal("reply", message);
    },
    [openModal, markRead]
  );
  const openStoryModal = useCallback(
    (message: MessageDto) => {
      markRead(message);
      openModal("story", message);
    },
    [openModal, markRead]
  );
  const revealMessage = useCallback(
    (message: MessageDto) => {
      const messageId = String(message._id);
      setRevealedIds((prev) =>
        prev.includes(messageId) ? prev : [...prev, messageId]
      );
      markRead(message);
    },
    [markRead]
  );
  // Quarantined text asks first; a blurred Spicy message just opens.
  const openRevealModal = useCallback(
    (message: MessageDto) => {
      if (message.isQuarantined) {
        openModal("reveal", message);
        return;
      }
      revealMessage(message);
    },
    [openModal, revealMessage]
  );
  const handleRevealConfirm = useCallback(
    (message: MessageDto) => {
      revealMessage(message);
      closeModal();
    },
    [revealMessage, closeModal]
  );

  // ── Message actions ─────────────────────────────────────────────────────
  const handleStarToggle = useCallback(
    async (message: MessageDto) => {
      try {
        await updateMessageAsync({
          isPinned: !message.isPinned,
          messageId: String(message._id),
          ...(message.isRead ? {} : { isRead: true }),
        });
      } catch {
        // Rolled back + toasted by the mutation
      }
    },
    [updateMessageAsync]
  );

  const handleBlockConfirm = useCallback(
    async (senderHash: string, isBlocked: boolean, alsoDelete = false) => {
      try {
        await (isBlocked ? unblockAsync(senderHash) : blockAsync(senderHash));
        closeModal();
        if (alsoDelete && activeMessage) {
          await deleteMessageAsync(String(activeMessage._id));
        }
      } catch {
        // Handled by mutation toast
      }
    },
    [blockAsync, unblockAsync, deleteMessageAsync, activeMessage, closeModal]
  );

  // Single delete confirms first (DeleteMessageModal), then deletes at once.
  // Optimistic: close the dialog and drop the card; the mutation removes it
  // from the cache and rolls back with a toast if the server fails.
  const handleDeleteConfirm = useCallback(
    async (message: MessageDto) => {
      closeModal();
      try {
        await deleteMessageAsync(String(message._id));
      } catch {
        // Rolled back + toasted by the mutation
      }
    },
    [deleteMessageAsync, closeModal]
  );

  // Archive / move back: optimistic, plain toast (no Undo, ADR 0034).
  const { mutate: archiveMessage } = useArchiveMessageMutation();
  const handleToggleArchive = useCallback(
    (message: MessageDto) => {
      archiveMessage({
        isArchived: !message.isArchived,
        messageId: String(message._id),
      });
    },
    [archiveMessage]
  );

  /** Phones' "More actions": Mark as unread / Mark as read. */
  const handleToggleRead = useCallback(
    (message: MessageDto) => {
      updateMessage({
        isRead: !message.isRead,
        messageId: String(message._id),
      });
    },
    [updateMessage]
  );

  // Bulk delete asks first (DeleteSelectedModal), then deletes at once.
  const [bulkDeleteIds, setBulkDeleteIds] = useState<readonly string[] | null>(
    null
  );
  const bulkDeletePublicCount = useMemo(
    () =>
      bulkDeleteIds
        ? messages.filter(
            (message) =>
              bulkDeleteIds.includes(String(message._id)) &&
              message.reply?.isPublished
          ).length
        : 0,
    [bulkDeleteIds, messages]
  );
  const handleBulkDeleteOpenChange = useCallback((isOpen: boolean) => {
    if (!isOpen) {
      setBulkDeleteIds(null);
    }
  }, []);
  /** Quarantined view's "Delete all quarantined": every loaded message here. */
  const handleDeleteAllShown = useCallback(() => {
    setBulkDeleteIds([...loadedIds]);
  }, [loadedIds]);
  const handleConfirmBulkDelete = useCallback(async () => {
    const ids = [...(bulkDeleteIds ?? NO_IDS)];
    setBulkDeleteIds(null);
    setSelection({ ids: NO_IDS, scope });
    try {
      await bulkAsync({ action: "delete", ids });
    } catch {
      // Rolled back + toasted by the mutation
    }
  }, [bulkAsync, bulkDeleteIds, scope]);

  const handleBulkAction = useCallback(
    async (action: BulkAction) => {
      const ids = selectedIds;
      if (action === "delete") {
        setBulkDeleteIds(ids);
        return;
      }
      setSelection({ ids: NO_IDS, scope });
      try {
        await bulkAsync({ action, ids });
      } catch {
        // Rolled back + toasted by the mutation
      }
    },
    [bulkAsync, selectedIds, scope]
  );

  const handleExport = useCallback(
    (format: MessageExportFormat) => {
      const selected = messages.filter((message) =>
        selectedIds.includes(String(message._id))
      );
      downloadTextFile(buildMessagesExport(selected, format));
    },
    [messages, selectedIds]
  );

  return {
    activeMessage,
    activeModal: modal.kind,
    activeStatus: filters.activeStatus,
    bulkDelete: {
      count: bulkDeleteIds?.length ?? 0,
      onConfirm: handleConfirmBulkDelete,
      onOpenChange: handleBulkDeleteOpenChange,
      open: bulkDeleteIds !== null,
      publicAnswerCount: bulkDeletePublicCount,
    },
    closeModal,
    concealSpicy: Boolean(preferencesData?.preferences.safety.blurSpicy),
    counts: data.counts,
    focusedId,
    handleBlockConfirm,
    handleBulkAction,
    handleDeleteAllShown,
    handleDeleteConfirm,
    handleDeselectAll,
    handleExport,
    handleRefresh: data.handleRefresh,
    handleRevealConfirm,
    /** Auto-read after 600ms in view (cards call it via `onSeen`). */
    handleSeen: markRead,
    handleSelectAll,
    handleStarToggle,
    handleToggleArchive,
    handleToggleRead,
    handleToggleSelect,
    isBlockPending: blockMutation.isPending || unblockMutation.isPending,
    isBulkPending: bulkMutation.isPending,
    isDeletePending: deleteMutation.isPending,
    isLoading: data.isLoading,
    isRefreshing: data.isRefreshing,
    isSenderBlocked,
    lastCheckedAt: data.lastCheckedAt,
    messages,
    openBlockModal,
    openDeleteModal,
    openReplyModal,
    openRevealModal,
    openStoryModal,
    pagination: data.pagination,
    publishByDefault: Boolean(
      preferencesData?.preferences.messages.publishByDefault
    ),
    revealedIds,
    searchQuery: filters.searchQuery,
    selectedIds,
    setActiveStatus: filters.setActiveStatus,
    setFocusedId,
    setSearchQuery: filters.setSearchQuery,
    setViewMode,
    totalMessages: data.totalMessages,
    viewMode,
  };
}

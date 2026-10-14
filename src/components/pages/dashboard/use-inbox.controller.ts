"use client";

import { useQuery } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";
import { useLocalStorage } from "usehooks-ts";
import type { BulkAction } from "@/components/patterns/bulk-action-toolbar";
import type { MessageFilterStatus } from "@/components/patterns/filter-bar";
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
  const filters = useInboxFiltersController({ initialStatus, initialQuery });
  const data = useInboxDataController({
    status: filters.activeStatus,
    q: filters.debouncedQuery,
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
    scope,
    ids: NO_IDS,
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
        updateMessage({ messageId: String(message._id), isRead: true });
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
    setSelection({ scope, ids: NO_IDS });
  }, [scope]);

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
          messageId: String(message._id),
          isPinned: !message.isPinned,
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

  // Optimistic: close the dialog and drop the card at once. The mutation
  // removes it from the cache and rolls back with a toast if the server fails.
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

  const handleBulkAction = useCallback(
    async (action: BulkAction) => {
      const ids = selectedIds;
      setSelection({ scope, ids: NO_IDS });
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
    messages,
    counts: data.counts,
    totalMessages: data.totalMessages,
    activeStatus: filters.activeStatus,
    setActiveStatus: filters.setActiveStatus,
    searchQuery: filters.searchQuery,
    setSearchQuery: filters.setSearchQuery,
    selectedIds,
    handleToggleSelect,
    handleDeselectAll,
    viewMode,
    setViewMode,
    activeModal: modal.kind,
    activeMessage,
    openBlockModal,
    openDeleteModal,
    openReplyModal,
    openStoryModal,
    openRevealModal,
    closeModal,
    handleRevealConfirm,
    revealedIds,
    focusedId,
    setFocusedId,
    handleStarToggle,
    handleBlockConfirm,
    handleDeleteConfirm,
    handleBulkAction,
    handleExport,
    handleRefresh: data.handleRefresh,
    pagination: data.pagination,
    concealSpicy: Boolean(preferencesData?.preferences.safety.blurSpicy),
    publishByDefault: Boolean(
      preferencesData?.preferences.messages.publishByDefault
    ),
    isLoading: data.isLoading,
    isRefreshing: data.isRefreshing,
    isBlockPending: blockMutation.isPending || unblockMutation.isPending,
    isDeletePending: deleteMutation.isPending,
    isBulkPending: bulkMutation.isPending,
    isSenderBlocked,
  };
}

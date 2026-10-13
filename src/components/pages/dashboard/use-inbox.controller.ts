"use client";

import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import type { BulkAction } from "@/components/patterns/bulk-action-toolbar";
import type { MessageFilterStatus } from "@/components/patterns/filter-bar";
import { messagesQueries } from "@/data/messages/messages.queries";
import { useBulkActionMutation } from "@/data/messages/use-bulk-action-mutation";
import { useDeleteMessageMutation } from "@/data/messages/use-delete-message-mutation";
import { useLiveMessages } from "@/data/messages/use-live-messages";
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
import { countByStatus, matchesSearch, matchesStatus } from "./inbox.utils";

export type ActiveModalType =
  | "block"
  | "delete"
  | "reply"
  | "reveal"
  | "story"
  | null;

export type InboxViewMode = "grid" | "list";

export interface UseInboxControllerOptions {
  initialMessages?: MessageDto[];
  /** Filter from `/dashboard?filter=…` (command palette shortcuts). */
  initialStatus?: MessageFilterStatus;
  isRefreshing?: boolean;
  onDelete?: (message: MessageDto) => Promise<void>;
  onRefresh?: () => void;
}

/**
 * Headless Inbox controller (ADR 0014): owns the message query, live SSE
 * listener, filters, selection, bulk actions and the single hoisted modal
 * state. The Inbox block renders; this hook decides.
 */
export function useInboxController({
  initialStatus,
  initialMessages,
  isRefreshing: controlledIsRefreshing,
  onDelete,
  onRefresh,
}: UseInboxControllerOptions = {}) {
  const { data: notificationsData } = useQuery(userQueries.notifications());
  useLiveMessages({
    hideMessageText:
      notificationsData?.notificationSettings.hideMessageText ?? true,
  });

  const [activeStatus, setActiveStatus] = useState<MessageFilterStatus>(
    initialStatus ?? "all"
  );
  // Follow ?filter= when it changes while the inbox is already mounted.
  useEffect(() => {
    if (initialStatus) {
      setActiveStatus(initialStatus);
    }
  }, [initialStatus]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<InboxViewMode>("grid");
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [revealedIds, setRevealedIds] = useState<string[]>([]);

  // Centralized modal state. `activeMessage` is intentionally kept after close
  // so dialogs can play their exit animation with content still rendered.
  const [activeModal, setActiveModal] = useState<ActiveModalType>(null);
  const [activeMessage, setActiveMessage] = useState<MessageDto | null>(null);

  const {
    data: messagesResponse,
    isLoading: isQueryLoading,
    isRefetching,
    refetch,
  } = useQuery(messagesQueries.list());

  const { data: blockedSendersData } = useQuery(userQueries.blockedSenders());
  const { data: preferencesData } = useQuery(userQueries.preferences());
  const concealSpicy = Boolean(preferencesData?.preferences.safety.blurSpicy);
  const blockedSenderHashes = useMemo(
    () => new Set(blockedSendersData?.blockedSenderHashes || []),
    [blockedSendersData?.blockedSenderHashes]
  );

  const updateMutation = useUpdateMessageMutation();
  const deleteMutation = useDeleteMessageMutation();
  const blockMutation = useBlockSenderMutation();
  const unblockMutation = useUnblockSenderMutation();
  const bulkMutation = useBulkActionMutation();

  const allMessages: MessageDto[] = useMemo(
    () => initialMessages ?? messagesResponse?.messages ?? [],
    [initialMessages, messagesResponse?.messages]
  );

  const counts = useMemo(() => countByStatus(allMessages), [allMessages]);

  const messages = useMemo(
    () =>
      allMessages.filter(
        (m) => matchesStatus(m, activeStatus) && matchesSearch(m, searchQuery)
      ),
    [allMessages, activeStatus, searchQuery]
  );

  const isSenderBlocked = useCallback(
    (senderHash?: string) =>
      senderHash ? blockedSenderHashes.has(senderHash) : false,
    [blockedSenderHashes]
  );

  // Refresh
  const handleRefresh = useCallback(async () => {
    if (onRefresh) {
      onRefresh();
      return;
    }
    const result = await refetch();
    if (result.isError) {
      toast.error(result.error?.message || "Failed to fetch messages");
      return;
    }
    toast.success("Messages refreshed successfully");
  }, [onRefresh, refetch]);

  // Selection
  const handleToggleSelect = useCallback((messageId: string) => {
    setSelectedIds((prev) =>
      prev.includes(messageId)
        ? prev.filter((id) => id !== messageId)
        : [...prev, messageId]
    );
  }, []);

  const handleDeselectAll = useCallback(() => {
    setSelectedIds([]);
  }, []);

  // Modal triggers — stable references so memoized cards don't re-render.
  const openModal = useCallback(
    (type: Exclude<ActiveModalType, null>, message: MessageDto) => {
      setActiveMessage(message);
      setActiveModal(type);
    },
    []
  );
  const openBlockModal = useCallback(
    (message: MessageDto) => openModal("block", message),
    [openModal]
  );
  const openDeleteModal = useCallback(
    (message: MessageDto) => openModal("delete", message),
    [openModal]
  );
  const openReplyModal = useCallback(
    (message: MessageDto) => openModal("reply", message),
    [openModal]
  );
  const openStoryModal = useCallback(
    (message: MessageDto) => openModal("story", message),
    [openModal]
  );
  // Quarantined text asks first; a blurred Spicy message just opens.
  const openRevealModal = useCallback(
    (message: MessageDto) => {
      if (message.isQuarantined) {
        openModal("reveal", message);
        return;
      }
      const messageId = String(message._id);
      setRevealedIds((prev) =>
        prev.includes(messageId) ? prev : [...prev, messageId]
      );
    },
    [openModal]
  );
  const closeModal = useCallback(() => {
    setActiveModal(null);
  }, []);

  // Inline actions
  const handleStarToggle = useCallback(
    async (message: MessageDto) => {
      try {
        await updateMutation.mutateAsync({
          messageId: String(message._id),
          isPinned: !message.isPinned,
        });
      } catch {
        // Handled by mutation toast
      }
    },
    [updateMutation]
  );

  const handleRevealConfirm = useCallback(
    (message: MessageDto) => {
      const messageId = String(message._id);
      setRevealedIds((prev) =>
        prev.includes(messageId) ? prev : [...prev, messageId]
      );
      closeModal();
    },
    [closeModal]
  );

  const handleBlockConfirm = useCallback(
    async (senderHash: string, isBlocked: boolean, alsoDelete = false) => {
      try {
        if (isBlocked) {
          await unblockMutation.mutateAsync(senderHash);
        } else {
          await blockMutation.mutateAsync(senderHash);
        }
        closeModal();
        if (alsoDelete && activeMessage) {
          await deleteMutation.mutateAsync(String(activeMessage._id));
        }
      } catch {
        // Handled by mutation toast
      }
    },
    [blockMutation, unblockMutation, deleteMutation, activeMessage, closeModal]
  );

  // Optimistic: close the dialog and drop the card at once. The mutation
  // removes it from the cache and rolls back with a toast if the server fails.
  const handleDeleteConfirm = useCallback(
    async (message: MessageDto) => {
      const messageId = String(message._id);
      closeModal();
      setSelectedIds((prev) => prev.filter((id) => id !== messageId));
      try {
        if (onDelete) {
          await onDelete(message);
        } else {
          await deleteMutation.mutateAsync(messageId);
        }
      } catch {
        // Rolled back + toasted by the mutation
      }
    },
    [onDelete, deleteMutation, closeModal]
  );

  // Bulk actions
  const handleBulkAction = useCallback(
    async (action: BulkAction) => {
      const ids = selectedIds;
      setSelectedIds([]);
      try {
        await bulkMutation.mutateAsync({ action, ids });
      } catch {
        // Rolled back + toasted by the mutation
      }
    },
    [bulkMutation, selectedIds]
  );

  const handleExport = useCallback(
    (format: MessageExportFormat) => {
      const selected = allMessages.filter((m) =>
        selectedIds.includes(String(m._id))
      );
      downloadTextFile(buildMessagesExport(selected, format));
    },
    [allMessages, selectedIds]
  );

  return {
    messages,
    allMessages,
    counts,
    activeStatus,
    setActiveStatus,
    searchQuery,
    setSearchQuery,
    selectedIds,
    handleToggleSelect,
    handleDeselectAll,
    viewMode,
    setViewMode,
    activeModal,
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
    handleRefresh,
    concealSpicy,
    publishByDefault: Boolean(
      preferencesData?.preferences.messages.publishByDefault
    ),
    isLoading: !initialMessages && isQueryLoading,
    isRefreshing: controlledIsRefreshing ?? isRefetching,
    isBlockPending: blockMutation.isPending || unblockMutation.isPending,
    isDeletePending: deleteMutation.isPending,
    isBulkPending: bulkMutation.isPending,
    isSenderBlocked,
  };
}

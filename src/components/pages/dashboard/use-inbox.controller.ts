"use client";

import { useQuery } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import type { BulkAction } from "@/components/patterns/bulk-action-toolbar";
import type {
  MessageFilterCounts,
  MessageFilterStatus,
} from "@/components/patterns/filter-bar";
import {
  useBlockSenderMutation,
  useUnblockSenderMutation,
} from "@/hooks/mutations/use-block-sender-mutation";
import { useBulkActionMutation } from "@/hooks/mutations/use-bulk-action-mutation";
import { useDeleteMessageMutation } from "@/hooks/mutations/use-delete-message-mutation";
import { useUpdateMessageMutation } from "@/hooks/mutations/use-update-message-mutation";
import { useLiveMessages } from "@/hooks/use-live-messages";
import {
  downloadMessages,
  type MessageExportFormat,
} from "@/lib/export-messages";
import type { Message } from "@/model/user.model";
import { messagesQueries } from "@/queries/messages.queries";
import { userQueries } from "@/queries/user.queries";

export type ActiveModalType = "block" | "delete" | "reply" | "story" | null;

export type InboxViewMode = "grid" | "list";

export interface UseInboxControllerOptions {
  initialMessages?: Message[];
  isRefreshing?: boolean;
  onDelete?: (message: Message) => Promise<void>;
  onRefresh?: () => void;
}

const hasReplyText = (message: Message): boolean =>
  Boolean(message.reply?.text && message.reply.text.trim().length > 0);

export function matchesStatus(
  message: Message,
  status: MessageFilterStatus
): boolean {
  switch (status) {
    case "unread":
      return !(message.isQuarantined || message.isRead);
    case "starred":
      return Boolean(message.isPinned);
    case "quarantined":
      return Boolean(message.isQuarantined);
    case "answered":
      return hasReplyText(message);
    default:
      return !message.isQuarantined;
  }
}

export function matchesSearch(message: Message, query: string): boolean {
  if (!query.trim()) {
    return true;
  }
  const q = query.toLowerCase();
  const contentMatch = message.content.toLowerCase().includes(q);
  const replyMatch = Boolean(message.reply?.text?.toLowerCase().includes(q));
  return contentMatch || replyMatch;
}

export function countByStatus(messages: Message[]): MessageFilterCounts {
  return {
    all: messages.filter((m) => matchesStatus(m, "all")).length,
    unread: messages.filter((m) => matchesStatus(m, "unread")).length,
    starred: messages.filter((m) => matchesStatus(m, "starred")).length,
    quarantined: messages.filter((m) => matchesStatus(m, "quarantined")).length,
    answered: messages.filter((m) => matchesStatus(m, "answered")).length,
  };
}

/**
 * Headless Inbox controller (ADR 0014): owns the message query, live SSE
 * listener, filters, selection, bulk actions and the single hoisted modal
 * state. The Inbox block renders; this hook decides.
 */
export function useInboxController({
  initialMessages,
  isRefreshing: controlledIsRefreshing,
  onDelete,
  onRefresh,
}: UseInboxControllerOptions = {}) {
  useLiveMessages();

  const [activeStatus, setActiveStatus] = useState<MessageFilterStatus>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<InboxViewMode>("grid");

  // Centralized modal state. `activeMessage` is intentionally kept after close
  // so dialogs can play their exit animation with content still rendered.
  const [activeModal, setActiveModal] = useState<ActiveModalType>(null);
  const [activeMessage, setActiveMessage] = useState<Message | null>(null);

  const {
    data: messagesResponse,
    isRefetching,
    refetch,
  } = useQuery(messagesQueries.list());

  const { data: blockedSendersData } = useQuery(userQueries.blockedSenders());
  const blockedSenderHashes = useMemo(
    () => new Set(blockedSendersData?.blockedSenderHashes || []),
    [blockedSendersData?.blockedSenderHashes]
  );

  const updateMutation = useUpdateMessageMutation();
  const deleteMutation = useDeleteMessageMutation();
  const blockMutation = useBlockSenderMutation();
  const unblockMutation = useUnblockSenderMutation();
  const bulkMutation = useBulkActionMutation();

  const allMessages: Message[] = useMemo(
    () =>
      initialMessages ??
      ((messagesResponse?.messages || []) as unknown as Message[]),
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
    (type: Exclude<ActiveModalType, null>, message: Message) => {
      setActiveMessage(message);
      setActiveModal(type);
    },
    []
  );
  const openBlockModal = useCallback(
    (message: Message) => openModal("block", message),
    [openModal]
  );
  const openDeleteModal = useCallback(
    (message: Message) => openModal("delete", message),
    [openModal]
  );
  const openReplyModal = useCallback(
    (message: Message) => openModal("reply", message),
    [openModal]
  );
  const openStoryModal = useCallback(
    (message: Message) => openModal("story", message),
    [openModal]
  );
  const closeModal = useCallback(() => {
    setActiveModal(null);
  }, []);

  // Inline actions
  const handleStarToggle = useCallback(
    async (message: Message) => {
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

  const handleBlockConfirm = useCallback(
    async (senderHash: string, isBlocked: boolean) => {
      try {
        if (isBlocked) {
          await unblockMutation.mutateAsync(senderHash);
        } else {
          await blockMutation.mutateAsync(senderHash);
        }
        closeModal();
      } catch {
        // Handled by mutation toast
      }
    },
    [blockMutation, unblockMutation, closeModal]
  );

  const handleDeleteConfirm = useCallback(
    async (message: Message) => {
      try {
        if (onDelete) {
          await onDelete(message);
        } else {
          await deleteMutation.mutateAsync(String(message._id));
        }
        closeModal();
      } catch {
        // Handled by mutation toast
      }
    },
    [onDelete, deleteMutation, closeModal]
  );

  // Bulk actions
  const handleBulkAction = useCallback(
    async (action: BulkAction) => {
      try {
        await bulkMutation.mutateAsync({ action, ids: selectedIds });
        setSelectedIds([]);
      } catch {
        // Handled by mutation toast
      }
    },
    [bulkMutation, selectedIds]
  );

  const handleExport = useCallback(
    (format: MessageExportFormat) => {
      const selected = allMessages.filter((m) =>
        selectedIds.includes(String(m._id))
      );
      downloadMessages(selected, format);
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
    closeModal,
    handleStarToggle,
    handleBlockConfirm,
    handleDeleteConfirm,
    handleBulkAction,
    handleExport,
    handleRefresh,
    isRefreshing: controlledIsRefreshing ?? isRefetching,
    isBlockPending: blockMutation.isPending || unblockMutation.isPending,
    isDeletePending: deleteMutation.isPending,
    isBulkPending: bulkMutation.isPending,
    isSenderBlocked,
  };
}

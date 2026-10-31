"use client";

import type React from "react";
import { useCallback, useMemo } from "react";
import { INBOX_SEARCH_INPUT_ID, Inbox } from "@/components/blocks/inbox";
import type { MessageFilterStatus } from "@/components/patterns/filter-bar";
import {
  BlockSenderModal,
  DeleteMessageModal,
  DeleteSelectedModal,
  RevealMessageModal,
  SmartReplyModal,
  StoryCardModal,
} from "@/components/patterns/modals";
import {
  type UseInboxControllerOptions,
  useInboxController,
} from "./use-inbox.controller";
import { useInboxKeyboardController } from "./use-inbox-keyboard.controller";
import { useProfileLinkController } from "./use-profile-link.controller";
import { useSmartReplyController } from "./use-smart-reply.controller";

export interface InboxPageProps extends UseInboxControllerOptions {
  /** `?filter=` from the URL, already validated by the route. */
  initialStatus?: MessageFilterStatus;
}

/**
 * /dashboard: wires the inbox, smart-reply, keyboard and link controllers
 * into the pure Inbox block and mounts the single hoisted modal set (ADR 0014).
 */
export function InboxPage(props: InboxPageProps = {}): React.JSX.Element {
  const link = useProfileLinkController();
  const inbox = useInboxController(props);
  const smartReply = useSmartReplyController({
    isOpen: inbox.activeModal === "reply",
    message: inbox.activeMessage,
    onSaved: inbox.closeModal,
    publishByDefault: inbox.publishByDefault,
  });

  useInboxKeyboardController({
    focusedId: inbox.focusedId,
    messages: inbox.messages,
    onArchive: inbox.handleToggleArchive,
    onBlock: inbox.openBlockModal,
    onClearSelection: inbox.handleDeselectAll,
    onDelete: inbox.openDeleteModal,
    onOpenReply: inbox.openReplyModal,
    onStarToggle: inbox.handleStarToggle,
    onToggleSelect: inbox.handleToggleSelect,
    searchInputId: INBOX_SEARCH_INPUT_ID,
    selectedIds: inbox.selectedIds,
    setFocusedId: inbox.setFocusedId,
  });

  const filters = useMemo(
    () => ({
      activeStatus: inbox.activeStatus,
      counts: inbox.counts,
      onSearchChange: inbox.setSearchQuery,
      onStatusChange: inbox.setActiveStatus,
      searchQuery: inbox.searchQuery,
    }),
    [
      inbox.activeStatus,
      inbox.counts,
      inbox.setSearchQuery,
      inbox.setActiveStatus,
      inbox.searchQuery,
    ]
  );

  const cardActions = useMemo(
    () => ({
      onOpenBlock: inbox.openBlockModal,
      onOpenDelete: inbox.openDeleteModal,
      onOpenReply: inbox.openReplyModal,
      onOpenStoryCard: inbox.openStoryModal,
      onReveal: inbox.openRevealModal,
      onSeen: inbox.handleSeen,
      onStarToggle: inbox.handleStarToggle,
      onToggleArchive: inbox.handleToggleArchive,
      onToggleRead: inbox.handleToggleRead,
    }),
    [
      inbox.openBlockModal,
      inbox.openDeleteModal,
      inbox.openReplyModal,
      inbox.openStoryModal,
      inbox.openRevealModal,
      inbox.handleSeen,
      inbox.handleStarToggle,
      inbox.handleToggleArchive,
      inbox.handleToggleRead,
    ]
  );

  // "Answer + Story Card": save, then open the export with the new answer.
  const { activeMessage, openStoryModal } = inbox;
  const { handleSave, replyText, isPublished } = smartReply;
  const handleSaveAndShare = useCallback(async () => {
    const saved = await handleSave();
    if (saved && activeMessage) {
      openStoryModal({
        ...activeMessage,
        reply: { ...activeMessage.reply, isPublished, text: replyText.trim() },
      });
    }
  }, [handleSave, activeMessage, openStoryModal, replyText, isPublished]);

  return (
    <>
      <Inbox
        bulkActions={{
          isPending: inbox.isBulkPending,
          onAction: inbox.handleBulkAction,
          onDeleteAll: inbox.handleDeleteAllShown,
          onExport: inbox.handleExport,
        }}
        cardActions={cardActions}
        concealSpicy={inbox.concealSpicy}
        filters={filters}
        focusedId={inbox.focusedId}
        isLoading={inbox.isLoading}
        isRefreshing={inbox.isRefreshing}
        isSenderBlocked={inbox.isSenderBlocked}
        lastCheckedAt={inbox.lastCheckedAt}
        messages={inbox.messages}
        onCopyLink={link.handleCopy}
        onRefresh={inbox.handleRefresh}
        onViewModeChange={inbox.setViewMode}
        pagination={inbox.pagination}
        revealedIds={inbox.revealedIds}
        searchInputId={INBOX_SEARCH_INPUT_ID}
        selection={{
          onClear: inbox.handleDeselectAll,
          onSelectAll: inbox.handleSelectAll,
          onToggle: inbox.handleToggleSelect,
          selectedIds: inbox.selectedIds,
        }}
        totalMessages={inbox.totalMessages}
        viewMode={inbox.viewMode}
      />

      <BlockSenderModal
        isPending={inbox.isBlockPending}
        isSenderBlocked={inbox.isSenderBlocked(inbox.activeMessage?.senderHash)}
        message={inbox.activeMessage}
        onClose={inbox.closeModal}
        onConfirm={inbox.handleBlockConfirm}
        open={inbox.activeModal === "block"}
      />

      <DeleteMessageModal
        isPending={inbox.isDeletePending}
        message={inbox.activeMessage}
        onClose={inbox.closeModal}
        onConfirm={inbox.handleDeleteConfirm}
        open={inbox.activeModal === "delete"}
      />

      <DeleteSelectedModal {...inbox.bulkDelete} />

      <RevealMessageModal
        message={inbox.activeMessage}
        onClose={inbox.closeModal}
        onConfirm={inbox.handleRevealConfirm}
        open={inbox.activeModal === "reveal"}
      />

      <SmartReplyModal
        drafts={smartReply.drafts}
        hasDraftsError={smartReply.hasDraftsError}
        isGenerating={smartReply.isGenerating}
        isOpen={inbox.activeModal === "reply"}
        isPublished={smartReply.isPublished}
        isSaving={smartReply.isSaving}
        message={inbox.activeMessage}
        onClose={inbox.closeModal}
        onPickDraft={smartReply.handlePickDraft}
        onPublishedChange={smartReply.setIsPublished}
        onReplyTextChange={smartReply.setReplyText}
        onRetryDrafts={smartReply.handleRetryDrafts}
        onSave={smartReply.handleSave}
        onSaveAndShare={handleSaveAndShare}
        replyText={smartReply.replyText}
      />

      <StoryCardModal
        isOpen={inbox.activeModal === "story"}
        message={inbox.activeMessage}
        onClose={inbox.closeModal}
        onCopyLink={link.handleCopy}
        profileLabel={link.profileLabel}
        username={link.username || "user"}
      />
    </>
  );
}

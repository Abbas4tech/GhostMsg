"use client";

import type React from "react";
import { useCallback, useMemo } from "react";
import { INBOX_SEARCH_INPUT_ID, Inbox } from "@/components/blocks/inbox";
import type { MessageFilterStatus } from "@/components/patterns/filter-bar";
import {
  BlockSenderModal,
  DeleteMessageModal,
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
    onOpenReply: inbox.openReplyModal,
    onStarToggle: inbox.handleStarToggle,
    onToggleSelect: inbox.handleToggleSelect,
    searchInputId: INBOX_SEARCH_INPUT_ID,
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
      onStarToggle: inbox.handleStarToggle,
    }),
    [
      inbox.openBlockModal,
      inbox.openDeleteModal,
      inbox.openReplyModal,
      inbox.openStoryModal,
      inbox.openRevealModal,
      inbox.handleStarToggle,
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
          onExport: inbox.handleExport,
        }}
        cardActions={cardActions}
        concealSpicy={inbox.concealSpicy}
        filters={filters}
        focusedId={inbox.focusedId}
        isLoading={inbox.isLoading}
        isRefreshing={inbox.isRefreshing}
        isSenderBlocked={inbox.isSenderBlocked}
        messages={inbox.messages}
        onCopyLink={link.handleCopy}
        onRefresh={inbox.handleRefresh}
        onViewModeChange={inbox.setViewMode}
        pagination={inbox.pagination}
        revealedIds={inbox.revealedIds}
        searchInputId={INBOX_SEARCH_INPUT_ID}
        selection={{
          onClear: inbox.handleDeselectAll,
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

      <RevealMessageModal
        message={inbox.activeMessage}
        onClose={inbox.closeModal}
        onConfirm={inbox.handleRevealConfirm}
        open={inbox.activeModal === "reveal"}
      />

      <SmartReplyModal
        isGenerating={smartReply.isGenerating}
        isOpen={inbox.activeModal === "reply"}
        isPublished={smartReply.isPublished}
        isSaving={smartReply.isSaving}
        message={inbox.activeMessage}
        onClose={inbox.closeModal}
        onGenerate={smartReply.handleGenerate}
        onPublishedChange={smartReply.setIsPublished}
        onReplyTextChange={smartReply.setReplyText}
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

export default InboxPage;

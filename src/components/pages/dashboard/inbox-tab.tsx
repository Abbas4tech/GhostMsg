"use client";

import { useSession } from "next-auth/react";
import type React from "react";
import { useMemo } from "react";
import { Inbox } from "@/components/blocks/inbox";
import {
  BlockSenderModal,
  DeleteMessageModal,
  SmartReplyModal,
  StoryCardModal,
} from "@/components/patterns/modals";
import {
  type UseInboxControllerOptions,
  useInboxController,
} from "./use-inbox.controller";
import { useSmartReplyController } from "./use-smart-reply.controller";

export type InboxTabProps = UseInboxControllerOptions;

/**
 * Messages tab: wires the inbox + smart-reply controllers into the pure Inbox
 * block and mounts the single hoisted modal set (ADR 0014).
 */
export function InboxTab(props: InboxTabProps = {}): React.JSX.Element {
  const { data: session } = useSession();
  const username = session?.user?.username || "user";

  const inbox = useInboxController(props);
  const smartReply = useSmartReplyController({
    isOpen: inbox.activeModal === "reply",
    message: inbox.activeMessage,
    onSaved: inbox.closeModal,
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
      onStarToggle: inbox.handleStarToggle,
    }),
    [
      inbox.openBlockModal,
      inbox.openDeleteModal,
      inbox.openReplyModal,
      inbox.openStoryModal,
      inbox.handleStarToggle,
    ]
  );

  return (
    <>
      <Inbox
        bulkActions={{
          isPending: inbox.isBulkPending,
          onAction: inbox.handleBulkAction,
          onExport: inbox.handleExport,
        }}
        cardActions={cardActions}
        filters={filters}
        isRefreshing={inbox.isRefreshing}
        isSenderBlocked={inbox.isSenderBlocked}
        messages={inbox.messages}
        onRefresh={inbox.handleRefresh}
        onViewModeChange={inbox.setViewMode}
        selection={{
          selectedIds: inbox.selectedIds,
          onToggle: inbox.handleToggleSelect,
          onClear: inbox.handleDeselectAll,
        }}
        totalMessages={inbox.allMessages.length}
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
        replyText={smartReply.replyText}
      />

      <StoryCardModal
        isOpen={inbox.activeModal === "story"}
        message={inbox.activeMessage}
        onClose={inbox.closeModal}
        username={username}
      />
    </>
  );
}

export default InboxTab;

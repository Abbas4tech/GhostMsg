import {
  answeredSpicyMessage,
  quarantinedMessage,
  smartReplyDrafts,
  sweetMessage,
} from "@/mock/fixtures/messages.fixtures";
import { FIXTURE_USERNAME } from "@/mock/fixtures/public-profile.fixtures";
import { noop } from "@/mock/noop";
import type { BlockSenderModalProps } from "./block-sender-modal";
import type { ChangeUsernameModalProps } from "./change-username-modal";
import type { DeleteAccountModalProps } from "./delete-account-modal";
import type { DeleteAllMessagesModalProps } from "./delete-all-messages-modal";
import type { DeleteMessageModalProps } from "./delete-message-modal";
import type { DeleteSelectedModalProps } from "./delete-selected-modal";
import type { DiscardChangesModalProps } from "./discard-changes-modal";
import type { RevealMessageModalProps } from "./reveal-message-modal";
import type { SmartReplyModalProps } from "./smart-reply-modal";
import type { StoryCardModalProps } from "./story-card-modal";

export const defaultBlockSenderModalArgs: BlockSenderModalProps = {
  isPending: false,
  isSenderBlocked: false,
  message: sweetMessage,
  onClose: noop,
  onConfirm: noop,
  open: true,
};

export const defaultDeleteMessageModalArgs: DeleteMessageModalProps = {
  isPending: false,
  message: sweetMessage,
  onClose: noop,
  onConfirm: noop,
  open: true,
};

export const defaultDeleteSelectedModalArgs: DeleteSelectedModalProps = {
  count: 2,
  onConfirm: noop,
  onOpenChange: noop,
  open: true,
  publicAnswerCount: 1,
};

export const defaultSmartReplyModalArgs: SmartReplyModalProps = {
  drafts: smartReplyDrafts,
  hasDraftsError: false,
  isGenerating: false,
  isOpen: true,
  isPublished: true,
  isSaving: false,
  message: sweetMessage,
  onClose: noop,
  onPickDraft: noop,
  onPublishedChange: noop,
  onReplyTextChange: noop,
  onRetryDrafts: noop,
  onSave: noop,
  onSaveAndShare: noop,
  replyText: "",
};

export const editingSmartReplyModalArgs = {
  message: answeredSpicyMessage,
  replyText: answeredSpicyMessage.reply?.text ?? "",
} satisfies Partial<SmartReplyModalProps>;

export const defaultStoryCardModalArgs: StoryCardModalProps = {
  isOpen: true,
  message: answeredSpicyMessage,
  onClose: noop,
  username: FIXTURE_USERNAME,
};

export const defaultRevealMessageModalArgs: RevealMessageModalProps = {
  message: quarantinedMessage,
  onClose: noop,
  onConfirm: noop,
  open: true,
};

export const defaultChangeUsernameModalArgs: ChangeUsernameModalProps = {
  availability: "available",
  isSaving: false,
  linkPrefix: "ghostmsg.app/u/",
  onOpenChange: noop,
  onSubmit: noop,
  onValueChange: noop,
  open: true,
  value: "maya_writes",
};

export const defaultDeleteAllMessagesModalArgs: DeleteAllMessagesModalProps = {
  onConfirm: noop,
  onOpenChange: noop,
  open: true,
  total: 6,
};

export const defaultDeleteAccountModalArgs: DeleteAccountModalProps = {
  confirmValue: "",
  isPending: false,
  onConfirm: noop,
  onConfirmValueChange: noop,
  onOpenChange: noop,
  open: true,
  username: FIXTURE_USERNAME,
};

export const defaultDiscardChangesModalArgs: DiscardChangesModalProps = {
  onDiscard: noop,
  onKeepEditing: noop,
  open: true,
};

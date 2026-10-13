import {
  answeredSpicyMessage,
  quarantinedMessage,
  sweetMessage,
} from "@/mock/fixtures/messages.fixtures";
import { FIXTURE_USERNAME } from "@/mock/fixtures/public-profile.fixtures";
import { noop } from "@/mock/noop";
import type { BlockSenderModalProps } from "./block-sender-modal";
import type { ChangeUsernameModalProps } from "./change-username-modal";
import type { DeleteAccountModalProps } from "./delete-account-modal";
import type { DeleteAllMessagesModalProps } from "./delete-all-messages-modal";
import type { DeleteMessageModalProps } from "./delete-message-modal";
import type { RevealMessageModalProps } from "./reveal-message-modal";
import type { SmartReplyModalProps } from "./smart-reply-modal";
import type { StoryCardModalProps } from "./story-card-modal";

export const defaultBlockSenderModalArgs: BlockSenderModalProps = {
  open: true,
  message: sweetMessage,
  isSenderBlocked: false,
  isPending: false,
  onClose: noop,
  onConfirm: noop,
};

export const defaultDeleteMessageModalArgs: DeleteMessageModalProps = {
  open: true,
  message: sweetMessage,
  isPending: false,
  onClose: noop,
  onConfirm: noop,
};

export const defaultSmartReplyModalArgs: SmartReplyModalProps = {
  isOpen: true,
  message: sweetMessage,
  replyText: "",
  isPublished: true,
  isGenerating: false,
  isSaving: false,
  onClose: noop,
  onGenerate: noop,
  onPublishedChange: noop,
  onReplyTextChange: noop,
  onSave: noop,
  onSaveAndShare: noop,
};

export const editingSmartReplyModalArgs = {
  message: answeredSpicyMessage,
  replyText: answeredSpicyMessage.reply?.text ?? "",
} satisfies Partial<SmartReplyModalProps>;

export const defaultStoryCardModalArgs: StoryCardModalProps = {
  isOpen: true,
  message: answeredSpicyMessage,
  username: FIXTURE_USERNAME,
  onClose: noop,
};

export const defaultRevealMessageModalArgs: RevealMessageModalProps = {
  open: true,
  message: quarantinedMessage,
  onClose: noop,
  onConfirm: noop,
};

export const defaultChangeUsernameModalArgs: ChangeUsernameModalProps = {
  open: true,
  value: "maya_writes",
  availability: "available",
  linkPrefix: "ghostmsg.app/u/",
  isSaving: false,
  onOpenChange: noop,
  onSubmit: noop,
  onValueChange: noop,
};

export const defaultDeleteAllMessagesModalArgs: DeleteAllMessagesModalProps = {
  open: true,
  total: 6,
  onConfirm: noop,
  onOpenChange: noop,
};

export const defaultDeleteAccountModalArgs: DeleteAccountModalProps = {
  open: true,
  username: FIXTURE_USERNAME,
  confirmValue: "",
  isPending: false,
  onConfirm: noop,
  onConfirmValueChange: noop,
  onOpenChange: noop,
};

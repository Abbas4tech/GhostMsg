import {
  answeredSpicyMessage,
  sweetMessage,
} from "@/mock/fixtures/messages.fixtures";
import { FIXTURE_USERNAME } from "@/mock/fixtures/public-profile.fixtures";
import { noop } from "@/mock/noop";
import type { BlockSenderModalProps } from "./block-sender-modal";
import type { DeleteMessageModalProps } from "./delete-message-modal";
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

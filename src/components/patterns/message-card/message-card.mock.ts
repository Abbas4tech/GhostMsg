import {
  answeredSpicyMessage,
  longContentMessage,
  noSenderHashMessage,
  privateReplyAdviceMessage,
  quarantinedMessage,
  sweetMessage,
} from "@/mock/fixtures/messages.fixtures";
import { noop } from "@/mock/noop";
import type { MessageCardProps } from "./message-card";

/** Every interactive callback stubbed — stories replace them with `fn()`. */
export const messageCardCallbacks = {
  onToggleSelect: noop,
  onStarToggle: noop,
  onOpenReply: noop,
  onOpenStoryCard: noop,
  onOpenBlock: noop,
  onOpenDelete: noop,
} satisfies Partial<MessageCardProps>;

export const defaultMessageCardArgs: MessageCardProps = {
  message: sweetMessage,
  isSelected: false,
  isSenderBlocked: false,
  ...messageCardCallbacks,
};

export const answeredMessageCardArgs = {
  message: answeredSpicyMessage,
} satisfies Partial<MessageCardProps>;

export const privateReplyMessageCardArgs = {
  message: privateReplyAdviceMessage,
} satisfies Partial<MessageCardProps>;

export const quarantinedMessageCardArgs = {
  message: quarantinedMessage,
} satisfies Partial<MessageCardProps>;

export const blockedSenderMessageCardArgs = {
  isSenderBlocked: true,
} satisfies Partial<MessageCardProps>;

export const noSenderHashMessageCardArgs = {
  message: noSenderHashMessage,
} satisfies Partial<MessageCardProps>;

export const longContentMessageCardArgs = {
  message: longContentMessage,
} satisfies Partial<MessageCardProps>;

import {
  answeredSpicyMessage,
  fixtureDate,
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
  onOpenBlock: noop,
  onOpenDelete: noop,
  onOpenReply: noop,
  onOpenStoryCard: noop,
  onReveal: noop,
  onStarToggle: noop,
  onToggleSelect: noop,
} satisfies Partial<MessageCardProps>;

/** Fixed "now" two minutes after the base fixture date, so ages are stable. */
export const MESSAGE_CARD_NOW = new Date(
  new Date(fixtureDate()).getTime() + 2 * 60 * 1000
);

export const defaultMessageCardArgs: MessageCardProps = {
  isFocused: false,
  isRevealed: false,
  isSelected: false,
  isSenderBlocked: false,
  layout: "grid",
  message: sweetMessage,
  now: MESSAGE_CARD_NOW,
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

export const revealedQuarantinedMessageCardArgs = {
  isRevealed: true,
  message: quarantinedMessage,
} satisfies Partial<MessageCardProps>;

export const listMessageCardArgs = {
  layout: "list",
} satisfies Partial<MessageCardProps>;

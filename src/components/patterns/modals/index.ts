// Heavy, rarely opened modals are lazy-loaded by pages/dashboard/lazy-overlays
// through deep imports. Only their types are exported here, so this barrel
// never pulls them back into the main chunk (ADR 0035, M7).
export type { BlockSenderModalProps } from "./block-sender-modal";
export {
  ChangeUsernameModal,
  type ChangeUsernameModalProps,
} from "./change-username-modal";
export {
  DeleteAccountModal,
  type DeleteAccountModalProps,
} from "./delete-account-modal";
export {
  DeleteAllMessagesModal,
  type DeleteAllMessagesModalProps,
} from "./delete-all-messages-modal";
export {
  DeleteMessageModal,
  type DeleteMessageModalProps,
} from "./delete-message-modal";
export {
  DeleteSelectedModal,
  type DeleteSelectedModalProps,
} from "./delete-selected-modal";
export {
  DiscardChangesModal,
  type DiscardChangesModalProps,
} from "./discard-changes-modal";
export type { RevealMessageModalProps } from "./reveal-message-modal";
export type { SmartReplyModalProps } from "./smart-reply-modal";
export type { StoryCardModalProps } from "./story-card-modal";

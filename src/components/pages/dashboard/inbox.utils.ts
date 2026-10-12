import type {
  MessageFilterCounts,
  MessageFilterStatus,
} from "@/components/patterns/filter-bar";
import type { MessageDto } from "@/types/api";

/** Inbox filtering and counting rules (pure; used by `useInboxController`). */

export const hasReplyText = (message: MessageDto): boolean =>
  Boolean(message.reply?.text && message.reply.text.trim().length > 0);

export function matchesStatus(
  message: MessageDto,
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

export function matchesSearch(message: MessageDto, query: string): boolean {
  if (!query.trim()) {
    return true;
  }
  const q = query.toLowerCase();
  const contentMatch = message.content.toLowerCase().includes(q);
  const replyMatch = Boolean(message.reply?.text?.toLowerCase().includes(q));
  return contentMatch || replyMatch;
}

export function countByStatus(messages: MessageDto[]): MessageFilterCounts {
  return {
    all: messages.filter((m) => matchesStatus(m, "all")).length,
    unread: messages.filter((m) => matchesStatus(m, "unread")).length,
    starred: messages.filter((m) => matchesStatus(m, "starred")).length,
    quarantined: messages.filter((m) => matchesStatus(m, "quarantined")).length,
    answered: messages.filter((m) => matchesStatus(m, "answered")).length,
  };
}

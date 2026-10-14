import {
  fixtureDate,
  type MessageFixture,
  messageScenarios,
  mixedMessageCounts,
} from "@/mock/fixtures/messages.fixtures";
import { noop } from "@/mock/noop";
import type { InboxProps } from "./inbox";

const visible = (messages: MessageFixture[]) =>
  messages.filter((message) => !message.isQuarantined);

export const defaultInboxArgs: InboxProps = {
  messages: visible(messageScenarios.mixed),
  totalMessages: messageScenarios.mixed.length,
  filters: {
    activeStatus: "all",
    counts: mixedMessageCounts,
    searchQuery: "",
    onSearchChange: noop,
    onStatusChange: noop,
  },
  selection: { selectedIds: [], onToggle: noop, onClear: noop },
  bulkActions: { isPending: false, onAction: noop, onExport: noop },
  cardActions: {
    onOpenBlock: noop,
    onOpenDelete: noop,
    onOpenReply: noop,
    onOpenStoryCard: noop,
    onReveal: noop,
    onStarToggle: noop,
  },
  viewMode: "grid",
  isRefreshing: false,
  onViewModeChange: noop,
  onRefresh: noop,
  isSenderBlocked: (hash?: string) => hash === "hash-sender-2",
  isLoading: false,
  focusedId: null,
  revealedIds: [],
  onCopyLink: noop,
  /** Three hours after the newest fixture, so ages render as 3h, 6h, 1d… */
  now: new Date(new Date(fixtureDate()).getTime() + 3 * 60 * 60 * 1000),
};

export const loadingInboxArgs = {
  isLoading: true,
  messages: [],
} satisfies Partial<InboxProps>;

export const emptyInboxArgs = {
  messages: [],
  totalMessages: 0,
} satisfies Partial<InboxProps>;

export const noMatchesInboxArgs = {
  messages: [],
  totalMessages: messageScenarios.mixed.length,
} satisfies Partial<InboxProps>;

export const quarantinedInboxArgs = {
  messages: messageScenarios.allQuarantined,
  totalMessages: messageScenarios.allQuarantined.length,
} satisfies Partial<InboxProps>;

export const longContentInboxArgs = {
  messages: messageScenarios.longContent,
  totalMessages: messageScenarios.longContent.length,
} satisfies Partial<InboxProps>;

export const moreToLoadInboxArgs = {
  pagination: { hasMore: true, isLoadingMore: false, onLoadMore: noop },
} satisfies Partial<InboxProps>;

export const loadingMoreInboxArgs = {
  pagination: { hasMore: true, isLoadingMore: true, onLoadMore: noop },
} satisfies Partial<InboxProps>;

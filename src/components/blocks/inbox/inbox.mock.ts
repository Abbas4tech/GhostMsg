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
  bulkActions: { isPending: false, onAction: noop, onExport: noop },
  cardActions: {
    onOpenBlock: noop,
    onOpenDelete: noop,
    onOpenReply: noop,
    onOpenStoryCard: noop,
    onReveal: noop,
    onStarToggle: noop,
  },
  filters: {
    activeStatus: "all",
    counts: mixedMessageCounts,
    onSearchChange: noop,
    onStatusChange: noop,
    searchQuery: "",
  },
  focusedId: null,
  isLoading: false,
  isRefreshing: false,
  isSenderBlocked: (hash?: string) => hash === "hash-sender-2",
  /** Fetched just now: "2 unread · last checked a moment ago". */
  lastCheckedAt: new Date(fixtureDate()).getTime() + 3 * 60 * 60 * 1000,
  messages: visible(messageScenarios.mixed),
  /** Three hours after the newest fixture, so ages render as 3h, 6h, 1d… */
  now: new Date(new Date(fixtureDate()).getTime() + 3 * 60 * 60 * 1000),
  onCopyLink: noop,
  onRefresh: noop,
  onViewModeChange: noop,
  revealedIds: [],
  selection: { onClear: noop, onToggle: noop, selectedIds: [] },
  totalMessages: messageScenarios.mixed.length,
  viewMode: "grid",
};

export const loadingInboxArgs = {
  isLoading: true,
  messages: [],
} satisfies Partial<InboxProps>;

export const emptyInboxArgs = {
  messages: [],
  totalMessages: 0,
} satisfies Partial<InboxProps>;

/**
 * An empty result while the inbox has messages. Pair it with one of the
 * filter overrides below (spread onto the story's spied `filters`):
 * design Feedback board, "Empty · four situations".
 */
export const noMatchesInboxArgs = {
  messages: [],
  totalMessages: messageScenarios.mixed.length,
} satisfies Partial<InboxProps>;

/** "Nothing unread" with Clear filter. */
export const unreadFilterOverride = {
  activeStatus: "unread",
} satisfies Partial<InboxProps["filters"]>;

/** `No matches for "jacket"`. */
export const searchFilterOverride = {
  searchQuery: "jacket",
} satisfies Partial<InboxProps["filters"]>;

/** "Nothing held back". */
export const quarantinedFilterOverride = {
  activeStatus: "quarantined",
} satisfies Partial<InboxProps["filters"]>;

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

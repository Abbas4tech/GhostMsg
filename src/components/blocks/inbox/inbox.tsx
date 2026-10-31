"use client";

import {
  ArrowUp,
  Check,
  ChevronLeft,
  Copy,
  Ghost,
  Inbox as InboxIcon,
  LayoutGrid,
  LayoutList,
  RefreshCw,
  Search,
  ShieldCheck,
  X,
} from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/elements/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/elements/empty";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/elements/input-group";
import { Kbd } from "@/components/elements/kbd";
import { Skeleton } from "@/components/elements/skeleton";
import { Spinner } from "@/components/elements/spinner";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/elements/toggle-group";
import {
  type BulkAction,
  BulkActionToolbar,
} from "@/components/patterns/bulk-action-toolbar";
import {
  FilterBar,
  type MessageFilterCounts,
  type MessageFilterStatus,
} from "@/components/patterns/filter-bar";
import {
  MessageCard,
  type MessageCardProps,
} from "@/components/patterns/message-card";
import {
  MobileHeaderAction,
  MobileHeaderActions,
  MobileHeaderLeading,
} from "@/components/patterns/mobile-header-actions";
import { useIsMobile } from "@/hooks/use-mobile";
import { formatLastChecked } from "@/lib/format/relative-time";
import type { MessageExportFormat } from "@/lib/messages/export";
import { cn } from "@/lib/utils";
import type { MessageDto } from "@/types/api";

export type InboxViewMode = "grid" | "list";

export interface InboxFilters {
  activeStatus: MessageFilterStatus;
  counts: MessageFilterCounts;
  onSearchChange: (query: string) => void;
  onStatusChange: (status: MessageFilterStatus) => void;
  searchQuery: string;
}

export interface InboxSelection {
  onClear: () => void;
  /** Phones' selection bar "Select all" (every loaded message in this view). */
  onSelectAll?: () => void;
  onToggle: (messageId: string) => void;
  selectedIds: string[];
}

export interface InboxBulkActions {
  isPending?: boolean;
  onAction: (action: BulkAction) => void;
  /** Quarantined view: "Delete all quarantined" (confirms, then deletes). */
  onDeleteAll?: () => void;
  onExport: (format: MessageExportFormat) => void;
}

export type InboxCardActions = Pick<
  MessageCardProps,
  | "onOpenBlock"
  | "onOpenDelete"
  | "onOpenReply"
  | "onOpenStoryCard"
  | "onReveal"
  | "onSeen"
  | "onStarToggle"
  | "onToggleRead"
>;

/** Server paging: the inbox loads one page at a time. */
export interface InboxPagination {
  hasMore: boolean;
  isLoadingMore?: boolean;
  onLoadMore: () => void;
}

export interface InboxProps {
  bulkActions: InboxBulkActions;
  cardActions: InboxCardActions;
  /** Blur Spicy messages until revealed (Settings → Safety). */
  concealSpicy?: boolean;
  filters: InboxFilters;
  /** Message under the j/k keyboard cursor. */
  focusedId?: string | null;
  /** First load: shows skeleton cards. */
  isLoading?: boolean;
  isRefreshing?: boolean;
  isSenderBlocked?: (senderHash?: string) => boolean;
  /** Last server response (ms): "· last checked a moment ago". */
  lastCheckedAt?: number | null;
  /** Loaded messages for the current filter and search. */
  messages: MessageDto[];
  /** Reference time for message ages (stories pin it). */
  now?: Date;
  /** Empty inbox: copy the Public Profile Link. */
  onCopyLink?: () => void;
  onRefresh: () => void;
  onViewModeChange: (mode: InboxViewMode) => void;
  /** "Load more" below the list when the server has more pages. */
  pagination?: InboxPagination;
  /** Quarantined messages the recipient chose to reveal. */
  revealedIds?: string[];
  /** id of the search input, so "/" can focus it. */
  searchInputId?: string;
  selection: InboxSelection;
  /** Total messages before filtering (drives the empty state). */
  totalMessages: number;
  viewMode: InboxViewMode;
}

export const INBOX_SEARCH_INPUT_ID = "inbox-search";

const VIEW_MODES: {
  icon: typeof LayoutGrid;
  label: string;
  mode: InboxViewMode;
}[] = [
  { icon: LayoutGrid, label: "Grid view", mode: "grid" },
  { icon: LayoutList, label: "List view", mode: "list" },
];

const KEYBOARD_HINTS = [
  { keys: ["j", "k"], label: "move" },
  { keys: ["x"], label: "select" },
  { keys: ["s"], label: "star" },
  { keys: ["r"], label: "reply" },
  { keys: ["e"], label: "archive" },
  { keys: ["⌘K"], label: "command" },
  { keys: ["?"], label: "all shortcuts" },
] as const;

const SKELETON_KEYS = ["s1", "s2", "s3", "s4", "s5", "s6"] as const;

const neverBlocked = (): boolean => false;

const describeUnread = (unread: number): string =>
  unread > 0 ? `${unread} unread` : "All caught up";

const CLOCK_TICK_MS = 60 * 1000;

/** `now` when pinned (stories), else a clock that ticks once a minute. */
function useMinuteClock(pinned?: Date): Date {
  const [now, setNow] = useState(() => pinned ?? new Date());
  useEffect(() => {
    if (pinned) {
      setNow(pinned);
      return;
    }
    const timer = setInterval(() => setNow(new Date()), CLOCK_TICK_MS);
    return () => clearInterval(timer);
  }, [pinned]);
  return now;
}

/** Empty filter copy (design Feedback board, "Empty · four situations"). */
const EMPTY_FILTER_COPY: Partial<
  Record<MessageFilterStatus, { description: string; title: string }>
> = {
  answered: {
    description: "Messages you answer show up here.",
    title: "Nothing answered yet",
  },
  archived: {
    description: "Archived messages land here.",
    title: "Nothing archived",
  },
  starred: {
    description: "Star a message to keep it close.",
    title: "Nothing starred",
  },
  unread: { description: "You're all caught up.", title: "Nothing unread" },
};

const FALLBACK_EMPTY_COPY = {
  description: "No messages match this filter.",
  title: "Nothing here",
};

function ViewModeToggle({
  value,
  onChange,
}: {
  onChange: (mode: InboxViewMode) => void;
  value: InboxViewMode;
}): React.JSX.Element {
  const handleValueChange = useCallback(
    (next: string) => {
      if (next === "grid" || next === "list") {
        onChange(next);
      }
    },
    [onChange]
  );

  return (
    <ToggleGroup
      aria-label="Layout"
      onValueChange={handleValueChange}
      type="single"
      value={value}
      variant="segment"
    >
      {VIEW_MODES.map(({ mode, label, icon: Icon }) => (
        <ToggleGroupItem
          aria-label={label}
          key={mode}
          title={label}
          value={mode}
        >
          <Icon />
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}

/**
 * Design Feedback board, "Empty · four situations": first run (floating
 * ghost + Copy link), an empty filter (Clear filter), nothing quarantined,
 * and no search matches. Only the first run moves.
 */
function InboxEmptyState({
  activeStatus,
  hasAnyMessages,
  onCopyLink,
  onClearFilters,
  searchQuery,
}: {
  activeStatus: MessageFilterStatus;
  hasAnyMessages: boolean;
  onClearFilters: () => void;
  onCopyLink?: () => void;
  searchQuery: string;
}): React.JSX.Element {
  const query = searchQuery.trim();

  if (!(hasAnyMessages || query)) {
    return (
      <Empty className="bg-brand-mist">
        <EmptyHeader>
          <EmptyMedia
            className="size-24 rounded-t-[48px] rounded-b-[14px] bg-accent text-accent-foreground motion-safe:animate-float [&_svg:not([class*='size-'])]:size-11"
            variant="icon"
          >
            <Ghost />
          </EmptyMedia>
          <EmptyTitle className="font-display text-h2">
            No Anonymous Messages yet
          </EmptyTitle>
          <EmptyDescription>
            Share your link to get the first one.
          </EmptyDescription>
        </EmptyHeader>
        {onCopyLink ? (
          <EmptyContent>
            <Button className="rounded-full" onClick={onCopyLink}>
              <Copy data-icon="inline-start" />
              Copy link
            </Button>
          </EmptyContent>
        ) : null}
      </Empty>
    );
  }

  if (query) {
    return (
      <Empty className="bg-muted">
        <EmptyHeader>
          <EmptyMedia className="text-muted-foreground [&_svg]:size-8">
            <Search />
          </EmptyMedia>
          <EmptyTitle className="text-title">
            No matches for &ldquo;{query}&rdquo;
          </EmptyTitle>
          <EmptyDescription>
            Search looks at message text only.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  if (activeStatus === "quarantined") {
    return (
      <Empty className="bg-muted">
        <EmptyHeader>
          <EmptyMedia className="text-success [&_svg]:size-8">
            <ShieldCheck />
          </EmptyMedia>
          <EmptyTitle className="text-title">Nothing held back</EmptyTitle>
          <EmptyDescription>No Quarantined Messages. Nice.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  const copy = EMPTY_FILTER_COPY[activeStatus] ?? FALLBACK_EMPTY_COPY;
  return (
    <Empty className="bg-muted">
      <EmptyHeader>
        <EmptyMedia className="text-muted-foreground [&_svg]:size-8">
          <InboxIcon />
        </EmptyMedia>
        <EmptyTitle className="text-title">{copy.title}</EmptyTitle>
        <EmptyDescription>{copy.description}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button
          className="rounded-full"
          onClick={onClearFilters}
          size="sm"
          variant="outline"
        >
          Clear filter
        </Button>
      </EmptyContent>
    </Empty>
  );
}

/**
 * Phones (design MobInbox): search collapses behind a top-bar icon, and
 * checkboxes only show in selection mode, entered from the top bar. Purely
 * visual state, so it lives here rather than in the page controller.
 */
function useInboxPhoneState({
  isMobile,
  onClearSelection,
  onSearchChange,
  searchQuery,
  selectedCount,
}: {
  isMobile: boolean;
  onClearSelection: () => void;
  onSearchChange: (query: string) => void;
  searchQuery: string;
  selectedCount: number;
}) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSelectMode, setIsSelectMode] = useState(false);
  const showSearch = !isMobile || isSearchOpen || searchQuery !== "";

  const handleToggleSearch = useCallback(() => {
    if (showSearch) {
      setIsSearchOpen(false);
      onSearchChange("");
    } else {
      setIsSearchOpen(true);
    }
  }, [showSearch, onSearchChange]);
  const handleStartSelecting = useCallback(() => {
    setIsSelectMode(true);
  }, []);
  const handleExitSelecting = useCallback(() => {
    setIsSelectMode(false);
    onClearSelection();
  }, [onClearSelection]);

  return {
    autoFocusSearch: isMobile && isSearchOpen,
    handleExitSelecting,
    handleStartSelecting,
    handleToggleSearch,
    isSelecting: isMobile && (isSelectMode || selectedCount > 0),
    showSearch,
  };
}

/** Desktop header tools: search, grid/list toggle and refresh. */
function InboxDesktopTools({
  isRefreshing,
  onRefresh,
  onViewModeChange,
  searchField,
  viewMode,
}: {
  isRefreshing: boolean;
  onRefresh: () => void;
  onViewModeChange: (mode: InboxViewMode) => void;
  searchField: React.ReactNode;
  viewMode: InboxViewMode;
}): React.JSX.Element {
  return (
    <div className="flex w-full flex-wrap items-center gap-2.5 sm:w-auto">
      {searchField}
      <ViewModeToggle onChange={onViewModeChange} value={viewMode} />
      <Button
        aria-label="Refresh"
        className="size-11 rounded-full"
        disabled={isRefreshing}
        onClick={onRefresh}
        size="icon"
        title="Refresh"
        variant="outline"
      >
        <RefreshCw
          aria-hidden="true"
          className={cn(isRefreshing && "animate-spin")}
        />
      </Button>
    </div>
  );
}

/**
 * Phones: Search + Select in the shell's top bar, and while selecting, the
 * design's "N selected · Select all" bar over it.
 */
function InboxPhoneChrome({
  isQuarantineView,
  isSelecting,
  onBackToInbox,
  onExitSelecting,
  onSelectAll,
  onStartSelecting,
  onToggleSearch,
  selectedCount,
  showSearch,
}: {
  isQuarantineView: boolean;
  isSelecting: boolean;
  onBackToInbox: () => void;
  onExitSelecting: () => void;
  onSelectAll?: () => void;
  onStartSelecting: () => void;
  onToggleSearch: () => void;
  selectedCount: number;
  showSearch: boolean;
}): React.JSX.Element {
  if (isQuarantineView) {
    return (
      <MobileHeaderLeading>
        <MobileHeaderAction label="Back to inbox" onClick={onBackToInbox}>
          <ChevronLeft className="size-[22px]" />
        </MobileHeaderAction>
      </MobileHeaderLeading>
    );
  }

  return (
    <>
      <MobileHeaderActions>
        <MobileHeaderAction
          label="Search messages"
          onClick={onToggleSearch}
          pressed={showSearch}
        >
          <Search />
        </MobileHeaderAction>
        <MobileHeaderAction
          label="Select messages"
          onClick={onStartSelecting}
          pressed={isSelecting}
        >
          <Check />
        </MobileHeaderAction>
      </MobileHeaderActions>
      {isSelecting ? (
        <div
          aria-label="Selection"
          className="fixed inset-x-0 top-0 z-40 flex min-h-15 items-center gap-1 bg-[color-mix(in_oklch,var(--primary)_8%,var(--background))] py-2 pr-2 pl-1"
          role="toolbar"
        >
          <MobileHeaderAction label="Exit selection" onClick={onExitSelecting}>
            <X />
          </MobileHeaderAction>
          <b aria-live="polite" className="flex-1 text-h3 tabular-nums">
            {selectedCount} selected
          </b>
          {onSelectAll ? (
            <Button
              className="h-11 rounded-full px-3.5"
              onClick={onSelectAll}
              variant="ghost"
            >
              Select all
            </Button>
          ) : null}
        </div>
      ) : null}
    </>
  );
}

/** Title + count line; desktop tools sit on the right. */
function InboxHeading({
  isQuarantineView,
  lastChecked,
  quarantinedCount,
  tools,
  unreadCount,
}: {
  isQuarantineView: boolean;
  /** "a moment ago" (omitted before the first response). */
  lastChecked?: string;
  quarantinedCount: number;
  tools: React.ReactNode;
  unreadCount: number;
}): React.JSX.Element {
  let subtitle = describeUnread(unreadCount);
  if (isQuarantineView) {
    subtitle = `${quarantinedCount} held back · never in your main inbox`;
  } else if (lastChecked) {
    subtitle = `${subtitle} · last checked ${lastChecked}`;
  }
  return (
    <header className="flex flex-wrap items-center justify-between gap-3.5">
      <div>
        <h1 className="text-h1" id="inbox-title">
          {isQuarantineView ? "Quarantined" : "Inbox"}
        </h1>
        <p className="text-muted-foreground text-sm">{subtitle}</p>
      </div>
      {tools}
    </header>
  );
}

/** Quarantined view (design MobQuarantine): reassurance before the cards. */
function QuarantineNotice(): React.JSX.Element {
  return (
    <div className="flex items-start gap-3 rounded-xl border bg-card p-4">
      <ShieldCheck
        aria-hidden="true"
        className="mt-0.5 size-5 shrink-0 text-primary"
      />
      <p className="text-body">
        These were auto-flagged as hurtful or spam. You don&apos;t have to read
        them. Keeping them hidden is always fine.
      </p>
    </div>
  );
}

function DeleteAllQuarantinedButton({
  onClick,
}: {
  onClick: () => void;
}): React.JSX.Element {
  return (
    <div className="flex justify-center">
      <Button
        className="h-11 rounded-full font-semibold text-destructive hover:bg-destructive/10 hover:text-destructive"
        onClick={onClick}
        variant="ghost"
      >
        Delete all quarantined
      </Button>
    </div>
  );
}

/** Design: skeletons appear only after 150ms (no flash on fast loads). */
const SKELETON_DELAY_MS = 150;
/** Scrolled further than this, new messages show the pill instead. */
const PILL_SCROLL_THRESHOLD_PX = 160;

function useDelayedFlag(flag: boolean, delayMs: number): boolean {
  const [delayed, setDelayed] = useState(false);
  useEffect(() => {
    if (!flag) {
      setDelayed(false);
      return;
    }
    const timer = setTimeout(() => setDelayed(true), delayMs);
    return () => clearTimeout(timer);
  }, [flag, delayMs]);
  return delayed;
}

/**
 * Design: "If the list is scrolled, show the '1 new Anonymous Message' pill
 * instead of jumping." Counts messages that arrived above the previous top
 * (Load more adds older ones below, so they never count). Purely visual.
 */
function useNewMessagesPill(messages: MessageDto[]) {
  const topIdRef = useRef<string | null>(null);
  const [unseen, setUnseen] = useState(0);
  const firstId = messages[0] ? String(messages[0]._id) : null;

  useEffect(() => {
    const previousTop = topIdRef.current;
    topIdRef.current = firstId;
    if (!(previousTop && firstId) || previousTop === firstId) {
      return;
    }
    const arrived = messages.findIndex(
      (message) => String(message._id) === previousTop
    );
    if (arrived <= 0 || window.scrollY < PILL_SCROLL_THRESHOLD_PX) {
      return;
    }
    setUnseen((count) => count + arrived);
  }, [firstId, messages]);

  useEffect(() => {
    if (unseen === 0) {
      return;
    }
    const handleScroll = () => {
      if (window.scrollY < PILL_SCROLL_THRESHOLD_PX) {
        setUnseen(0);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [unseen]);

  const handleShowNew = useCallback(() => {
    setUnseen(0);
    window.scrollTo({ behavior: "smooth", top: 0 });
  }, []);

  return { handleShowNew, unseen };
}

function NewMessagesPill({
  count,
  onClick,
}: {
  count: number;
  onClick: () => void;
}): React.JSX.Element | null {
  return (
    <div
      aria-live="polite"
      className="sticky top-16 z-20 flex justify-center md:top-3"
    >
      {count > 0 ? (
        <Button
          className="h-11 rounded-full bg-accent px-5 text-accent-foreground shadow-lift hover:bg-accent/90"
          onClick={onClick}
          variant="secondary"
        >
          <ArrowUp aria-hidden="true" />
          {count === 1
            ? "1 new Anonymous Message"
            : `${count} new Anonymous Messages`}
        </Button>
      ) : null}
    </div>
  );
}

/** Loading skeletons, the cards, "Load more", or the empty state. */
function InboxResults({
  activeStatus,
  cardActions,
  concealSpicy,
  focusedId,
  isLoading,
  isSenderBlocked,
  layout,
  messages,
  now,
  onClearFilters,
  onCopyLink,
  onToggleSelect,
  pagination,
  revealedIds,
  searchQuery,
  selectedIds,
  showSelect,
  totalMessages,
}: {
  activeStatus: MessageFilterStatus;
  cardActions: InboxCardActions;
  concealSpicy: boolean;
  focusedId: string | null;
  isLoading: boolean;
  isSenderBlocked: (senderHash?: string) => boolean;
  layout: InboxViewMode;
  messages: MessageDto[];
  now?: Date;
  onClearFilters: () => void;
  onCopyLink?: () => void;
  onToggleSelect: (messageId: string) => void;
  pagination?: InboxPagination;
  revealedIds: string[];
  searchQuery: string;
  selectedIds: string[];
  showSelect: boolean;
  totalMessages: number;
}): React.JSX.Element | null {
  const showSkeleton = useDelayedFlag(isLoading, SKELETON_DELAY_MS);
  if (isLoading) {
    if (!showSkeleton) {
      return null;
    }
    return (
      <div
        aria-busy="true"
        aria-label="Loading messages"
        className="grid grid-cols-[repeat(auto-fill,minmax(min(300px,100%),1fr))] gap-3.5"
        role="status"
      >
        {SKELETON_KEYS.map((key) => (
          <Skeleton className="h-[188px] rounded-xl" key={key} />
        ))}
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <InboxEmptyState
        activeStatus={activeStatus}
        hasAnyMessages={totalMessages > 0}
        onClearFilters={onClearFilters}
        onCopyLink={onCopyLink}
        searchQuery={searchQuery}
      />
    );
  }

  return (
    <>
      <div
        className={
          layout === "grid"
            ? "grid grid-cols-[repeat(auto-fill,minmax(min(300px,100%),1fr))] gap-3.5"
            : "flex flex-col gap-2"
        }
      >
        {messages.map((message) => {
          const messageId = String(message._id);
          return (
            <MessageCard
              concealSpicy={concealSpicy}
              isFocused={focusedId === messageId}
              isRevealed={revealedIds.includes(messageId)}
              isSelected={selectedIds.includes(messageId)}
              isSenderBlocked={isSenderBlocked(message.senderHash)}
              key={messageId}
              layout={layout}
              message={message}
              now={now}
              onToggleSelect={onToggleSelect}
              showSelect={showSelect}
              {...cardActions}
            />
          );
        })}
      </div>
      {pagination?.hasMore ? (
        <div className="flex justify-center">
          <Button
            className="rounded-full"
            disabled={pagination.isLoadingMore}
            onClick={pagination.onLoadMore}
            variant="outline"
          >
            {pagination.isLoadingMore ? (
              <Spinner data-icon="inline-start" />
            ) : null}
            Load more
          </Button>
        </div>
      ) : null}
    </>
  );
}

/**
 * Pure inbox section: header with search, layout toggle and refresh; filter
 * chips; bulk toolbar; message grid/list; empty and loading states. All data
 * and handlers come from the page (ADR 0015); dialogs live in the page.
 */
export function Inbox({
  messages,
  totalMessages,
  filters,
  selection,
  bulkActions,
  cardActions,
  viewMode,
  onViewModeChange,
  isLoading = false,
  isRefreshing = false,
  onRefresh,
  onCopyLink,
  focusedId = null,
  revealedIds = [],
  concealSpicy = false,
  now,
  pagination,
  searchInputId = INBOX_SEARCH_INPUT_ID,
  isSenderBlocked = neverBlocked,
  lastCheckedAt = null,
}: InboxProps): React.JSX.Element {
  const clock = useMinuteClock(now);
  const handleClearFilters = useCallback(() => {
    filters.onStatusChange("all");
    filters.onSearchChange("");
  }, [filters]);
  const handleSearchChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      filters.onSearchChange(event.target.value);
    },
    [filters]
  );

  const isQuarantineView = filters.activeStatus === "quarantined";
  const { onStatusChange } = filters;
  const handleBackToInbox = useCallback(() => {
    onStatusChange("all");
  }, [onStatusChange]);
  const isMobile = useIsMobile();
  const phone = useInboxPhoneState({
    isMobile,
    onClearSelection: selection.onClear,
    onSearchChange: filters.onSearchChange,
    searchQuery: filters.searchQuery,
    selectedCount: selection.selectedIds.length,
  });
  const layout = isMobile ? "grid" : viewMode;
  const pill = useNewMessagesPill(messages);

  const searchField = (
    <InputGroup
      className="h-11 flex-1 bg-card sm:w-[280px] sm:flex-none"
      shape="pill"
    >
      <InputGroupAddon>
        <Search />
      </InputGroupAddon>
      <InputGroupInput
        aria-label="Search messages"
        autoFocus={phone.autoFocusSearch}
        id={searchInputId}
        onChange={handleSearchChange}
        placeholder="Search Anonymous Messages"
        type="search"
        value={filters.searchQuery}
      />
      <InputGroupAddon align="inline-end" className="hidden sm:flex">
        <Kbd>/</Kbd>
      </InputGroupAddon>
    </InputGroup>
  );

  return (
    <section
      aria-labelledby="inbox-title"
      className="flex flex-col gap-[18px]"
      data-slot="inbox"
    >
      <InboxHeading
        isQuarantineView={isQuarantineView}
        lastChecked={
          lastCheckedAt === null
            ? undefined
            : formatLastChecked(lastCheckedAt, clock)
        }
        quarantinedCount={filters.counts.quarantined}
        tools={
          isMobile ? null : (
            <InboxDesktopTools
              isRefreshing={isRefreshing}
              onRefresh={onRefresh}
              onViewModeChange={onViewModeChange}
              searchField={searchField}
              viewMode={viewMode}
            />
          )
        }
        unreadCount={filters.counts.unread}
      />

      {isMobile ? (
        <InboxPhoneChrome
          isQuarantineView={isQuarantineView}
          isSelecting={phone.isSelecting}
          onBackToInbox={handleBackToInbox}
          onExitSelecting={phone.handleExitSelecting}
          onSelectAll={selection.onSelectAll}
          onStartSelecting={phone.handleStartSelecting}
          onToggleSearch={phone.handleToggleSearch}
          selectedCount={selection.selectedIds.length}
          showSearch={phone.showSearch}
        />
      ) : null}
      {isMobile && phone.showSearch ? searchField : null}

      {isQuarantineView ? <QuarantineNotice /> : null}

      {totalMessages > 0 && !(isMobile && isQuarantineView) ? (
        <FilterBar
          activeStatus={filters.activeStatus}
          counts={filters.counts}
          disabled={phone.isSelecting}
          onStatusChange={filters.onStatusChange}
        />
      ) : null}

      <BulkActionToolbar
        className={isMobile ? undefined : "sticky top-3 z-20"}
        isPending={bulkActions.isPending}
        layout={isMobile ? "bar" : "pill"}
        onAction={bulkActions.onAction}
        onClearSelection={selection.onClear}
        onExport={bulkActions.onExport}
        selectedCount={selection.selectedIds.length}
      />

      <NewMessagesPill count={pill.unseen} onClick={pill.handleShowNew} />

      <InboxResults
        activeStatus={filters.activeStatus}
        cardActions={cardActions}
        concealSpicy={concealSpicy}
        focusedId={focusedId}
        isLoading={isLoading}
        isSenderBlocked={isSenderBlocked}
        layout={layout}
        messages={messages}
        now={now}
        onClearFilters={handleClearFilters}
        onCopyLink={onCopyLink}
        onToggleSelect={selection.onToggle}
        pagination={pagination}
        revealedIds={revealedIds}
        searchQuery={filters.searchQuery}
        selectedIds={selection.selectedIds}
        showSelect={!isMobile || phone.isSelecting}
        totalMessages={totalMessages}
      />

      {isQuarantineView && messages.length > 0 && bulkActions.onDeleteAll ? (
        <DeleteAllQuarantinedButton onClick={bulkActions.onDeleteAll} />
      ) : null}

      <ul
        aria-label="Keyboard shortcuts"
        className="hidden flex-wrap gap-4 pt-1.5 text-muted-foreground text-sm lg:flex"
      >
        {KEYBOARD_HINTS.map(({ keys, label }) => (
          <li className="flex items-center gap-1" key={label}>
            {keys.map((key) => (
              <Kbd key={key}>{key}</Kbd>
            ))}
            <span className="ml-0.5">{label}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

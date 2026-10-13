"use client";

import {
  Copy,
  Ghost,
  LayoutGrid,
  LayoutList,
  RefreshCw,
  Search,
  ShieldCheck,
} from "lucide-react";
import type React from "react";
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
  onToggle: (messageId: string) => void;
  selectedIds: string[];
}

export interface InboxBulkActions {
  isPending?: boolean;
  onAction: (action: BulkAction) => void;
  onExport: (format: MessageExportFormat) => void;
}

export type InboxCardActions = Pick<
  MessageCardProps,
  | "onOpenBlock"
  | "onOpenDelete"
  | "onOpenReply"
  | "onOpenStoryCard"
  | "onReveal"
  | "onStarToggle"
>;

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
  /** Messages after filtering/search. */
  messages: MessageDto[];
  /** Reference time for message ages (stories pin it). */
  now?: Date;
  /** Empty inbox: copy the Public Profile Link. */
  onCopyLink?: () => void;
  onRefresh: () => void;
  onViewModeChange: (mode: InboxViewMode) => void;
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
  { mode: "grid", label: "Grid view", icon: LayoutGrid },
  { mode: "list", label: "List view", icon: LayoutList },
];

const KEYBOARD_HINTS = [
  { keys: ["j", "k"], label: "move" },
  { keys: ["x"], label: "select" },
  { keys: ["s"], label: "star" },
  { keys: ["r"], label: "reply" },
  { keys: ["/"], label: "search" },
  { keys: ["⌘K"], label: "command" },
] as const;

const SKELETON_KEYS = ["s1", "s2", "s3", "s4", "s5", "s6"] as const;

const neverBlocked = (): boolean => false;

const describeUnread = (unread: number): string =>
  unread > 0 ? `${unread} unread` : "All caught up";

function ViewModeToggle({
  value,
  onChange,
}: {
  onChange: (mode: InboxViewMode) => void;
  value: InboxViewMode;
}): React.JSX.Element {
  return (
    <ToggleGroup
      aria-label="Layout"
      onValueChange={(next) => {
        if (next === "grid" || next === "list") {
          onChange(next);
        }
      }}
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

function InboxEmptyState({
  hasAnyMessages,
  onCopyLink,
  onClearFilters,
}: {
  hasAnyMessages: boolean;
  onClearFilters: () => void;
  onCopyLink?: () => void;
}): React.JSX.Element {
  if (hasAnyMessages) {
    return (
      <Empty className="border border-dashed">
        <EmptyHeader>
          <EmptyTitle>Nothing here</EmptyTitle>
          <EmptyDescription>
            No messages match this filter or search.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button
            className="rounded-full"
            onClick={onClearFilters}
            variant="outline"
          >
            Clear filter
          </Button>
        </EmptyContent>
      </Empty>
    );
  }
  return (
    <Empty className="border border-dashed bg-brand-mist">
      <EmptyHeader>
        <EmptyMedia
          className="size-24 rounded-t-[48px] rounded-b-[14px] bg-accent text-accent-foreground motion-safe:animate-float [&_svg:not([class*='size-'])]:size-11"
          variant="icon"
        >
          <Ghost />
        </EmptyMedia>
        <EmptyTitle className="font-bold font-display text-2xl">
          No Anonymous Messages yet
        </EmptyTitle>
        <EmptyDescription>
          Share your Public Profile Link and they will show up here.
        </EmptyDescription>
      </EmptyHeader>
      {onCopyLink ? (
        <EmptyContent>
          <Button className="rounded-full" onClick={onCopyLink}>
            <Copy data-icon="inline-start" />
            Copy my link
          </Button>
        </EmptyContent>
      ) : null}
    </Empty>
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
  searchInputId = INBOX_SEARCH_INPUT_ID,
  isSenderBlocked = neverBlocked,
}: InboxProps): React.JSX.Element {
  const handleClearFilters = () => {
    filters.onStatusChange("all");
    filters.onSearchChange("");
  };

  return (
    <section
      aria-labelledby="inbox-title"
      className="flex flex-col gap-[18px]"
      data-slot="inbox"
    >
      <header className="flex flex-wrap items-center justify-between gap-3.5">
        <div>
          <h1
            className="font-bold text-[34px] leading-tight tracking-tight"
            id="inbox-title"
          >
            Inbox
          </h1>
          <p className="text-muted-foreground text-sm">
            {describeUnread(filters.counts.unread)}
          </p>
        </div>

        <div className="flex w-full flex-wrap items-center gap-2.5 sm:w-auto">
          <InputGroup
            className="h-11 flex-1 bg-card sm:w-[280px] sm:flex-none"
            shape="pill"
          >
            <InputGroupAddon>
              <Search />
            </InputGroupAddon>
            <InputGroupInput
              aria-label="Search messages"
              id={searchInputId}
              onChange={(event) => filters.onSearchChange(event.target.value)}
              placeholder="Search Anonymous Messages"
              type="search"
              value={filters.searchQuery}
            />
            <InputGroupAddon align="inline-end" className="hidden sm:flex">
              <Kbd>/</Kbd>
            </InputGroupAddon>
          </InputGroup>
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
      </header>

      {totalMessages > 0 ? (
        <FilterBar
          activeStatus={filters.activeStatus}
          counts={filters.counts}
          onStatusChange={filters.onStatusChange}
        />
      ) : null}

      <BulkActionToolbar
        className="sticky top-3 z-20"
        isPending={bulkActions.isPending}
        onAction={bulkActions.onAction}
        onClearSelection={selection.onClear}
        onExport={bulkActions.onExport}
        selectedCount={selection.selectedIds.length}
      />

      {isLoading ? (
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
      ) : null}

      {!isLoading && messages.length > 0 ? (
        <div
          className={
            viewMode === "grid"
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
                isSelected={selection.selectedIds.includes(messageId)}
                isSenderBlocked={isSenderBlocked(message.senderHash)}
                key={messageId}
                layout={viewMode}
                message={message}
                now={now}
                onToggleSelect={selection.onToggle}
                {...cardActions}
              />
            );
          })}
        </div>
      ) : null}

      {!isLoading && messages.length === 0 ? (
        <InboxEmptyState
          hasAnyMessages={totalMessages > 0}
          onClearFilters={handleClearFilters}
          onCopyLink={onCopyLink}
        />
      ) : null}

      {filters.activeStatus === "quarantined" ? (
        <p className="flex items-center gap-2 text-muted-foreground text-sm">
          <ShieldCheck aria-hidden="true" className="size-4" />
          Quarantined Messages are blurred. Nothing here reaches your main
          inbox.
        </p>
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

export default Inbox;

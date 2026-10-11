"use client";

import { LayoutGrid, LayoutList, MessageSquare, RefreshCw } from "lucide-react";
import type React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/elements/card";
import { LiquidButton } from "@/components/elements/liquid-button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/elements/tooltip";
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
import type { MessageExportFormat } from "@/lib/export-messages";
import { cn } from "@/lib/utils";
import type { Message } from "@/model/user.model";

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
  | "onStarToggle"
>;

export interface InboxProps {
  bulkActions: InboxBulkActions;
  cardActions: InboxCardActions;
  filters: InboxFilters;
  isRefreshing?: boolean;
  isSenderBlocked?: (senderHash?: string) => boolean;
  /** Messages after filtering/search. */
  messages: Message[];
  onRefresh: () => void;
  onViewModeChange: (mode: InboxViewMode) => void;
  selection: InboxSelection;
  /** Total messages before filtering (drives header copy + empty state). */
  totalMessages: number;
  viewMode: InboxViewMode;
}

const VIEW_MODES: {
  icon: typeof LayoutGrid;
  label: string;
  mode: InboxViewMode;
}[] = [
  { mode: "grid", label: "Grid view", icon: LayoutGrid },
  { mode: "list", label: "List view", icon: LayoutList },
];

const neverBlocked = (): boolean => false;

function ViewModeToggle({
  value,
  onChange,
}: {
  onChange: (mode: InboxViewMode) => void;
  value: InboxViewMode;
}): React.JSX.Element {
  return (
    <div className="flex items-center rounded-md border p-0.5">
      {VIEW_MODES.map(({ mode, label, icon: Icon }) => (
        <Tooltip key={mode}>
          <TooltipTrigger asChild>
            <button
              aria-label={label}
              aria-pressed={value === mode}
              className={cn(
                "rounded p-1.5 transition-colors",
                value === mode
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
              onClick={() => onChange(mode)}
              type="button"
            >
              <Icon className="h-4 w-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent>{label}</TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
}

function InboxEmptyState({
  hasAnyMessages,
}: {
  hasAnyMessages: boolean;
}): React.JSX.Element {
  return (
    <div className="py-12 text-center">
      <MessageSquare className="mx-auto mb-4 h-12 w-12 text-muted-foreground/40" />
      <h3 className="mb-2 font-medium text-lg">
        {hasAnyMessages ? "No matching messages found" : "No messages yet"}
      </h3>
      <p className="mb-4 text-muted-foreground text-sm">
        {hasAnyMessages
          ? "Try adjusting your search query or active filter chips"
          : "Share your profile link to start receiving anonymous messages"}
      </p>
    </div>
  );
}

const describeTotal = (total: number): string =>
  total > 0
    ? `You have ${total} total message${total === 1 ? "" : "s"}`
    : "You haven't received any messages yet";

/**
 * Pure inbox section: header with view toggle + refresh, filter bar, message
 * grid/list and the floating bulk toolbar. All data and handlers come from
 * the page (ADR 0015); dialogs are rendered by the page, not here.
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
  isRefreshing = false,
  onRefresh,
  isSenderBlocked = neverBlocked,
}: InboxProps): React.JSX.Element {
  return (
    <Card data-slot="inbox">
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle>Your Messages</CardTitle>
          <CardDescription className="mt-1">
            {describeTotal(totalMessages)}
          </CardDescription>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <ViewModeToggle onChange={onViewModeChange} value={viewMode} />

          <LiquidButton
            className="gap-0"
            disabled={isRefreshing}
            onClick={onRefresh}
          >
            <RefreshCw
              className={cn("h-4 w-4", isRefreshing && "animate-spin")}
            />
            <span className="ml-2">Refresh</span>
          </LiquidButton>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {totalMessages > 0 && <FilterBar {...filters} />}

        {messages.length > 0 ? (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 gap-4 md:grid-cols-2"
                : "flex flex-col gap-3"
            }
          >
            {messages.map((message) => {
              const messageId = String(message._id);
              return (
                <MessageCard
                  isSelected={selection.selectedIds.includes(messageId)}
                  isSenderBlocked={isSenderBlocked(message.senderHash)}
                  key={messageId}
                  message={message}
                  onToggleSelect={selection.onToggle}
                  {...cardActions}
                />
              );
            })}
          </div>
        ) : (
          <InboxEmptyState hasAnyMessages={totalMessages > 0} />
        )}
      </CardContent>

      <BulkActionToolbar
        isPending={bulkActions.isPending}
        onAction={bulkActions.onAction}
        onClearSelection={selection.onClear}
        onExport={bulkActions.onExport}
        selectedCount={selection.selectedIds.length}
      />
    </Card>
  );
}

export default Inbox;

"use client";

import { Download, Eye, Star, Trash2, X } from "lucide-react";
import type React from "react";
import { useCallback } from "react";
import { Button } from "@/components/elements/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/elements/dropdown-menu";
import type { MessageExportFormat } from "@/lib/messages/export";
import { cn } from "@/lib/utils";

export type BulkAction = "delete" | "read" | "star";

export interface BulkActionToolbarProps {
  className?: string;
  isPending?: boolean;
  /**
   * "pill": the floating dark toolbar (desktop). "bar": phones, a bottom bar
   * over the tab bar with four icon-over-label actions; the count and
   * "Clear" live in the selection header instead.
   */
  layout?: "bar" | "pill";
  onAction: (action: BulkAction) => void;
  onClearSelection: () => void;
  onExport: (format: MessageExportFormat) => void;
  selectedCount: number;
}

const toolbarButton =
  "rounded-full text-background hover:bg-background/15 hover:text-background";
const barButton =
  "flex min-h-14 flex-col items-center justify-center gap-1 rounded-[14px] font-semibold text-foreground text-xs outline-none transition-colors hover:bg-muted focus-visible:bg-muted disabled:opacity-50 [&_svg]:size-5";

/** Dark pill that appears while messages are selected. */
export function BulkActionToolbar({
  selectedCount,
  isPending = false,
  onAction,
  onExport,
  onClearSelection,
  className,
  layout = "pill",
}: BulkActionToolbarProps): React.JSX.Element | null {
  const handleMarkRead = useCallback(() => {
    onAction("read");
  }, [onAction]);
  const handleStar = useCallback(() => {
    onAction("star");
  }, [onAction]);
  const handleDelete = useCallback(() => {
    onAction("delete");
  }, [onAction]);
  const handleExportCsv = useCallback(() => {
    onExport("csv");
  }, [onExport]);
  const handleExportJson = useCallback(() => {
    onExport("json");
  }, [onExport]);

  if (selectedCount === 0) {
    return null;
  }

  if (layout === "bar") {
    return (
      <div
        aria-label="Bulk actions"
        className={cn(
          "fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t bg-card px-2 pt-1.5 pb-[calc(6px+env(safe-area-inset-bottom))]",
          className
        )}
        data-slot="bulk-action-toolbar"
        role="toolbar"
      >
        <button
          className={barButton}
          disabled={isPending}
          onClick={handleMarkRead}
          type="button"
        >
          <Eye aria-hidden="true" />
          Mark read
        </button>
        <button
          className={barButton}
          disabled={isPending}
          onClick={handleStar}
          type="button"
        >
          <Star aria-hidden="true" />
          Star
        </button>
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <button className={barButton} type="button">
              <Download aria-hidden="true" />
              Export
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side="top">
            <DropdownMenuGroup>
              <DropdownMenuLabel>Download selected as</DropdownMenuLabel>
              <DropdownMenuItem onSelect={handleExportCsv}>
                CSV
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={handleExportJson}>
                JSON
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
        <button
          aria-label="Delete selected"
          className={cn(barButton, "text-destructive")}
          disabled={isPending}
          onClick={handleDelete}
          type="button"
        >
          <Trash2 aria-hidden="true" />
          Delete
        </button>
      </div>
    );
  }

  return (
    <div
      aria-label="Bulk actions"
      className={cn(
        "flex flex-wrap items-center gap-1 rounded-full bg-foreground py-1.5 pr-1.5 pl-4 text-background shadow-lift motion-safe:animate-rise sm:gap-2",
        className
      )}
      data-slot="bulk-action-toolbar"
      role="toolbar"
    >
      <span className="font-bold text-sm tabular-nums">
        {selectedCount} selected
      </span>
      <span className="flex-1" />

      <Button
        aria-label="Mark read"
        className={toolbarButton}
        disabled={isPending}
        onClick={handleMarkRead}
        size="sm"
        variant="ghost"
      >
        <Eye aria-hidden="true" />
        <span className="hidden sm:inline">Mark read</span>
      </Button>

      <Button
        aria-label="Star"
        className={toolbarButton}
        disabled={isPending}
        onClick={handleStar}
        size="sm"
        variant="ghost"
      >
        <Star aria-hidden="true" />
        <span className="hidden sm:inline">Star</span>
      </Button>

      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            aria-label="Export"
            className={toolbarButton}
            size="sm"
            variant="ghost"
          >
            <Download aria-hidden="true" />
            <span className="hidden sm:inline">Export CSV / JSON</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuGroup>
            <DropdownMenuLabel>Download selected as</DropdownMenuLabel>
            <DropdownMenuItem onSelect={handleExportCsv}>CSV</DropdownMenuItem>
            <DropdownMenuItem onSelect={handleExportJson}>
              JSON
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <Button
        aria-label="Delete selected"
        className="rounded-full"
        disabled={isPending}
        onClick={handleDelete}
        size="sm"
        variant="destructive"
      >
        <Trash2 aria-hidden="true" />
        <span className="hidden sm:inline">Delete</span>
      </Button>

      <Button
        aria-label="Clear selection"
        className={toolbarButton}
        onClick={onClearSelection}
        size="icon-sm"
        variant="ghost"
      >
        <X aria-hidden="true" />
      </Button>
    </div>
  );
}

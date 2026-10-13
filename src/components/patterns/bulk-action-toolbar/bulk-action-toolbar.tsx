"use client";

import { Download, Eye, Star, Trash2, X } from "lucide-react";
import type React from "react";
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
  onAction: (action: BulkAction) => void;
  onClearSelection: () => void;
  onExport: (format: MessageExportFormat) => void;
  selectedCount: number;
}

const toolbarButton =
  "rounded-full text-background hover:bg-background/15 hover:text-background";

/** Dark pill that appears while messages are selected. */
export function BulkActionToolbar({
  selectedCount,
  isPending = false,
  onAction,
  onExport,
  onClearSelection,
  className,
}: BulkActionToolbarProps): React.JSX.Element | null {
  if (selectedCount === 0) {
    return null;
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
        onClick={() => onAction("read")}
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
        onClick={() => onAction("star")}
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
            <DropdownMenuItem onSelect={() => onExport("csv")}>
              CSV
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => onExport("json")}>
              JSON
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <Button
        aria-label="Delete selected"
        className="rounded-full"
        disabled={isPending}
        onClick={() => onAction("delete")}
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

export default BulkActionToolbar;

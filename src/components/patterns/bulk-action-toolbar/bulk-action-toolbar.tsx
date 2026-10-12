"use client";

import { CheckCheck, Download, Star, Trash2, X } from "lucide-react";
import type React from "react";
import { Button } from "@/components/elements/button";
import type { MessageExportFormat } from "@/lib/messages/export";

export type BulkAction = "delete" | "read" | "star";

export interface BulkActionToolbarProps {
  isPending?: boolean;
  onAction: (action: BulkAction) => void;
  onClearSelection: () => void;
  onExport: (format: MessageExportFormat) => void;
  selectedCount: number;
}

export function BulkActionToolbar({
  selectedCount,
  isPending = false,
  onAction,
  onExport,
  onClearSelection,
}: BulkActionToolbarProps): React.JSX.Element | null {
  if (selectedCount === 0) {
    return null;
  }

  return (
    <div
      className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full border bg-background/95 px-4 py-2.5 shadow-2xl backdrop-blur-md"
      data-slot="bulk-action-toolbar"
    >
      <span className="font-semibold text-muted-foreground text-xs">
        {selectedCount} selected
      </span>

      <div className="h-4 w-px bg-border" />

      <Button
        className="h-7 text-xs"
        disabled={isPending}
        onClick={() => onAction("read")}
        size="sm"
        variant="ghost"
      >
        <CheckCheck className="mr-1 h-3.5 w-3.5 text-blue-500" /> Read
      </Button>

      <Button
        className="h-7 text-xs"
        disabled={isPending}
        onClick={() => onAction("star")}
        size="sm"
        variant="ghost"
      >
        <Star className="mr-1 h-3.5 w-3.5 text-yellow-500" /> Star
      </Button>

      <Button
        className="h-7 text-xs"
        onClick={() => onExport("csv")}
        size="sm"
        variant="ghost"
      >
        <Download className="mr-1 h-3.5 w-3.5" /> CSV
      </Button>

      <Button
        className="h-7 text-xs"
        onClick={() => onExport("json")}
        size="sm"
        variant="ghost"
      >
        <Download className="mr-1 h-3.5 w-3.5" /> JSON
      </Button>

      <Button
        className="h-7 text-destructive text-xs hover:bg-destructive/10"
        disabled={isPending}
        onClick={() => onAction("delete")}
        size="sm"
        variant="ghost"
      >
        <Trash2 className="mr-1 h-3.5 w-3.5" /> Delete
      </Button>

      <div className="h-4 w-px bg-border" />

      <Button
        aria-label="Clear selection"
        className="h-6 w-6 p-0"
        onClick={onClearSelection}
        size="icon"
        variant="ghost"
      >
        <X className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}

export default BulkActionToolbar;
